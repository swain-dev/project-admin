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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Chip,
  Grid,
  Divider,
  Card,
  CardContent,
  Tabs,
  Tab,
  Stack
} from '@mui/material';
import axiosInstance from 'src/utils/axios';

// Thay thế các Icon với Unicode hoặc text
const RefreshIcon = () => <span style={{ fontSize: '1.2rem' }}>🔄</span>;
const SearchIcon = () => <span style={{ fontSize: '1.2rem' }}>🔍</span>;
const ViewIcon = () => <span style={{ fontSize: '1.2rem' }}>👁️</span>;
const EditIcon = () => <span style={{ fontSize: '1.2rem' }}>✏️</span>;
const CloseIcon = () => <span style={{ fontSize: '1rem' }}>✖</span>;
const FilterIcon = () => <span style={{ fontSize: '1.2rem' }}>🔎</span>;

const OrdersManagementView = () => {
  // State cho danh sách đơn hàng
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State cho phân trang
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);

  // State cho lọc và tìm kiếm
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    searchTerm: ''
  });

  // State cho xem chi tiết đơn hàng
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);

  // State cho cập nhật trạng thái
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  // State cho snackbar thông báo
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // State cho bộ lọc mở rộng
  const [expandedFilters, setExpandedFilters] = useState(false);

  // Tab trong chi tiết đơn hàng
  const [tabValue, setTabValue] = useState(0);

  // Lấy danh sách đơn hàng khi component mount hoặc khi bộ lọc thay đổi
  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage, filters]);

  // Hàm lấy danh sách đơn hàng từ API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page + 1); // API thường tính trang từ 1
      queryParams.append('pageSize', rowsPerPage);
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      if (filters.searchTerm) queryParams.append('search', filters.searchTerm);

      const response = await axiosInstance.get(`/orders?${queryParams.toString()}&populate=*,carPart,user`);
      console.log('Orders response:', response);
      
      // Giả định response có dạng { data: [...], meta: { pagination: { total: <number> } } }
      setOrders(response.data);
      setTotalOrders(response.meta?.pagination?.total || response.data.length);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Hàm xem chi tiết đơn hàng
  const handleViewOrderDetail = async (orderId) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/orders/${orderId}?populate=*,carPart,user`);
      console.log('Order detail:', response);
      setSelectedOrder(response.data);
      setOrderDetailOpen(true);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setSnackbar({
        open: true,
        message: 'Không thể tải thông tin chi tiết đơn hàng.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Hàm đóng dialog chi tiết đơn hàng
  const handleCloseOrderDetail = () => {
    setOrderDetailOpen(false);
    setSelectedOrder(null);
    setTabValue(0);
  };

  // Hàm mở dialog cập nhật trạng thái
  const handleOpenStatusUpdate = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusUpdateOpen(true);
  };

  // Hàm đóng dialog cập nhật trạng thái
  const handleCloseStatusUpdate = () => {
    setStatusUpdateOpen(false);
    setSelectedOrder(null);
    setNewStatus('');
  };

  // Hàm cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    setLoading(true);
    try {
      await axiosInstance.put(`/orders/${selectedOrder.id}`, {
        data: {
          status: newStatus,
          ...(newStatus === 'delivered' && { deliveredAt: new Date().toISOString() }),
          ...(newStatus === 'cancelled' && { cancelledAt: new Date().toISOString() })
        }
      });

      setSnackbar({
        open: true,
        message: 'Cập nhật trạng thái đơn hàng thành công',
        severity: 'success'
      });

      handleCloseStatusUpdate();
      fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      setSnackbar({
        open: true,
        message: `Lỗi: ${err.response?.data?.error?.message || 'Không thể cập nhật trạng thái đơn hàng'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(0); // Reset về trang đầu tiên khi thay đổi bộ lọc
  };

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    // Đã có useEffect theo dõi thay đổi của filters
  };

  // Reset bộ lọc
  const handleResetFilters = () => {
    setFilters({
      status: '',
      dateFrom: '',
      dateTo: '',
      searchTerm: ''
    });
    setPage(0);
  };

  // Xử lý đóng snackbar
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Xử lý thay đổi tab
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Render chip trạng thái với màu tương ứng
  const renderStatusChip = (status) => {
    let color = 'default';
    let label = status;

    switch (status) {
      case 'pending':
        color = 'warning';
        label = 'Chờ xử lý';
        break;
      case 'confirmed':
        color = 'info';
        label = 'Đã xác nhận';
        break;
      case 'processing':
        color = 'secondary';
        label = 'Đang xử lý';
        break;
      case 'shipping':
        color = 'primary';
        label = 'Đang vận chuyển';
        break;
      case 'delivered':
        color = 'success';
        label = 'Đã giao';
        break;
      case 'cancelled':
        color = 'error';
        label = 'Đã hủy';
        break;
      default:
        break;
    }

    return <Chip label={label} color={color} size="small" />;
  };

  // Định dạng số tiền VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Định dạng ngày giờ
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Quản lý đơn hàng
        </Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={fetchOrders}
          startIcon={<RefreshIcon />}
        >
          Tải lại
        </Button>
      </Box>

      {/* Bộ lọc cơ bản */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            label="Tìm kiếm theo mã đơn, tên khách hàng"
            name="searchTerm"
            value={filters.searchTerm}
            onChange={handleFilterChange}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="status-filter-label">Trạng thái</InputLabel>
            <Select
              labelId="status-filter-label"
              label="Trạng thái"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="pending">Chờ xử lý</MenuItem>
              <MenuItem value="confirmed">Đã xác nhận</MenuItem>
              <MenuItem value="processing">Đang xử lý</MenuItem>
              <MenuItem value="shipping">Đang vận chuyển</MenuItem>
              <MenuItem value="delivered">Đã giao</MenuItem>
              <MenuItem value="cancelled">Đã hủy</MenuItem>
            </Select>
          </FormControl>
          <Button 
            variant="contained" 
            type="submit"
            startIcon={<SearchIcon />}
          >
            Tìm kiếm
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleResetFilters}
          >
            Đặt lại
          </Button>
          <Button 
            variant="text" 
            onClick={() => setExpandedFilters(!expandedFilters)}
            startIcon={<FilterIcon />}
          >
            {expandedFilters ? 'Ẩn bộ lọc' : 'Hiển thị thêm bộ lọc'}
          </Button>
        </Box>

        {/* Bộ lọc mở rộng */}
        {expandedFilters && (
          <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              label="Từ ngày"
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              label="Đến ngày"
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        )}
      </Paper>

      {loading && !orders.length && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>}

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Bảng danh sách đơn hàng */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã đơn hàng</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell>Ngày đặt</TableCell>
              <TableCell>Tổng tiền</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Phương thức thanh toán</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  {loading ? 'Đang tải...' : 'Không có đơn hàng nào'}
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>{order.user?.username || 'N/A'}</TableCell>
                  <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                  <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                  <TableCell>{renderStatusChip(order.status)}</TableCell>
                  <TableCell>
                    {order.paymentMethod === 'cod' && 'Tiền mặt khi nhận hàng'}
                    {order.paymentMethod === 'bank_transfer' && 'Chuyển khoản'}
                    {order.paymentMethod === 'credit_card' && 'Thẻ tín dụng'}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleViewOrderDetail(order.id)}
                      title="Xem chi tiết"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton 
                      color="secondary" 
                      onClick={() => handleOpenStatusUpdate(order)}
                      title="Cập nhật trạng thái"
                      disabled={order.status === 'delivered' || order.status === 'cancelled'}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog chi tiết đơn hàng */}
      <Dialog 
        open={orderDetailOpen}
        onClose={handleCloseOrderDetail}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              <Typography variant="h6">
                Chi tiết đơn hàng #{selectedOrder.orderNumber}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {formatDateTime(selectedOrder.createdAt)}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
              >
                <Tab label="Thông tin đơn hàng" />
                <Tab label="Sản phẩm" />
                <Tab label="Lịch sử" />
              </Tabs>
              
              {/* Tab thông tin đơn hàng */}
              {tabValue === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                          Thông tin khách hàng
                        </Typography>
                        <Stack spacing={1}>
                          <Typography>
                            <strong>Họ tên:</strong> {selectedOrder.user?.username || 'N/A'}
                          </Typography>
                          <Typography>
                            <strong>Email:</strong> {selectedOrder.user?.email || 'N/A'}
                          </Typography>
                          <Typography>
                            <strong>Số điện thoại:</strong> {selectedOrder.contactPhone || 'N/A'}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                          Thông tin giao hàng
                        </Typography>
                        <Stack spacing={1}>
                          <Typography>
                            <strong>Địa chỉ:</strong> {selectedOrder.shippingAddress || 'N/A'}
                          </Typography>
                          <Typography>
                            <strong>Trạng thái:</strong> {' '}
                            {renderStatusChip(selectedOrder.status)}
                          </Typography>
                          {selectedOrder.deliveredAt && (
                            <Typography>
                              <strong>Ngày giao hàng:</strong> {formatDateTime(selectedOrder.deliveredAt)}
                            </Typography>
                          )}
                          {selectedOrder.cancelledAt && (
                            <>
                              <Typography>
                                <strong>Ngày hủy:</strong> {formatDateTime(selectedOrder.cancelledAt)}
                              </Typography>
                              <Typography>
                                <strong>Lý do hủy:</strong> {selectedOrder.cancelReason || 'Không có'}
                              </Typography>
                            </>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                          Thông tin thanh toán
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Stack spacing={1}>
                              <Typography>
                                <strong>Phương thức:</strong>{' '}
                                {selectedOrder.paymentMethod === 'cod' && 'Tiền mặt khi nhận hàng'}
                                {selectedOrder.paymentMethod === 'bank_transfer' && 'Chuyển khoản'}
                                {selectedOrder.paymentMethod === 'credit_card' && 'Thẻ tín dụng'}
                              </Typography>
                              <Typography>
                                <strong>Trạng thái:</strong>{' '}
                                <Chip 
                                  label={selectedOrder.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'} 
                                  color={selectedOrder.paymentStatus === 'paid' ? 'success' : 'warning'} 
                                  size="small"
                                />
                              </Typography>
                            </Stack>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Stack spacing={1}>
                              <Typography>
                                <strong>Tổng tiền sản phẩm:</strong> {formatCurrency(selectedOrder.totalAmount - (selectedOrder.shippingFee || 0))}
                              </Typography>
                              <Typography>
                                <strong>Phí vận chuyển:</strong> {formatCurrency(selectedOrder.shippingFee || 0)}
                              </Typography>
                              <Typography fontWeight="bold">
                                <strong>Tổng thanh toán:</strong> {formatCurrency(selectedOrder.totalAmount)}
                              </Typography>
                            </Stack>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                  {selectedOrder.note && (
                    <Grid item xs={12}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                            Ghi chú từ khách hàng
                          </Typography>
                          <Typography>{selectedOrder.note}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                </Grid>
              )}

              {/* Tab thông tin sản phẩm */}
              {tabValue === 1 && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Mã phụ tùng</TableCell>
                        <TableCell>Tên phụ tùng</TableCell>
                        <TableCell>Thương hiệu</TableCell>
                        <TableCell>Đơn giá</TableCell>
                        <TableCell>Số lượng</TableCell>
                        <TableCell align="right">Thành tiền</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>{selectedOrder.carPart?.sku || 'N/A'}</TableCell>
                        <TableCell>{selectedOrder.carPart?.name || 'N/A'}</TableCell>
                        <TableCell>{selectedOrder.carPart?.brand || 'N/A'}</TableCell>
                        <TableCell>{formatCurrency(selectedOrder.unitPrice)}</TableCell>
                        <TableCell>{selectedOrder.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(selectedOrder.unitPrice * selectedOrder.quantity)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} />
                        <TableCell>
                          <Typography fontWeight="bold">Tổng cộng:</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold">
                            {formatCurrency(selectedOrder.totalAmount - (selectedOrder.shippingFee || 0))}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Tab lịch sử */}
              {tabValue === 2 && (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Lịch sử hoạt động của đơn hàng sẽ hiển thị ở đây (cần phát triển thêm tính năng)
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                <Button 
                  color="secondary" 
                  onClick={() => handleOpenStatusUpdate(selectedOrder)}
                >
                  Cập nhật trạng thái
                </Button>
              )}
              <Button onClick={handleCloseOrderDetail}>Đóng</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog cập nhật trạng thái */}
      <Dialog
        open={statusUpdateOpen}
        onClose={handleCloseStatusUpdate}
      >
        <DialogTitle>Cập nhật trạng thái đơn hàng</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Cập nhật trạng thái cho đơn hàng #{selectedOrder?.orderNumber}
          </DialogContentText>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="new-status-label">Trạng thái mới</InputLabel>
            <Select
              labelId="new-status-label"
              value={newStatus}
              label="Trạng thái mới"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="pending">Chờ xử lý</MenuItem>
              <MenuItem value="confirmed">Đã xác nhận</MenuItem>
              <MenuItem value="processing">Đang xử lý</MenuItem>
              <MenuItem value="shipping">Đang vận chuyển</MenuItem>
              <MenuItem value="delivered">Đã giao</MenuItem>
              <MenuItem value="cancelled">Đã hủy</MenuItem>
            </Select>
          </FormControl>
          {newStatus === 'cancelled' && (
            <TextField
              fullWidth
              label="Lý do hủy đơn"
              multiline
              rows={2}
              sx={{ mt: 2 }}
              onChange={(e) => {
                if (selectedOrder) {
                  setSelectedOrder({
                    ...selectedOrder,
                    cancelReason: e.target.value
                  });
                }
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusUpdate} disabled={loading}>Hủy</Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
            color="primary"
            disabled={loading || !newStatus}
          >
            {loading ? <CircularProgress size={24} /> : 'Cập nhật'}
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

export default OrdersManagementView;
