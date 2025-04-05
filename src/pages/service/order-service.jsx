import 'moment/locale/vi';
import axios from 'axios';
import moment from 'moment';
import React, { useState, useEffect } from 'react';

import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import PhoneIcon from '@mui/icons-material/Phone';
import NotesIcon from '@mui/icons-material/Notes';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import {
  Box,
  Grid,
  Chip,
  Card,
  Paper,
  Table,
  Alert,
  Button,
  Dialog,
  Select,
  Divider,
  TableRow,
  MenuItem,
  Snackbar,
  Container,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  IconButton,
  InputLabel,
  DialogTitle,
  FormControl,
  CardContent,
  DialogContent,
  DialogActions,
  TableContainer,
  TablePagination,
  CircularProgress
} from '@mui/material';
import axiosInstance from 'src/utils/axios';

// Thiết lập ngôn ngữ tiếng Việt cho moment
moment.locale('vi');

// Styled Components
const PageHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
  padding: theme.spacing(4, 0),
  color: theme.palette.common.white,
  marginBottom: theme.spacing(4),
}));

const SearchContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

const StatusChip = styled(Chip)(() => ({
  fontWeight: 600,
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(1.5),
  '& > svg': {
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(0.25),
    color: theme.palette.text.secondary,
  },
}));

// Các hằng số
const ORDER_STATUSES = [
  'Đang chờ',
  'Đã xác nhận',
  'Đang thực hiện',
  'Hoàn thành',
  'Đã hủy'
];

const PAYMENT_STATUSES = [
  'Chưa thanh toán',
  'Đã thanh toán',
  'Đã hoàn tiền'
];

const PAYMENT_METHODS = [
  'Tiền mặt',
  'Chuyển khoản',
  'Thẻ tín dụng',
  'Ví điện tử'
];

