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
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  MenuItem,
  Grid,
  FormControlLabel,
  Switch
} from '@mui/material';
import axiosInstance from 'src/utils/axios';

// Thay thế các Icon với Unicode hoặc text
const AddIcon = () => <span style={{ fontSize: '1.2rem' }}>➕</span>;
const EditIcon = () => <span style={{ fontSize: '1.2rem' }}>✏️</span>;
const DeleteIcon = () => <span style={{ fontSize: '1.2rem' }}>🗑️</span>;
const CloseIcon = () => <span style={{ fontSize: '1rem' }}>✖</span>;

// Danh sách các loại dịch vụ
const SERVICE_CATEGORIES = [
  "Bảo dưỡng định kỳ",
  "Sửa chữa",
  "Kiểm tra",
  "Thay thế phụ tùng",
  "Chăm sóc xe",
  "Dịch vụ khẩn cấp",
  "Tư vấn kỹ thuật",
  "Khác"
];

const ServiceManagement = () => {
  // State cho danh sách dịch vụ
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State cho form thêm/sửa
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentService, setCurrentService] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: '',
    requirements: '',
    isActive: true
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imageIds, setImageIds] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [previewSources, setPreviewSources] = useState([]);

  // State cho dialog xóa
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  // State cho snackbar thông báo
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Lấy danh sách dịch vụ khi component mount
  useEffect(() => {
    fetchServices();
  }, []);

  // Hàm lấy danh sách dịch vụ từ API
  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/services?populate=*');
      console.log('Services response:', response);
      setServices(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Mở dialog thêm dịch vụ mới
  const handleAddNew = () => {
    setCurrentService({
      name: '',
      description: '',
      price: '',
      duration: '',
      category: '',
      requirements: '',
      isActive: true
    });
    setImageFiles([]);
    setImageIds([]);
    setImagePreview([]);
    setPreviewSources([]);
    setIsEdit(false);
    setOpen(true);
  };

  // Mở dialog chỉnh sửa dịch vụ
  const handleEdit = (service) => {
    setCurrentService({
      id: service.id,
      documentId: service.documentId,
      name: service.name,
      description: service.description || '',
      price: service.price,
      duration: service.duration,
      category: service.category || '',
      requirements: service.requirements || '',
      isActive: service.isActive !== undefined ? service.isActive : true
    });
    
    // Nếu có hình ảnh, hiển thị và lưu lại ID
    if (service.image && service.image.length > 0) {
      // Lưu ID của ảnh
      setImageIds(service.image.map(img => img.id));

      // Hiển thị preview
      const previews = service.image.map(img => 
        `http://localhost:1337${img.url}`
      );
      setImagePreview(previews);
      
      // Đánh dấu các preview có nguồn gốc từ ảnh đã tải lên
      setPreviewSources(service.image.map((img, index) => ({
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
  const handleDeleteConfirm = (service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  // Đóng dialog
  const handleClose = () => {
    setOpen(false);
  };

  // Đóng dialog xóa
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setServiceToDelete(null);
  };

  // Xử lý thay đổi giá trị trong form
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setCurrentService(prev => ({
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

  // Lưu dịch vụ (thêm mới hoặc cập nhật)
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Kiểm tra các trường bắt buộc
      if (!currentService.name || !currentService.price || !currentService.category) {
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
      const serviceData = {
        name: currentService.name,
        description: currentService.description,
        price: currentService.price,
        duration: currentService.duration,
        category: currentService.category,
        requirements: currentService.requirements,
        isActive: currentService.isActive
      };
      
      // Thêm danh sách ID hình ảnh
      if (imageIds.length > 0 || newImageIds.length > 0) {
        serviceData.image = [...imageIds, ...newImageIds];
      }
      
      console.log('Payload to send:', serviceData);
      
      if (isEdit) {
        // Cập nhật dịch vụ
        await axiosInstance.put(`/services/${currentService.documentId}`, {
          data: serviceData
        });
        setSnackbar({
          open: true,
          message: 'Cập nhật dịch vụ thành công',
          severity: 'success'
        });
      } else {
        // Thêm dịch vụ mới
        await axiosInstance.post('/services', {
          data: serviceData
        });
        setSnackbar({
          open: true,
          message: 'Thêm dịch vụ thành công',
          severity: 'success'
        });
      }
      
      // Làm sạch state sau khi lưu thành công
      setCurrentService({
        name: '',
        description: '',
        price: '',
        duration: '',
        category: '',
        requirements: '',
        isActive: true
      });
      setImageFiles([]);
      setImageIds([]);
      setImagePreview([]);
      setPreviewSources([]);
      
      // Đóng dialog và tải lại danh sách
      setOpen(false);
      fetchServices();
    } catch (err) {
      console.error('Error saving service:', err);
      setSnackbar({
        open: true,
        message: `Lỗi: ${err.response?.data?.error?.message || 'Không thể lưu dịch vụ'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Xóa dịch vụ
  const handleDelete = async () => {
    if (!serviceToDelete) return;
    
    try {
      setLoading(true);
      await axiosInstance.delete(`/services/${serviceToDelete.documentId}`);
      
      setSnackbar({
        open: true,
        message: 'Xóa dịch vụ thành công',
        severity: 'success'
      });
      
      // Đóng dialog và tải lại danh sách
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
      fetchServices();
    } catch (err) {
      console.error('Error deleting service:', err);
      setSnackbar({
        open: true,
        message: `Lỗi: ${err.response?.data?.error?.message || 'Không thể xóa dịch vụ'}`,
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

  // Format giá tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Quản lý dịch vụ xe
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleAddNew}
          startIcon={<AddIcon />}
        >
          Thêm dịch vụ
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
                <TableCell>Tên dịch vụ</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Giá</TableCell>
                <TableCell>Thời gian (phút)</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Hình ảnh</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Không có dịch vụ nào
                  </TableCell>
                </TableRow>
              ) : (
                services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>{service.category}</TableCell>
                    <TableCell>{service.price && formatCurrency(service.price)}</TableCell>
                    <TableCell>{service.duration}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: service.isActive ? 'success.light' : 'error.light',
                          color: 'white'
                        }}
                      >
                        {service.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {service.image && service.image.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {service.image.map((img, index) => (
                            <Box 
                              key={index}
                              component="img"
                              src={`http://localhost:1337${img.url}`}
                              alt={service.name}
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
                        onClick={() => handleEdit(service)}
                        title="Chỉnh sửa"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteConfirm(service)}
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

      {/* Dialog thêm/sửa dịch vụ */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{isEdit ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên dịch vụ"
                name="name"
                value={currentService.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Loại dịch vụ"
                name="category"
                value={currentService.category}
                onChange={handleChange}
                required
              >
                {SERVICE_CATEGORIES.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Giá dịch vụ"
                name="price"
                type="number"
                value={currentService.price}
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
                label="Thời gian thực hiện (phút)"
                name="duration"
                type="number"
                value={currentService.duration}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentService.isActive}
                    onChange={handleChange}
                    name="isActive"
                    color="primary"
                  />
                }
                label="Dịch vụ đang hoạt động"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả chi tiết"
                name="description"
                value={currentService.description}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Yêu cầu đặc biệt"
                name="requirements"
                value={currentService.requirements}
                onChange={handleChange}
                multiline
                rows={2}
                placeholder="Các yêu cầu đặc biệt để thực hiện dịch vụ (nếu có)"
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
            Bạn có chắc chắn muốn xóa dịch vụ "{serviceToDelete?.name}"?
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

export default ServiceManagement;