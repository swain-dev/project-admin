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
  IconButton
} from '@mui/material';
import axiosInstance from 'src/utils/axios';

// Thay thế các Icon với Unicode hoặc text
const AddIcon = () => <span style={{ fontSize: '1.2rem' }}>➕</span>;
const EditIcon = () => <span style={{ fontSize: '1.2rem' }}>✏️</span>;
const DeleteIcon = () => <span style={{ fontSize: '1.2rem' }}>🗑️</span>;
const CloseIcon = () => <span style={{ fontSize: '1rem' }}>✖</span>;

const ProductsView = () => {
  // State cho danh sách dịch vụ
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State cho form thêm/sửa
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentService, setCurrentService] = useState({
    name: '',
    price: '',
    description: '',
    slider: false,
    duration: 20
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imageDocumentIds, setImageDocumentIds] = useState([]); // Lưu documentId của ảnh
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
      price: '',
      description: '',
      slider: false,
      duration: 20
    });
    setImageFiles([]);
    setImageDocumentIds([]);
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
      price: service.price,
      description: service.description,
      slider: service.slider,
      duration: service.duration
    });
    
    // Nếu có hình ảnh, hiển thị và lưu lại documentId
    if (service.image && service.image.length > 0) {
      // Lưu documentId của ảnh
      setImageDocumentIds(service.image.map(img => img.id));

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
      setImageDocumentIds([]);
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
      // Xử lý cho file mới - phần này không thay đổi
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
      // Xử lý cho ảnh đã tải lên
      // Thay đổi ở đây - xóa bằng ID thay vì documentId
      const newImageDocumentIds = [...imageDocumentIds];
      
      // Chúng ta cần xóa ĐÚNG ẢNH tại vị trí INDEX trong danh sách
      // thay vì tìm kiếm qua ID/documentId
      newImageDocumentIds.splice(source.index, 1);
      setImageDocumentIds(newImageDocumentIds);
      
      // Cập nhật indices - phần này không thay đổi
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
      
      // Lấy documentId của ảnh mới tải lên
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
      if (!currentService.name || !currentService.price || !currentService.description) {
        setSnackbar({
          open: true,
          message: 'Vui lòng điền đầy đủ các trường bắt buộc',
          severity: 'error'
        });
        setLoading(false);
        return;
      }
      
      // Nếu đang tạo mới và không có ảnh
      if (!isEdit && imageFiles.length === 0) {
        setSnackbar({
          open: true,
          message: 'Vui lòng chọn ít nhất một hình ảnh',
          severity: 'error'
        });
        setLoading(false);
        return;
      }
      
      // Upload ảnh mới nếu có
      let newImageDocumentIds = [];
      if (imageFiles.length > 0) {
        newImageDocumentIds = await uploadImages();
      }
      
      // Chuẩn bị dữ liệu để gửi lên server
      const serviceData = {
        name: currentService.name,
        price: currentService.price,
        description: currentService.description,
        slider: currentService.slider,
        duration: currentService.duration
      };
      
      // Thêm danh sách documentId hình ảnh (kết hợp ảnh đã có và ảnh mới)
      if (imageDocumentIds.length > 0 || newImageDocumentIds.length > 0) {
        serviceData.image = [...imageDocumentIds, ...newImageDocumentIds];
      }
      
      console.log('Payload to send:', serviceData);
      console.log(currentService)
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
    

      setCurrentService({
        name: '',
        price: '',
        description: '',
        slider: false,
        duration: 20
      });
      setImageFiles([]);
      setImageDocumentIds([]); 
      setImagePreview([]);
      setPreviewSources([]);
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
      await axiosInstance.delete(`/services/${serviceToDelete.id}`);
      
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Quản lý dịch vụ
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
                <TableCell>ID</TableCell>
                <TableCell>Tên dịch vụ</TableCell>
                <TableCell>Giá</TableCell>
                <TableCell>Thời gian (phút)</TableCell>
                <TableCell>Hiển thị Slider</TableCell>
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
                    <TableCell>{service.id}</TableCell>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>{service.price}</TableCell>
                    <TableCell>{service.duration}</TableCell>
                    <TableCell>{service.slider ? 'Có' : 'Không'}</TableCell>
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
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Tên dịch vụ"
              name="name"
              value={currentService.name}
              onChange={handleChange}
              required
            />
            
            <TextField
              fullWidth
              label="Giá"
              name="price"
              value={currentService.price}
              onChange={handleChange}
              required
            />
            
            <TextField
              fullWidth
              label="Mô tả"
              name="description"
              value={currentService.description}
              onChange={handleChange}
              multiline
              rows={4}
              required
            />
            
            <TextField
              fullWidth
              label="Thời gian (phút)"
              name="duration"
              type="number"
              value={currentService.duration}
              onChange={handleChange}
              required
            />
            
            <FormControlLabel
              control={
                <Switch 
                  checked={currentService.slider} 
                  onChange={handleChange} 
                  name="slider" 
                />
              }
              label="Hiển thị trong slider"
            />
            
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
          </Box>
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

export default ProductsView;