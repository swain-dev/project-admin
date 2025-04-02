import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  Alert,
  Card,
  CardMedia,
  IconButton,
  Tooltip,
  LinearProgress,
  Divider,
  InputAdornment,
  Stack,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Upload as UploadIcon,
  DeleteOutline as DeleteOutlineIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import moment from 'moment';
import 'moment/locale/vi'; // Import tiếng Việt cho moment
import axiosInstance from 'src/utils/axios';
import ReactQuill from 'react-quill'; // Import Rich Text Editor
import 'react-quill/dist/quill.snow.css'; // Import styles for the editor

moment.locale('vi'); // Thiết lập tiếng Việt

// Rich text editor configuration
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'color': [] }, { 'background': [] }],
    ['link', 'image'],
    ['clean']
  ],
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'color', 'background',
  'link', 'image'
];

export default function NewsForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode
  console.log(id)
  const fileInputRef = useRef(null);
  
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    publish_date: moment(),
    featured_article: false,
    view_count: 0,
  });
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch article data for edit mode
  useEffect(() => {
    const fetchArticle = async () => {
      if (!isEditMode) return;
      
      try {
        setLoading(true);
        setError('');
        
        // Thay đổi từ /api/articles thành /api/news
        const response = await axiosInstance.get(`/news/${id}?populate=cover_image`);
        
        if (response.data && response.data) {
          const article = response.data;
          
          setFormData({
            title: article.title || '',
            content: article.content || '',
            summary: article.summary || '',
            publish_date: article.publish_date ? moment(article.publish_date) : moment(),
            featured_article: article.featured_article || false,
            view_count: article.view_count || 0,
          });
          
          // Set cover image preview if exists
          if (article.cover_image?.url) {
            console.log(article)
            const imageUrl = article.cover_image.url;
            setCoverImagePreview(imageUrl);
          }
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Không thể tải thông tin bài viết. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id, isEditMode]);

  // Handle text field changes
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'featured_article' ? checked : value
    }));
  };

  // Handle rich text editor changes
  const handleEditorChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content: content
    }));
  };

  // Handle date picker changes
  const handleDateChange = (newDate) => {
    setFormData(prev => ({
      ...prev,
      publish_date: newDate
    }));
  };

  // Handle cover image changes
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Kiểm tra kích thước file (giới hạn 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setError(`Kích thước ảnh vượt quá giới hạn cho phép (5MB). Kích thước hiện tại: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      e.target.value = ''; // Reset input
      return;
    }
    
    // Kiểm tra định dạng file
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Định dạng ảnh không hỗ trợ. Vui lòng sử dụng JPG, PNG, GIF hoặc WebP.');
      e.target.value = ''; // Reset input
      return;
    }
    
    setCoverImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    setError(''); // Xóa thông báo lỗi nếu có
  };

  // Remove cover image
  const handleRemoveCoverImage = () => {
    setCoverImage(null);
    setCoverImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
  
    try {
      let coverImageId = null;
  
      // Upload cover image if selected
      if (coverImage) {
        const uploadFormData = new FormData();
        uploadFormData.append('files', coverImage);
        
        try {
          // Gửi request upload file
          const uploadResponse = await axiosInstance.post('/upload', uploadFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          
          console.log('Upload response:', uploadResponse);
          
          // Xử lý response upload
          if (Array.isArray(uploadResponse) && uploadResponse.length > 0) {
            coverImageId = uploadResponse[0].id;
          }
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          setError(`Lỗi khi tải ảnh lên: ${uploadError.message}`);
          setSubmitting(false);
          return; // Dừng xử lý nếu có lỗi upload
        }
      }
  
      // Chuẩn bị dữ liệu bài viết
      const articleData = {
        data: {
          title: formData.title,
          content: formData.content,
          summary: formData.summary,
          publish_date: formData.publish_date.format(),
          featured_article: formData.featured_article,
          view_count: parseInt(formData.view_count) || 0,
        }
      };
  
      // Thêm ID ảnh bìa nếu có upload thành công
      if (coverImageId) {
        articleData.data.cover_image = coverImageId;
      } else if (isEditMode && !coverImage && !coverImagePreview) {
        // Xóa ảnh bìa trong trường hợp edit và người dùng đã xóa ảnh
        articleData.data.cover_image = null;
      }
  
      console.log('Article data to be saved:', articleData);
  
      let response;
      if (isEditMode) {
        // Cập nhật bài viết hiện có
        response = await axiosInstance.put(`/news/${id}`, articleData);
      } else {
        // Tạo bài viết mới
        response = await axiosInstance.post('/news', articleData);
      }
  
      console.log('Save article response:', response);
  
      // Hiển thị thông báo thành công
      setSuccess(`Bài viết đã được ${isEditMode ? 'cập nhật' : 'tạo'} thành công.`);
      
      // Chuyển hướng sau 2 giây
      setTimeout(() => {
        navigate('/blog');
      }, 2000);
    } catch (err) {
      console.error('Error saving article:', err);
      const errorMessage = err.response?.data?.error?.message || err.message || `Không thể ${isEditMode ? 'cập nhật' : 'tạo'} bài viết.`;
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel form
  const handleCancel = () => {
    navigate('/blog');
  };

  // If loading in edit mode
  if (loading && isEditMode) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Paper sx={{ p: 3 }}>
          <LinearProgress />
          <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
            Đang tải thông tin bài viết...
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/news')}
          sx={{ mr: 2 }}
        >
          Quay lại
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}
        </Typography>
      </Box>

      {/* Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Title */}
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Tiêu đề bài viết"
              name="title"
              value={formData.title}
              onChange={handleChange}
              variant="outlined"
              inputProps={{ maxLength: 255 }}
              helperText={`${formData.title.length}/255 ký tự`}
              disabled={submitting}
            />
          </Grid>

          {/* Summary */}
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Tóm tắt bài viết"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={3}
              inputProps={{ maxLength: 500 }}
              helperText={`${formData.summary.length}/500 ký tự`}
              disabled={submitting}
            />
          </Grid>

          {/* Cover Image */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Ảnh bìa bài viết
            </Typography>
            
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleCoverImageChange}
            />
            
            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={() => fileInputRef.current.click()}
                disabled={submitting}
                sx={{ mr: 1 }}
              >
                {coverImagePreview ? 'Đổi ảnh bìa' : 'Tải ảnh bìa'}
              </Button>
              
              {coverImagePreview && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={handleRemoveCoverImage}
                  disabled={submitting}
                >
                  Xóa ảnh bìa
                </Button>
              )}
            </Box>
            
            {coverImagePreview && (
              <Card sx={{ mb: 3, maxWidth: 500 }}>
                <CardMedia
                  component="img"
                  height="280"
                  image={`${coverImagePreview.includes('/uploads') ? 'http://localhost:1337/' : ''}${coverImagePreview}`}
                  alt="Cover Image Preview"
                  sx={{ objectFit: 'contain' }}
                />
              </Card>
            )}
          </Grid>

          {/* Date and Featured Article */}
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DateTimePicker
                label="Ngày xuất bản"
                value={formData.publish_date}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    required 
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <EventIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                )}
                disabled={submitting}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.featured_article}
                    onChange={handleChange}
                    name="featured_article"
                    color="primary"
                    disabled={submitting}
                  />
                }
                label="Bài viết nổi bật"
              />
              
              {isEditMode && (
                <TextField
                  label="Lượt xem"
                  name="view_count"
                  type="number"
                  value={formData.view_count}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  sx={{ ml: 3 }}
                  InputProps={{ inputProps: { min: 0 } }}
                  disabled={submitting}
                />
              )}
            </Box>
          </Grid>

          {/* Content Editor */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Nội dung bài viết
            </Typography>
            <Box sx={{ mb: 3, border: '1px solid #ddd', borderRadius: 1 }}>
              <ReactQuill
                value={formData.content}
                onChange={handleEditorChange}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Nhập nội dung bài viết ở đây..."
                theme="snow"
                style={{ height: '400px' }}
              />
            </Box>
            <Box sx={{ height: 50 }} /> {/* Space for Quill editor toolbar */}
          </Grid>

          {/* Form Actions */}
          <Grid item xs={12}>
            <Divider sx={{ mb: 3 }} />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={submitting}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={submitting || !formData.title || !formData.content || !formData.summary}
              >
                {submitting ? 'Đang lưu...' : isEditMode ? 'Cập nhật bài viết' : 'Tạo bài viết'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}