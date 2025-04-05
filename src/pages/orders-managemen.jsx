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
  Stack,
  Pagination
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
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // State cho lọc và tìm kiếm
  const [filters, setFilters] = useState({
    status_order: '',
    paymentStatus: '',
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
  const [newPaymentStatus, setNewPaymentStatus] = useState('');

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
      // Sử dụng cú pháp phân trang của Strapi
      const queryParams = new URLSearchParams();
      queryParams.append('pagination[page]', page);
      queryParams.append('pagination[pageSize]', rowsPerPage);
      
      // Sử dụng cú pháp filter của Strapi
      if (filters.status_order) {
        queryParams.append('filters[status_order][$eq]', filters.status_order);
      }
      
      // Filter theo trạng thái thanh toán
      if (filters.paymentStatus) {
        queryParams.append('filters[paymentStatus][$eq]', filters.paymentStatus);
      }
      
      if (filters.dateFrom) {
        queryParams.append('filters[createdAt][$gte]', new Date(filters.dateFrom).toISOString());
      }
      
      if (filters.dateTo) {
        // Thêm 1 ngày để bao gồm cả ngày được chọn
        const dateTo = new Date(filters.dateTo);
        dateTo.setDate(dateTo.getDate() + 1);
        queryParams.append('filters[createdAt][$lte]', dateTo.toISOString());
      }
      
      if (filters.searchTerm) {
        queryParams.append('filters[$or][0][orderNumber][$containsi]', filters.searchTerm);
        queryParams.append('filters[$or][1][user][username][$containsi]', filters.searchTerm);
      }
      
      // Thêm populate để lấy thông tin liên quan
      queryParams.append('populate', '*');

      // Sắp xếp theo thời gian tạo mới nhất
      queryParams.append('sort[0]', 'createdAt:desc');

      const response = await axiosInstance.get(`/orders?${queryParams.toString()}`);
      console.log('Orders response:', response);
      
      setOrders(response.data);
      setTotalOrders(response.meta?.pagination?.total || 0);
      setTotalPages(Math.ceil(response.meta?.pagination?.total / rowsPerPage) || 1);
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
      const response = await axiosInstance.get(`/orders/${orderId}?populate=*`);
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
    setNewStatus(order.status_order);
    setNewPaymentStatus(order.paymentStatus || 'unpaid');
    setStatusUpdateOpen(true);
  };

  // Hàm đóng dialog cập nhật trạng thái
  const handleCloseStatusUpdate = () => {
    setStatusUpdateOpen(false);
    setSelectedOrder(null);
    setNewStatus('');
    setNewPaymentStatus('');
  };

  // Hàm cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus || !newPaymentStatus) return;

    setLoading(true);
    try {
      await axiosInstance.put(`/orders/${selectedOrder.documentId}`, {
        data: {
          status_order: newStatus,
          paymentStatus: newPaymentStatus,
          paymentReference: selectedOrder.paymentReference,
          cancelReason: selectedOrder.cancelReason,
          ...(newStatus === 'delivered' && { deliveredAt: new Date().toISOString() }),
          ...(newStatus === 'cancelled' && { cancelledAt: new Date().toISOString() }),
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
    setPage(1); // Reset về trang đầu tiên khi thay đổi bộ lọc
  };

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    // Đã có useEffect theo dõi thay đổi của filters
  };

  // Reset bộ lọc
  const handleResetFilters = () => {
    setFilters({
      status_order: '',
      paymentStatus: '',
      dateFrom: '',
      dateTo: '',
      searchTerm: ''
    });
    setPage(1);
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

  // Xử lý thay đổi trang
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  // Render chip trạng thái đơn hàng với màu tương ứng
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

  // Render chip trạng thái thanh toán với màu tương ứng
  const renderPaymentStatusChip = (status) => {
    let color = 'default';
    let label = status;

    switch (status) {
      case 'unpaid':
        color = 'warning';
        label = 'Chưa thanh toán';
        break;
      case 'processing':
        color = 'info';
        label = 'Đang xử lý';
        break;
      case 'partially_paid':
        color = 'secondary';
        label = 'Thanh toán một phần';
        break;
      case 'paid':
        color = 'success';
        label = 'Đã thanh toán';
        break;
      case 'refunded':
        color = 'error';
        label = 'Đã hoàn tiền';
        break;
      default:
        label = 'Chưa thanh toán';
        color = 'warning';
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
            <InputLabel id="status-filter-label">Trạng thái đơn</InputLabel>
            <Select
              labelId="status-filter-label"
              label="Trạng thái đơn"
              name="status_order"
              value={filters.status_order}
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
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="payment-status-filter-label">Trạng thái thanh toán</InputLabel>
            <Select
              labelId="payment-status-filter-label"
              label="Trạng thái thanh toán"
              name="paymentStatus"
              value={filters.paymentStatus}
              onChange={handleFilterChange}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="unpaid">Chưa thanh toán</MenuItem>
              <MenuItem value="processing">Đang xử lý</MenuItem>
              <MenuItem value="partially_paid">Thanh toán một phần</MenuItem>
              <MenuItem value="paid">Đã thanh toán</MenuItem>
              <MenuItem value="refunded">Đã hoàn tiền</MenuItem>
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
            <Button 
              variant="outlined" 
              onClick={handleResetFilters}
              size="small"
            >
              Đặt lại bộ lọc
            </Button>
          </Box>
        )}
      </Paper>

      {loading && !orders.length && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>}

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Bảng danh sách đơn hàng */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: 'primary.light' }}>
            <TableRow>
              <TableCell>Mã đơn hàng</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell>Ngày đặt</TableCell>
              <TableCell>Tổng tiền</TableCell>
              <TableCell>Trạng thái đơn</TableCell>
              <TableCell>Trạng thái thanh toán</TableCell>
              <TableCell>Phương thức thanh toán</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  {loading ? 'Đang tải...' : 'Không có đơn hàng nào'}
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>{order.user?.username || 'N/A'}</TableCell>
                  <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                  <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                  <TableCell>{renderStatusChip(order.status_order)}</TableCell>
                  <TableCell>{renderPaymentStatusChip(order.paymentStatus || 'unpaid')}</TableCell>
                  <TableCell>
                    {order.paymentMethod === 'cod' && 'Tiền mặt khi nhận hàng'}
                    {order.paymentMethod === 'bank_transfer' && 'Chuyển khoản'}
                    {order.paymentMethod === 'credit_card' && 'Thẻ tín dụng'}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleViewOrderDetail(order.documentId)}
                      title="Xem chi tiết"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton 
                      color="secondary" 
                      onClick={() => handleOpenStatusUpdate(order)}
                      title="Cập nhật trạng thái"
                      disabled={
                        (order.status_order === 'delivered' && order.paymentStatus === 'paid') || 
                        (order.status_order === 'cancelled' && order.paymentStatus === 'refunded')
                      }
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

      {/* Phân trang */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

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
                            {renderStatusChip(selectedOrder.status_order)}
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
                                {renderPaymentStatusChip(selectedOrder.paymentStatus || 'unpaid')}
                              </Typography>
                              {selectedOrder.paidAt && (
                                <Typography>
                                  <strong>Ngày thanh toán:</strong> {formatDateTime(selectedOrder.paidAt)}
                                </Typography>
                              )}
                              {selectedOrder.paymentReference && (
                                <Typography>
                                  <strong>Mã giao dịch:</strong> {selectedOrder.paymentReference}
                                </Typography>
                              )}
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
                        <TableCell>{selectedOrder.car_part?.sku || 'N/A'}</TableCell>
                        <TableCell>{selectedOrder.car_part?.name || 'N/A'}</TableCell>
                        <TableCell>{selectedOrder.car_part?.brand || 'N/A'}</TableCell>
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
              {!((selectedOrder.status_order === 'delivered' && selectedOrder.paymentStatus === 'paid') || 
                (selectedOrder.status_order === 'cancelled' && selectedOrder.paymentStatus === 'refunded')) && (
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
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cập nhật trạng thái đơn hàng</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Cập nhật trạng thái cho đơn hàng #{selectedOrder?.orderNumber}
          </DialogContentText>
          
          {/* Trạng thái đơn hàng */}
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Trạng thái đơn hàng
          </Typography>
          <FormControl fullWidth size="small" sx={{ mb: 3 }}>
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
          
          {/* Trạng thái thanh toán */}
          <Typography variant="subtitle2" gutterBottom>
            Trạng thái thanh toán
          </Typography>
          <FormControl fullWidth size="small" sx={{ mb: 3 }}>
            <InputLabel id="new-payment-status-label">Trạng thái thanh toán</InputLabel>
            <Select
              labelId="new-payment-status-label"
              value={newPaymentStatus}
              label="Trạng thái thanh toán"
              onChange={(e) => setNewPaymentStatus(e.target.value)}
            >
              <MenuItem value="unpaid">Chưa thanh toán</MenuItem>
              <MenuItem value="processing">Đang xử lý thanh toán</MenuItem>
              <MenuItem value="partially_paid">Thanh toán một phần</MenuItem>
              <MenuItem value="paid">Đã thanh toán</MenuItem>
              <MenuItem value="refunded">Đã hoàn tiền</MenuItem>
            </Select>
          </FormControl>
          
          {/* Thông tin thanh toán bổ sung */}
          {newPaymentStatus === 'paid' && (
            <TextField
              fullWidth
              size="small"
              label="Mã giao dịch / Ghi chú thanh toán"
              name="paymentReference"
              sx={{ mb: 2 }}
              onChange={(e) => {
                if (selectedOrder) {
                  setSelectedOrder({
                    ...selectedOrder,
                    paymentReference: e.target.value
                  });
                }
              }}
              value={selectedOrder?.paymentReference || ''}
            />
          )}
          
          {/* Lý do hủy đơn */}
          {newStatus === 'cancelled' && (
            <TextField
              fullWidth
              label="Lý do hủy đơn"
              multiline
              rows={2}
              size="small"
              sx={{ mt: 2 }}
              onChange={(e) => {
                if (selectedOrder) {
                  setSelectedOrder({
                    ...selectedOrder,
                    cancelReason: e.target.value
                  });
                }
              }}
              value={selectedOrder?.cancelReason || ''}
            />
          )}
          
          {/* Thông báo tự động khi trạng thái đơn hàng và thanh toán không phù hợp */}
          {newStatus === 'delivered' && newPaymentStatus !== 'paid' && newPaymentStatus !== 'partially_paid' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Đơn hàng được đánh dấu là đã giao nhưng chưa được thanh toán đầy đủ. Với phương thức COD, bạn nên chuyển trạng thái thanh toán sang "Đã thanh toán".
            </Alert>
          )}
          
          {newStatus === 'cancelled' && newPaymentStatus === 'paid' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Đơn hàng đã thanh toán nhưng đang được đánh dấu hủy. Bạn có thể cần cập nhật trạng thái thanh toán sang "Đã hoàn tiền".
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusUpdate} disabled={loading}>Hủy</Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
            color="primary"
            disabled={loading || !newStatus || !newPaymentStatus}
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