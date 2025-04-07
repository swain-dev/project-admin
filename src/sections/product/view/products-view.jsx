import React, { useState, useEffect } from 'react';

import {
  Box,
  Grid,
  Paper,
  Table,
  Alert,
  Button,
  Dialog,
  Switch,
  TableRow,
  Snackbar,
  MenuItem,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  IconButton,
  DialogTitle,
  DialogActions,
  DialogContent,
  TableContainer,
  CircularProgress,
  FormControlLabel,
  DialogContentText,
  Pagination
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

  // State cho phân trang
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

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
  const [imageFile, setImageFile] = useState(null);
  const [imageId, setImageId] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

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
  }, [page]);

  // Hàm lấy danh sách dịch vụ từ API với phân trang
  const fetchServices = async () => {
    setLoading(true);
    try {
      // Sử dụng Strapi pagination API
      const queryParams = new URLSearchParams();
      queryParams.append('pagination[page]', page);
      queryParams.append('pagination[pageSize]', rowsPerPage);
      queryParams.append('sort[0]', 'createdAt:desc');
      queryParams.append('populate', '*');

      const response = await axiosInstance.get(`/services?${queryParams.toString()}`);
      console.log('Services response:', response);
      
      // Cập nhật danh sách services từ data
      setServices(response.data);
      
      // Cập nhật thông tin phân trang
      if (response.meta && response.meta.pagination) {
        setTotalItems(response.meta.pagination.total);
        setTotalPages(response.meta.pagination.pageCount);
      } else {
        // Nếu không có meta data, tính toán số trang dựa trên data
        setTotalItems(response.data.length);
        setTotalPages(Math.ceil(response.data.length / rowsPerPage) || 1);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thay đổi trang
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
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
    setImageFile(null);
    setImageId(null);
    setImagePreview('');
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
      // Lưu ID của ảnh đầu tiên (chỉ sử dụng 1 ảnh)
      setImageId(service.image[0].id);

      // Hiển thị preview cho ảnh đầu tiên
      setImagePreview(`http://localhost:1337${service.image[0].url}`);
    } else {
      setImageId(null);
      setImagePreview('');
    }
    
    setImageFile(null);
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
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Tạo URL preview cho hình ảnh
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // Reset image ID vì sẽ upload ảnh mới
      setImageId(null);
    }
  };

  // Xóa ảnh hiện tại
  const handleRemoveImage = () => {
    setImageFile(null);
    setImageId(null);
    setImagePreview('');
  };

  // Upload ảnh lên server và lấy về thông tin
  const uploadImage = async () => {
    if (!imageFile) return null;
    
    const formData = new FormData();
    formData.append('files', imageFile);
    
    try {
      const response = await axiosInstance.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Upload response:', response);
      
      // Trả về ID của ảnh đầu tiên
      if (response && response.length > 0) {
        return response[0].id;
      }
      return null;
    } catch (error) {
      console.error('Error uploading image:', error);
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
      let uploadedImageId = null;
      if (imageFile) {
        uploadedImageId = await uploadImage();
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
      
      // Thêm ID hình ảnh nếu có
      if (uploadedImageId || imageId) {
        // Sử dụng ID ảnh đã upload hoặc ID ảnh hiện tại
        serviceData.image = [uploadedImageId || imageId];
      } else {
        // Nếu không có ảnh (đã xóa ảnh cũ), gửi mảng rỗng
        serviceData.image = [];
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
      setImageFile(null);
      setImageId(null);
      setImagePreview('');
      
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
      
      // Nếu đang ở trang cuối cùng và chỉ có 1 item, cần trở về trang trước đó
      if (page > 1 && services.length === 1) {
        setPage(page - 1);
      } else {
        fetchServices();
      }
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
  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

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

      {loading && services.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!loading && !error && (
        <>
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
                          <Box 
                            component="img"
                            src={`http://localhost:1337${service.image[0].url}`}
                            alt={service.name}
                            sx={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 1 }}
                          />
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

          {/* Phân trang */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3, mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                Hiển thị {services.length > 0 ? ((page - 1) * rowsPerPage + 1) : 0} - {Math.min(page * rowsPerPage, totalItems)} trên {totalItems} dịch vụ
              </Typography>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handleChangePage}
                color="primary"
                size="medium"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
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
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
                
                {imagePreview && (
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Box 
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
                        src={imagePreview}
                        alt="Preview"
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
                        onClick={handleRemoveImage}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  </Box>
                )}
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