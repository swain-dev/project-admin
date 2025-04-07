import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Grid,
  Avatar,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
} from '@mui/material';
import {
  PhotoCamera,
  Save,
  Cancel,
  ArrowBack
} from '@mui/icons-material';
import axiosInstance from 'src/utils/axios';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    phone: '',
    address: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Lấy thông tin người dùng hiện tại khi trang được tải
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userFromStorage = JSON.parse(localStorage.getItem('user'));
        const userId = userFromStorage?.id;
        
        if (!userId) {
          throw new Error('Không tìm thấy ID người dùng');
          return;
        }

        const response = await axiosInstance.get(`/users/${userId}?populate=*`);
        
        setFormData({
          username: response.username || '',
          email: response.email || '',
          fullName: response.fullName || '',
          phone: response.phone || '',
          address: response.address || '',
        });
        
        if (response.avatar?.url) {
          setAvatarPreview(response.avatar.url);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const userFromStorage = JSON.parse(localStorage.getItem('user'));
      const userId = userFromStorage?.id;
      
      if (!userId) {
        throw new Error('Không tìm thấy ID người dùng');
      }

      let updatedData = { ...formData };

      // Nếu có tập tin avatar mới
      if (avatarFile) {
        // Tạo FormData để tải lên tập tin
        const formDataForUpload = new FormData();
        formDataForUpload.append('files', avatarFile);
        
        // Tải lên tập tin
        const uploadResponse = await axiosInstance.post('/upload', formDataForUpload);
        
        if (uploadResponse && uploadResponse.length > 0) {
          updatedData.avatar = uploadResponse[0].id;
        }
      }

      // Cập nhật thông tin người dùng
      const response = await axiosInstance.put(`/users/${userId}`, updatedData);
      
      // Cập nhật thông tin trong localStorage
      const updatedUser = {
        ...userFromStorage,
        ...response
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setSuccess('Thông tin hồ sơ đã được cập nhật thành công.');
      
      // Tự động chuyển về trang profile sau khi cập nhật thành công
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err) {
      console.error('Update profile error:', err);
      setError(
        err.response?.data?.error?.message || 'Cập nhật hồ sơ thất bại. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị loading khi đang tải dữ liệu ban đầu
  if (initialLoading) {
    return (
      <Container component="main" maxWidth="md">
        <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', height: 400 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Đang tải thông tin...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Button 
              startIcon={<ArrowBack />} 
              onClick={() => navigate('/profile')}
              sx={{ mr: 2 }}
            >
              Quay lại
            </Button>
            <Typography component="h1" variant="h5">
              Chỉnh sửa thông tin cá nhân
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={avatarPreview}
                    sx={{ width: 150, height: 150 }}
                  >
                    {formData.username ? formData.username.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="avatar-upload"
                    type="file"
                    onChange={handleAvatarChange}
                  />
                  <label htmlFor="avatar-upload">
                    <IconButton
                      color="primary"
                      aria-label="upload picture"
                      component="span"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        backgroundColor: 'white',
                        boxShadow: 1,
                      }}
                    >
                      <PhotoCamera />
                    </IconButton>
                  </label>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                  Nhấn vào biểu tượng camera để thay đổi ảnh đại diện
                </Typography>
              </Grid>

              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  Thông tin tài khoản
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="username"
                      label="Tên đăng nhập"
                      name="username"
                      autoComplete="username"
                      value={formData.username}
                      onChange={handleChange}
                      disabled // Thường không cho phép đổi username
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="email"
                      label="Email"
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled // Thường không cho phép đổi email
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      margin="normal"
                      fullWidth
                      id="fullName"
                      label="Họ và tên"
                      name="fullName"
                      autoComplete="name"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      margin="normal"
                      fullWidth
                      id="phone"
                      label="Số điện thoại"
                      name="phone"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                startIcon={<Cancel />}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={<Save />}
              >
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}