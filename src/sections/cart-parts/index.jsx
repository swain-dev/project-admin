import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  MenuItem,
  Grid
} from '@mui/material';
import axiosInstance from 'src/utils/axios';

// Thay thế các Icon với Unicode hoặc text
const AddIcon = () => <span style={{ fontSize: '1.2rem' }}>➕</span>;
const EditIcon = () => <span style={{ fontSize: '1.2rem' }}>✏️</span>;
const DeleteIcon = () => <span style={{ fontSize: '1.2rem' }}>🗑️</span>;
const CloseIcon = () => <span style={{ fontSize: '1rem' }}>✖</span>;

// Danh sách các loại phụ tùng
const CATEGORIES = [
  "Lọc dầu",
  "Lọc gió",
  "Má phanh",
  "Bugi",
  "Ắc quy",
  "Giảm xóc",
  "Dầu động cơ",
  "Bộ chia điện",
  "Đèn xe",
  "Gương xe",
  "Khác"
];

const CarPartsManagement = () => {
  // State cho danh sách phụ tùng
  const [carParts, setCarParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State cho form thêm/sửa
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPart, setCurrentPart] = useState({
    name: '',
    sku: '',
    brand: '',
    category: '',
    price: '',
    description: '',
    specifications: '',
    warranty: ''
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imageIds, setImageIds] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [previewSources, setPreviewSources] = useState([]);

  // State cho dialog xóa
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [partToDelete, setPartToDelete] = useState(null);

  // State cho snackbar thông báo
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Lấy danh sách phụ tùng khi component mount
  useEffect(() => {
    fetchCarParts();
  }, []);

  // Hàm lấy danh sách phụ tùng từ API
  const fetchCarParts = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/car-parts?populate=*');
      console.log('Car parts response:', response);
      setCarParts(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching car parts:', err);
      setError('Không thể tải danh sách phụ tùng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Mở dialog thêm phụ tùng mới
  const handleAddNew = () => {
    setCurrentPart({
      name: '',
      sku: '',
      brand: '',
      category: '',
      price: '',
      description: '',
      specifications: '',
      warranty: ''
    });
    setImageFiles([]);
    setImageIds([]);
    setImagePreview([]);
    setPreviewSources([]);
    setIsEdit(false);
    setOpen(true);
  };

  // Mở dialog chỉnh sửa phụ tùng
  const handleEdit = (part) => {
    setCurrentPart({
      id: part.id,
      documentId: part.documentId,
      name: part.name,
      sku: part.sku,
      brand: part.brand || '',
      category: part.category,
      price: part.price,
      description: part.description || '',
      specifications: typeof part.specifications === 'object' 
        ? JSON.stringify(part.specifications) 
        : part.specifications || '',
      warranty: part.warranty || ''
    });
    
    // Nếu có hình ảnh, hiển thị và lưu lại ID
    if (part.image && part.image.length > 0) {
      // Lưu ID của ảnh
      setImageIds(part.image.map(img => img.id));

      // Hiển thị preview
      const previews = part.image.map(img => 
        `http://localhost:1337${img.url}`
      );
      setImagePreview(previews);
      
      // Đánh dấu các preview có nguồn gốc từ ảnh đã tải lên
      setPreviewSources(part.image.map((img, index) => ({
        type: 'uploaded',
        index: index,
        id: img.id,
        documentId: img.documentId
      })));
    } else {
      setImageIds([]);
      setImagePreview([]);
      setPreviewSources([]);
    }
    
    setImageFiles([]);
    setIsEdit(true);
    setOpen(true);
  };

  // Mở dialog xác nhận xóa
  const handleDeleteConfirm = (part) => {
    setPartToDelete(part);
    setDeleteDialogOpen(true);
  };

  // Đóng dialog
  const handleClose = () => {
    setOpen(false);
  };

  // Đóng dialog xóa
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setPartToDelete(null);
  };

  // Xử lý thay đổi giá trị trong form
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setCurrentPart(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Xử lý khi chọn file ảnh
  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Thêm file mới vào danh sách
      setImageFiles(prev => [...prev, ...filesArray]);
      
      // Tạo preview cho hình ảnh mới
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      
      // Cập nhật danh sách preview
      setImagePreview(prev => [...prev, ...newPreviews]);
      
      // Cập nhật nguồn gốc preview
      const currentLength = previewSources.length;
      const newPreviewSources = filesArray.map((_, index) => ({
        type: 'file',
        index: currentLength + index,
        fileIndex: imageFiles.length + index
      }));
      
      setPreviewSources(prev => [...prev, ...newPreviewSources]);
    }
  };

  // Xóa một ảnh từ preview
  const handleRemoveImage = (previewIndex) => {
    const source = previewSources[previewIndex];
    
    if (source.type === 'file') {
      // Nếu là file mới, xóa khỏi danh sách file
      const newImageFiles = [...imageFiles];
      newImageFiles.splice(source.fileIndex, 1);
      setImageFiles(newImageFiles);
      
      // Cập nhật indices
      const updatedPreviewSources = previewSources.filter((_, index) => index !== previewIndex)
        .map(s => {
          if (s.type === 'file' && s.fileIndex > source.fileIndex) {
            return { ...s, fileIndex: s.fileIndex - 1 };
          }
          return s;
        });
      
      setPreviewSources(updatedPreviewSources);
    } else if (source.type === 'uploaded') {
      // Nếu là ảnh đã tải lên, xóa ID khỏi danh sách
      const newImageIds = [...imageIds];
      
      // Xóa đúng ảnh tại vị trí index trong danh sách
      newImageIds.splice(source.index, 1);
      setImageIds(newImageIds);
      
      // Cập nhật indices
      const updatedPreviewSources = previewSources.filter((_, index) => index !== previewIndex)
        .map(s => {
          if (s.type === 'uploaded' && s.index > source.index) {
            return { ...s, index: s.index - 1 };
          }
          return s;
        });
      
      setPreviewSources(updatedPreviewSources);
    }
    
    // Xóa preview
    const newImagePreview = [...imagePreview];
    newImagePreview.splice(previewIndex, 1);
    setImagePreview(newImagePreview);
  };

  // Upload ảnh lên server và lấy về thông tin
  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];
    
    const formData = new FormData();
    imageFiles.forEach(file => {
      formData.append('files', file);
    });
    
    try {
      const response = await axiosInstance.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Upload response:', response);
      
      return response.map(img => img.id);
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  };

  // Lưu phụ tùng (thêm mới hoặc cập nhật)
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Kiểm tra các trường bắt buộc
      if (!currentPart.name || !currentPart.sku || !currentPart.category || !currentPart.price) {
        setSnackbar({
          open: true,
          message: 'Vui lòng điền đầy đủ các trường bắt buộc',
          severity: 'error'
        });
        setLoading(false);
        return;
      }
      
      // Upload ảnh mới nếu có
      let newImageIds = [];
      if (imageFiles.length > 0) {
        newImageIds = await uploadImages();
      }
      
      // Chuẩn bị dữ liệu để gửi lên server
      const partData = {
        name: currentPart.name,
        sku: currentPart.sku,
        brand: currentPart.brand,
        category: currentPart.category,
        price: currentPart.price,
        description: currentPart.description,
        specifications: currentPart.specifications,
        warranty: currentPart.warranty
      };
      
      // Thêm danh sách ID hình ảnh
      if (imageIds.length > 0 || newImageIds.length > 0) {
        partData.image = [...imageIds, ...newImageIds];
      }
      
      console.log('Payload to send:', partData);
      
      if (isEdit) {
        // Cập nhật phụ tùng
        await axiosInstance.put(`/car-parts/${currentPart.documentId}`, {
          data: partData
        });
        setSnackbar({
          open: true,
          message: 'Cập nhật phụ tùng thành công',
          severity: 'success'
        });
      } else {
        // Thêm phụ tùng mới
        await axiosInstance.post('/car-parts', {
          data: partData
        });
        setSnackbar({
          open: true,
          message: 'Thêm phụ tùng thành công',
          severity: 'success'
        });
      }
      
      // Làm sạch state sau khi lưu thành công
      setCurrentPart({
        name: '',
        sku: '',
        brand: '',
        category: '',
        price: '',
        description: '',
        specifications: '',
        warranty: ''
      });
      setImageFiles([]);
      setImageIds([]);
      setImagePreview([]);
      setPreviewSources([]);
      
      // Đóng dialog và tải lại danh sách
      setOpen(false);
      fetchCarParts();
    } catch (err) {
      console.error('Error saving car part:', err);
      setSnackbar({
        open: true,
        message: `Lỗi: ${err.response?.data?.error?.message || 'Không thể lưu phụ tùng'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Xóa phụ tùng
  const handleDelete = async () => {
    if (!partToDelete) return;
    
    try {
      setLoading(true);
      await axiosInstance.delete(`/car-parts/${partToDelete.documentId}`);
      
      setSnackbar({
        open: true,
        message: 'Xóa phụ tùng thành công',
        severity: 'success'
      });
      
      // Đóng dialog và tải lại danh sách
      setDeleteDialogOpen(false);
      setPartToDelete(null);
      fetchCarParts();
    } catch (err) {
      console.error('Error deleting car part:', err);
      setSnackbar({
        open: true,
        message: `Lỗi: ${err.response?.data?.error?.message || 'Không thể xóa phụ tùng'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đóng snackbar
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Quản lý phụ tùng ô tô
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleAddNew}
          startIcon={<AddIcon />}
        >
          Thêm phụ tùng
        </Button>
      </Box>

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>}

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!loading && !error && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>Tên phụ tùng</TableCell>
                <TableCell>Thương hiệu</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Giá</TableCell>
                <TableCell>Bảo hành</TableCell>
                <TableCell>Hình ảnh</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {carParts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Không có phụ tùng nào
                  </TableCell>
                </TableRow>
              ) : (
                carParts.map((part) => (
                  <TableRow key={part.id}>
                    <TableCell>{part.sku}</TableCell>
                    <TableCell>{part.name}</TableCell>
                    <TableCell>{part.brand}</TableCell>
                    <TableCell>{part.category}</TableCell>
                    <TableCell>{part.price && new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(part.price)}</TableCell>
                    <TableCell>{part.warranty}</TableCell>
                    <TableCell>
                      {part.image && part.image.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {part.image.map((img, index) => (
                            <Box 
                              key={index}
                              component="img"
                              src={`http://localhost:1337${img.url}`}
                              alt={part.name}
                              sx={{ width: 50, height: 50, objectFit: 'cover' }}
                            />
                          ))}
                        </Box>
                      ) : (
                        'Không có hình ảnh'
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleEdit(part)}
                        title="Chỉnh sửa"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteConfirm(part)}
                        title="Xóa"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog thêm/sửa phụ tùng */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{isEdit ? 'Chỉnh sửa phụ tùng' : 'Thêm phụ tùng mới'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tên phụ tùng"
                name="name"
                value={currentPart.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mã phụ tùng (SKU)"
                name="sku"
                value={currentPart.sku}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Thương hiệu"
                name="brand"
                value={currentPart.brand}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Loại phụ tùng"
                name="category"
                value={currentPart.category}
                onChange={handleChange}
                required
              >
                {CATEGORIES.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Giá bán"
                name="price"
                type="number"
                value={currentPart.price}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>VNĐ</span>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Thời gian bảo hành"
                name="warranty"
                value={currentPart.warranty}
                onChange={handleChange}
                placeholder="Ví dụ: 12 tháng"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả chi tiết"
                name="description"
                value={currentPart.description}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Thông số kỹ thuật"
                name="specifications"
                value={currentPart.specifications}
                onChange={handleChange}
                multiline
                rows={4}
                placeholder="Nhập thông số kỹ thuật dưới dạng văn bản hoặc JSON"
              />
            </Grid>
            <Grid item xs={12}>
              <Box>
                <Button
                  variant="contained"
                  component="label"
                >
                  Chọn hình ảnh
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
                
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {imagePreview.map((url, index) => (
                    <Box 
                      key={index}
                      sx={{ 
                        position: 'relative',
                        width: 120, 
                        height: 120, 
                        border: '1px solid #ddd',
                        borderRadius: 1
                      }}
                    >
                      <Box
                        component="img"
                        src={url}
                        alt={`Preview ${index}`}
                        sx={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          borderRadius: 1
                        }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 2,
                          right: 2,
                          backgroundColor: 'rgba(255, 255, 255, 0.7)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          },
                          width: 24,
                          height: 24,
                          p: 0
                        }}
                        onClick={() => handleRemoveImage(index)}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>Hủy</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa phụ tùng "{partToDelete?.name}" (SKU: {partToDelete?.sku})?
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} disabled={loading}>Hủy</Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar thông báo */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CarPartsManagement;