function ServiceOrderManagement() {
  // States
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openNoteDialog, setOpenNoteDialog] = useState(false);
  
  // Form states
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [technicianNote, setTechnicianNote] = useState('');
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Load orders when component mounts
  useEffect(() => {
    fetchOrders();
  }, []);
  
  // Filter orders when filters change
  useEffect(() => {
    applyFilters();
  }, [orders, statusFilter, searchQuery, dateRange]);
  
  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/service-orders?populate=*');
      const ordersData = response.data || [];
      setOrders(ordersData);
      setFilteredOrders(ordersData);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Không thể tải danh sách đơn dịch vụ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Apply filters to orders
  const applyFilters = () => {
    if (!orders || orders.length === 0) return;
    
    let result = [...orders];
    
    // Filter by status
    if (statusFilter) {
      result = result.filter(order => 
        order.status_order === statusFilter
      );
    }
    
    // Filter by search query (order number, customer name, phone, plate)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        (order.orderNumber && order.orderNumber.toLowerCase().includes(query)) ||
        (order.vehiclePlate && order.vehiclePlate.toLowerCase().includes(query)) ||
        (order.contactPhone && order.contactPhone.includes(query))
      );
    }
    
    // Filter by date range
    if (dateRange.startDate && dateRange.endDate) {
      const start = moment(dateRange.startDate).startOf('day');
      const end = moment(dateRange.endDate).endOf('day');
      
      result = result.filter(order => {
        const orderDate = moment(order.scheduledDate);
        return orderDate.isBetween(start, end, null, '[]');
      });
    }
    
    setFilteredOrders(result);
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setStatusFilter('');
    setSearchQuery('');
    setDateRange({
      startDate: '',
      endDate: ''
    });
  };
  
  // Open detail dialog
  const handleOpenDetailDialog = (order) => {
    setSelectedOrder(order);
    setOpenDetailDialog(true);
  };
  
  // Open status update dialog
  const handleOpenStatusDialog = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status_order || '');
    setOpenStatusDialog(true);
  };
  
  // Open payment update dialog
  const handleOpenPaymentDialog = (order) => {
    setSelectedOrder(order);
    setNewPaymentStatus(order.paymentStatus || '');
    setNewPaymentMethod(order.paymentMethod || '');
    setOpenPaymentDialog(true);
  };
  
  // Open technician note dialog
  const handleOpenNoteDialog = (order) => {
    setSelectedOrder(order);
    setTechnicianNote(order.technicianNote || '');
    setOpenNoteDialog(true);
  };
  
  // Close dialogs
  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedOrder(null);
  };
  
  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
  };
  
  const handleClosePaymentDialog = () => {
    setOpenPaymentDialog(false);
  };
  
  const handleCloseNoteDialog = () => {
    setOpenNoteDialog(false);
  };
  
  // Update order status
  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    
    setLoading(true);
    try {
      // Create update data
      const updateData = {
        data: {
          status_order: newStatus
        }
      };
      
      // Add completed date if status is completed
      if (newStatus === 'Hoàn thành') {
        updateData.data.completedAt = new Date().toISOString();
      }
      
      // Call API
      await axiosInstance.put(`/service-orders/${selectedOrder.documentId}`, updateData);
      
      // Update local state
      const updatedOrders = orders.map(order => {
        if (order.id === selectedOrder.id) {
          return {
            ...order,
            status_order: newStatus,
            ...(newStatus === 'Hoàn thành' ? { completedAt: new Date().toISOString() } : {})
          };
        }
        return order;
      });
      
      setOrders(updatedOrders);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Cập nhật trạng thái đơn hàng thành công',
        severity: 'success'
      });
      
      // Close dialog
      handleCloseStatusDialog();
    } catch (err) {
      console.error('Error updating order status:', err);
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi cập nhật trạng thái. Vui lòng thử lại sau.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Update payment information
  const handleUpdatePayment = async () => {
    if (!selectedOrder || !newPaymentStatus || !newPaymentMethod) return;
    
    setLoading(true);
    try {
      // Create update data
      const updateData = {
        data: {
          paymentStatus: newPaymentStatus,
          paymentMethod: newPaymentMethod
        }
      };
      
      // Call API
      await axiosInstance.put(`/service-orders/${selectedOrder.documentId}`, updateData);
      
      // Update local state
      const updatedOrders = orders.map(order => {
        if (order.id === selectedOrder.id) {
          return {
            ...order,
            paymentStatus: newPaymentStatus,
            paymentMethod: newPaymentMethod
          };
        }
        return order;
      });
      
      setOrders(updatedOrders);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Cập nhật thông tin thanh toán thành công',
        severity: 'success'
      });
      
      // Close dialog
      handleClosePaymentDialog();
    } catch (err) {
      console.error('Error updating payment info:', err);
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi cập nhật thông tin thanh toán. Vui lòng thử lại sau.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Update technician note
  const handleUpdateNote = async () => {
    if (!selectedOrder) return;
    
    setLoading(true);
    try {
      // Create update data
      const updateData = {
        data: {
          technicianNote
        }
      };
      
      // Call API
      await axiosInstance.put(`/service-orders/${selectedOrder.documentId}`, updateData);
      
      // Update local state
      const updatedOrders = orders.map(order => {
        if (order.id === selectedOrder.id) {
          return {
            ...order,
            technicianNote
          };
        }
        return order;
      });
      
      setOrders(updatedOrders);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Cập nhật ghi chú kỹ thuật thành công',
        severity: 'success'
      });
      
      // Close dialog
      handleCloseNoteDialog();
    } catch (err) {
      console.error('Error updating technician note:', err);
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi cập nhật ghi chú. Vui lòng thử lại sau.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Đang chờ':
        return 'warning';
      case 'Đã xác nhận':
        return 'info';
      case 'Đang thực hiện':
        return 'primary';
      case 'Hoàn thành':
        return 'success';
      case 'Đã hủy':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Đang chờ':
        return <ScheduleIcon fontSize="small" />;
      case 'Đã xác nhận':
        return <EventAvailableIcon fontSize="small" />;
      case 'Đang thực hiện':
        return <PlayArrowIcon fontSize="small" />;
      case 'Hoàn thành':
        return <CheckCircleIcon fontSize="small" />;
      case 'Đã hủy':
        return <CancelIcon fontSize="small" />;
      default:
        return <ScheduleIcon fontSize="small" />;
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return moment(dateString).format('DD/MM/YYYY HH:mm');
  };
  
  // Get service name
  const getServiceName = (service) => {
    if (!service) return 'N/A';
    return service.name || 'N/A';
  };
  
  // Get username
  const getUserName = (user) => {
    if (!user) return 'N/A';
    return user.username || 'N/A';
  };
  
  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', pb: 6 }}>
      <PageHeader>
        <Container>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Quản lý đơn dịch vụ
          </Typography>
          <Typography variant="subtitle1">
            Quản lý và theo dõi đơn đặt dịch vụ của khách hàng
          </Typography>
        </Container>
      </PageHeader>
      
      <Container>
        {/* Search and Filters */}
        <SearchContainer elevation={2}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm theo mã đơn, biển số xe, SĐT..."
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Trạng thái"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {ORDER_STATUSES.map((status) => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Từ ngày"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Đến ngày"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleResetFilters}
                  sx={{ mr: 1 }}
                >
                  Đặt lại
                </Button>
                <Button
                  variant="contained"
                  startIcon={<FilterListIcon />}
                  onClick={applyFilters}
                >
                  Lọc
                </Button>
              </Box>
            </Grid>
          </Grid>
        </SearchContainer>
        
        {/* Loading state */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {/* Error state */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Empty state */}
        {!loading && !error && filteredOrders.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Không tìm thấy đơn dịch vụ nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
            </Typography>
          </Paper>
        )}
        
        {/* Orders table */}
        {!loading && !error && filteredOrders.length > 0 && (
          <>
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Mã đơn</TableCell>
                    <TableCell>Thông tin khách hàng</TableCell>
                    <TableCell>Thời gian đặt</TableCell>
                    <TableCell>Dịch vụ</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell align="right">Tổng tiền</TableCell>
                    <TableCell align="center">Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((order) => (
                      <TableRow key={order.id} hover>
                        <TableCell>{order.orderNumber || 'N/A'}</TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {order.vehicleName || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {order.contactPhone || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {formatDate(order.scheduledDate)}
                        </TableCell>
                        <TableCell>
                          {getServiceName(order.service)}
                        </TableCell>
                        <TableCell>
                          <StatusChip
                            label={order.status_order || 'N/A'}
                            color={getStatusColor(order.status_order)}
                            size="small"
                            icon={getStatusIcon(order.status_order)}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(order.totalAmount)}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton 
                            color="primary" 
                            size="small"
                            onClick={() => handleOpenDetailDialog(order)}
                            title="Xem chi tiết"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            color="secondary" 
                            size="small"
                            onClick={() => handleOpenStatusDialog(order)}
                            title="Cập nhật trạng thái"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            color="success" 
                            size="small"
                            onClick={() => handleOpenPaymentDialog(order)}
                            title="Cập nhật thanh toán"
                          >
                            <AttachMoneyIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            color="info" 
                            size="small"
                            onClick={() => handleOpenNoteDialog(order)}
                            title="Ghi chú kỹ thuật"
                          >
                            <NotesIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              component="div"
              count={filteredOrders.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Số hàng mỗi trang:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
            />
          </>
        )}
        
        {/* Order detail dialog */}
        <Dialog
          open={openDetailDialog}
          onClose={handleCloseDetailDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Chi tiết đơn dịch vụ</DialogTitle>
          <IconButton
            aria-label="close"
            onClick={handleCloseDetailDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CancelIcon />
          </IconButton>
          
          <DialogContent dividers>
            {selectedOrder && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">
                        {getServiceName(selectedOrder.service)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Mã đơn: {selectedOrder.orderNumber || 'N/A'}
                      </Typography>
                    </Box>
                    <StatusChip
                      label={selectedOrder.status_order || 'N/A'}
                      color={getStatusColor(selectedOrder.status_order)}
                    />
                  </Box>
                  <Divider />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Thông tin khách hàng
                      </Typography>
                      
                      <InfoItem>
                        <PersonIcon />
                        <Box>
                          <Typography variant="body2">
                            <strong>Khách hàng:</strong> {getUserName(selectedOrder.user)}
                          </Typography>
                        </Box>
                      </InfoItem>
                      
                      <InfoItem>
                        <PhoneIcon />
                        <Typography variant="body2">
                          <strong>Số điện thoại:</strong> {selectedOrder.contactPhone || 'N/A'}
                        </Typography>
                      </InfoItem>
                      
                      <InfoItem>
                        <DirectionsCarIcon />
                        <Box>
                          <Typography variant="body2">
                            <strong>Xe:</strong> {selectedOrder.vehicleName || 'N/A'}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Biển số:</strong> {selectedOrder.vehiclePlate || 'N/A'}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Năm sản xuất:</strong> {selectedOrder.vehicleYear || 'N/A'}
                          </Typography>
                        </Box>
                      </InfoItem>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Thông tin dịch vụ
                      </Typography>
                      
                      <InfoItem>
                        <CalendarTodayIcon />
                        <Typography variant="body2">
                          <strong>Thời gian hẹn:</strong> {formatDate(selectedOrder.scheduledDate)}
                        </Typography>
                      </InfoItem>
                      
                      {selectedOrder.service && selectedOrder.service.duration && (
                        <InfoItem>
                          <ScheduleIcon />
                          <Typography variant="body2">
                            <strong>Thời gian dự kiến:</strong> {selectedOrder.service.duration} phút
                          </Typography>
                        </InfoItem>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Thông tin thanh toán
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          <strong>Phương thức thanh toán:</strong> {selectedOrder.paymentMethod || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Trạng thái thanh toán:</strong> {selectedOrder.paymentStatus || 'N/A'}
                        </Typography>
                      </Box>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Giá dịch vụ:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(selectedOrder.totalAmount)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle2">Tổng thanh toán:</Typography>
                        <Typography variant="subtitle2" color="primary.main">
                          {formatCurrency(selectedOrder.totalAmount)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Ghi chú
                      </Typography>
                      
                      {selectedOrder.note ? (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" gutterBottom>
                            <strong>Ghi chú của khách hàng:</strong>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedOrder.note}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Khách hàng không có ghi chú
                        </Typography>
                      )}
                      
                      <Divider sx={{ my: 1 }} />
                      
                      {selectedOrder.technicianNote ? (
                        <Box>
                          <Typography variant="body2" gutterBottom>
                            <strong>Ghi chú kỹ thuật viên:</strong>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedOrder.technicianNote}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Chưa có ghi chú kỹ thuật
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Lịch sử đơn hàng
                      </Typography>
                      
                      <Box sx={{ pl: 2 }}>
                        <Box sx={{ display: 'flex', mb: 2 }}>
                          <ScheduleIcon sx={{ mr: 2, color: 'primary.main' }} />
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              Đơn hàng được tạo
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(selectedOrder.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                        
                        {selectedOrder.status_order === 'Đang thực hiện' && (
                          <Box sx={{ display: 'flex', mb: 2 }}>
                            <PlayArrowIcon sx={{ mr: 2, color: 'secondary.main' }} />
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                Đang thực hiện dịch vụ
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(selectedOrder.updatedAt)}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                        
                        {selectedOrder.status_order === 'Hoàn thành' && (
                          <Box sx={{ display: 'flex', mb: 2 }}>
                            <CheckCircleIcon sx={{ mr: 2, color: 'success.main' }} />
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                Dịch vụ đã hoàn thành
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(selectedOrder.completedAt || selectedOrder.updatedAt)}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                        
                        {selectedOrder.status_order === 'Đã hủy' && (
                          <Box sx={{ display: 'flex', mb: 2 }}>
                            <CancelIcon sx={{ mr: 2, color: 'error.main' }} />
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                Đơn hàng đã bị hủy
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(selectedOrder.canceledAt || selectedOrder.updatedAt)}
                              </Typography>
                              {selectedOrder.cancelReason && (
                                <Typography variant="body2" color="error.main">
                                  Lý do: {selectedOrder.cancelReason}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        )}
                        
                        {selectedOrder.paymentStatus === 'Đã thanh toán' && (
                          <Box sx={{ display: 'flex', mb: 2 }}>
                            <AttachMoneyIcon sx={{ mr: 2, color: 'success.main' }} />
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                Đã thanh toán
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(selectedOrder.updatedAt)}
                              </Typography>
                              <Typography variant="body2">
                                Phương thức: {selectedOrder.paymentMethod}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          
          <DialogActions>
            <Button
              onClick={() => handleOpenStatusDialog(selectedOrder)}
              color="primary"
              startIcon={<EditIcon />}
            >
              Cập nhật trạng thái
            </Button>
            <Button
              onClick={() => handleOpenPaymentDialog(selectedOrder)}
              color="success"
              startIcon={<AttachMoneyIcon />}
            >
              Cập nhật thanh toán
            </Button>
            <Button
              onClick={() => handleOpenNoteDialog(selectedOrder)}
              color="info"
              startIcon={<NotesIcon />}
            >
              Ghi chú kỹ thuật
            </Button>
            <Button onClick={handleCloseDetailDialog}>
              Đóng
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Update status dialog */}
        <Dialog
          open={openStatusDialog}
          onClose={handleCloseStatusDialog}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Cập nhật trạng thái đơn dịch vụ</DialogTitle>
          <DialogContent>
            {selectedOrder && (
              <Box sx={{ pt: 1 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Mã đơn:</strong> {selectedOrder.orderNumber || 'N/A'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Dịch vụ:</strong> {getServiceName(selectedOrder.service)}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Trạng thái hiện tại:</strong> {selectedOrder.status_order || 'N/A'}
                </Typography>
                
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Trạng thái mới</InputLabel>
                  <Select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    label="Trạng thái mới"
                  >
                    {ORDER_STATUSES.map((status) => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseStatusDialog}>
              Hủy
            </Button>
            <Button
              onClick={handleUpdateStatus}
              variant="contained"
              color="primary"
              disabled={!newStatus || loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Cập nhật'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Update payment dialog */}
        <Dialog
          open={openPaymentDialog}
          onClose={handleClosePaymentDialog}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Cập nhật thông tin thanh toán</DialogTitle>
          <DialogContent>
            {selectedOrder && (
              <Box sx={{ pt: 1 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Mã đơn:</strong> {selectedOrder.orderNumber || 'N/A'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Khách hàng:</strong> {getUserName(selectedOrder.user)}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Số tiền:</strong> {formatCurrency(selectedOrder.totalAmount)}
                </Typography>
                
                <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                  <InputLabel>Trạng thái thanh toán</InputLabel>
                  <Select
                    value={newPaymentStatus}
                    onChange={(e) => setNewPaymentStatus(e.target.value)}
                    label="Trạng thái thanh toán"
                  >
                    {PAYMENT_STATUSES.map((status) => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>Phương thức thanh toán</InputLabel>
                  <Select
                    value={newPaymentMethod}
                    onChange={(e) => setNewPaymentMethod(e.target.value)}
                    label="Phương thức thanh toán"
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <MenuItem key={method} value={method}>{method}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePaymentDialog}>
              Hủy
            </Button>
            <Button
              onClick={handleUpdatePayment}
              variant="contained"
              color="primary"
              disabled={!newPaymentStatus || !newPaymentMethod || loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Cập nhật'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Technician note dialog */}
        <Dialog
          open={openNoteDialog}
          onClose={handleCloseNoteDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Ghi chú kỹ thuật viên</DialogTitle>
          <DialogContent>
            {selectedOrder && (
              <Box sx={{ pt: 1 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Mã đơn:</strong> {selectedOrder.orderNumber || 'N/A'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Dịch vụ:</strong> {getServiceName(selectedOrder.service)}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Xe:</strong> {selectedOrder.vehicleName || 'N/A'} ({selectedOrder.vehiclePlate || 'N/A'})
                </Typography>
                
                {selectedOrder.note && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Ghi chú của khách hàng:</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedOrder.note}
                    </Typography>
                  </Box>
                )}
                
                <TextField
                  fullWidth
                  label="Ghi chú kỹ thuật viên"
                  multiline
                  rows={5}
                  value={technicianNote}
                  onChange={(e) => setTechnicianNote(e.target.value)}
                  placeholder="Nhập ghi chú về tình trạng kỹ thuật, phụ tùng thay thế, hoặc các vấn đề phát hiện..."
                  sx={{ mt: 2 }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseNoteDialog}>
              Hủy
            </Button>
            <Button
              onClick={handleUpdateNote}
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Lưu ghi chú'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default ServiceOrderManagement;