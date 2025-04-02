import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Button,
  TextField,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  Chip,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Pagination,
  Snackbar,
  Alert,
  Paper,
  Breadcrumbs,
  Link,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import axiosInstance from 'src/utils/axios';

// Thay thế các Icon với Unicode hoặc text
const SearchIcon = () => <span style={{ fontSize: '1.2rem' }}>🔍</span>;
const CartIcon = () => <span style={{ fontSize: '1.2rem' }}>🛒</span>;
const HomeIcon = () => <span style={{ fontSize: '1.2rem' }}>🏠</span>;
const ExpandMoreIcon = () => <span style={{ fontSize: '1.2rem' }}>⯆</span>;

const UserOrderInterface = () => {
  // State cho danh sách phụ tùng
  const [carParts, setCarParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State cho phân trang
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // State cho tìm kiếm và lọc
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000000]); // Giả định là VND

  // State cho chi tiết sản phẩm
  const [selectedPart, setSelectedPart] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // State cho đơn hàng
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [orderInfo, setOrderInfo] = useState({
    shippingAddress: '',
    contactPhone: '',
    paymentMethod: 'cod',
    note: ''
  });

  // State cho thông báo
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Lấy danh sách phụ tùng khi component mount
  useEffect(() => {
    fetchCarParts();
    fetchCategories();
  }, [page, selectedCategory, searchQuery]);

  // Hàm lấy danh sách phụ tùng từ API
  const fetchCarParts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('pageSize', 12); // Hiển thị 12 sản phẩm mỗi trang
      
      if (searchQuery) queryParams.append('search', searchQuery);
      if (selectedCategory) queryParams.append('category', selectedCategory);
      
      const response = await axiosInstance.get(`/car-parts?${queryParams.toString()}&populate=*`);
      console.log('Car parts response:', response);
      
      setCarParts(response.data);
      setTotalPages(Math.ceil(response.meta.pagination.total / response.meta.pagination.pageSize));
      setError(null);
    } catch (err) {
      console.error('Error fetching car parts:', err);
      setError('Không thể tải danh sách phụ tùng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy danh sách danh mục
  const fetchCategories = async () => {
    try {
      // Giả định API trả về danh sách các danh mục duy nhất
      const response = await axiosInstance.get('/car-parts/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Xử lý khi click vào sản phẩm để xem chi tiết
  const handleViewDetail = (part) => {
    setSelectedPart(part);
    setDetailDialogOpen(true);
    setQuantity(1);
  };

  // Xử lý khi đóng dialog chi tiết
  const handleCloseDetail = () => {
    setDetailDialogOpen(false);
  };

  // Xử lý khi thay đổi số lượng
  const handleQuantityChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (value > 0) {
      setQuantity(value);
    }
  };

  // Xử lý khi mở dialog đặt hàng
  const handleOpenOrderDialog = () => {
    setDetailDialogOpen(false);
    setOrderDialogOpen(true);
  };

  // Xử lý khi đóng dialog đặt hàng
  const handleCloseOrderDialog = () => {
    setOrderDialogOpen(false);
  };

  // Xử lý khi thay đổi thông tin đặt hàng
  const handleOrderInfoChange = (e) => {
    const { name, value } = e.target;
    setOrderInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Xử lý khi gửi đơn hàng
  const handleSubmitOrder = async () => {
    // Kiểm tra thông tin bắt buộc
    if (!orderInfo.shippingAddress || !orderInfo.contactPhone) {
      setSnackbar({
        open: true,
        message: 'Vui lòng điền đầy đủ địa chỉ và số điện thoại.',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      // Tạo mã đơn hàng
      const date = new Date();
      const formattedDate = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
      const randomCode = Math.floor(1000 + Math.random() * 9000); // Số ngẫu nhiên 4 chữ số
      const orderNumber = `ORD-${formattedDate}-${randomCode}`;

      // Tính tổng tiền
      const totalAmount = selectedPart.price * quantity;
      const shippingFee = 30000; // Phí vận chuyển cố định, có thể thay đổi theo logic riêng

      // Chuẩn bị dữ liệu đơn hàng
      const orderData = {
        orderNumber,
        user: user.id, // Giả định đã có thông tin user từ context hoặc API
        carPart: selectedPart.id,
        quantity,
        unitPrice: selectedPart.price,
        status: 'pending',
        totalAmount: totalAmount + shippingFee,
        shippingFee,
        shippingAddress: orderInfo.shippingAddress,
        contactPhone: orderInfo.contactPhone,
        paymentMethod: orderInfo.paymentMethod,
        paymentStatus: 'unpaid',
        note: orderInfo.note
      };

      console.log('Sending order data:', orderData);
      
      // Gửi đơn hàng lên server
      await axiosInstance.post('/orders', {
        data: orderData
      });

      // Hiển thị thông báo thành công
      setSnackbar({
        open: true,
        message: 'Đặt hàng thành công! Chúng tôi sẽ liên hệ với bạn sớm.',
        severity: 'success'
      });

      // Đóng dialog và reset trạng thái
      setOrderDialogOpen(false);
      setSelectedPart(null);
      setOrderInfo({
        shippingAddress: '',
        contactPhone: '',
        paymentMethod: 'cod',
        note: ''
      });
      
    } catch (err) {
      console.error('Error creating order:', err);
      setSnackbar({
        open: true,
        message: `Lỗi: ${err.response?.data?.error?.message || 'Không thể tạo đơn hàng'}`,
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

  // Xử lý thay đổi trang
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  // Định dạng giá VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }} separator="›" aria-label="breadcrumb">
        <Link
          underline="hover"
          color="inherit"
          href="/"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon />&nbsp;Trang chủ
        </Link>
        <Typography color="text.primary">Phụ tùng ô tô</Typography>
      </Breadcrumbs>

      {/* Tiêu đề trang */}
      <Typography variant="h4" component="h1" gutterBottom>
        Phụ tùng ô tô chính hãng
      </Typography>
      
      {/* Thanh tìm kiếm và lọc */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          label="Tìm kiếm phụ tùng"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, minWidth: 200 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Danh mục</InputLabel>
          <Select
            value={selectedCategory}
            label="Danh mục"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.value} value={category.value}>
                {category.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* Thông báo lỗi */}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Danh sách phụ tùng */}
      {loading && !carParts.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {carParts.map((part) => (
              <Grid item key={part.id} xs={12} sm={6} md={4} lg={3}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 3
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="160"
                    image={part.image && part.image.length > 0 
                      ? `http://localhost:1337${part.image[0].url}` 
                      : '/path/to/default-image.jpg'}
                    alt={part.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="div" noWrap>
                      {part.name}
                    </Typography>
                    <Chip 
                      label={part.brand} 
                      size="small" 
                      sx={{ mb: 1 }} 
                      color="primary" 
                      variant="outlined"
                    />
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {part.category}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 1, fontWeight: 'bold' }}>
                      {formatCurrency(part.price)}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      variant="contained" 
                      fullWidth
                      onClick={() => handleViewDetail(part)}
                    >
                      Xem chi tiết
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Phân trang */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange}
              color="primary" 
            />
          </Box>
        </>
      )}

      {/* Dialog chi tiết sản phẩm */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth
      >
        {selectedPart && (
          <>
            <DialogTitle>{selectedPart.name}</DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={5}>
                  {selectedPart.image && selectedPart.image.length > 0 ? (
                    <Box
                      component="img"
                      src={`http://localhost:1337${selectedPart.image[0].url}`}
                      alt={selectedPart.name}
                      sx={{ width: '100%', borderRadius: 1 }}
                    />
                  ) : (
                    <Box
                      component="img"
                      src="/path/to/default-image.jpg"
                      alt={selectedPart.name}
                      sx={{ width: '100%', borderRadius: 1 }}
                    />
                  )}
                </Grid>
                <Grid item xs={12} md={7}>
                  <Typography variant="h5" component="div" gutterBottom>
                    {selectedPart.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Chip 
                      label={selectedPart.brand} 
                      color="primary" 
                      sx={{ mr: 1 }} 
                    />
                    <Chip 
                      label={selectedPart.category} 
                      variant="outlined" 
                    />
                  </Box>
                  
                  <Typography variant="h5" color="primary" sx={{ my: 2, fontWeight: 'bold' }}>
                    {formatCurrency(selectedPart.price)}
                  </Typography>
                  
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Mã sản phẩm: <strong>{selectedPart.sku}</strong>
                  </Typography>
                  
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Bảo hành: <strong>{selectedPart.warranty || 'Theo tiêu chuẩn nhà sản xuất'}</strong>
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Typography variant="body1" sx={{ mr: 2 }}>Số lượng:</Typography>
                    <TextField
                      type="number"
                      size="small"
                      value={quantity}
                      onChange={handleQuantityChange}
                      inputProps={{ min: 1, max: 100 }}
                      sx={{ width: 70 }}
                    />
                  </Box>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    startIcon={<CartIcon />}
                    onClick={handleOpenOrderDialog}
                    sx={{ mb: 2 }}
                  >
                    Đặt hàng ngay
                  </Button>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Mô tả sản phẩm
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedPart.description || 'Không có mô tả chi tiết cho sản phẩm này.'}
              </Typography>
              
              {selectedPart.specifications && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Thông số kỹ thuật
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        {Object.entries(JSON.parse(selectedPart.specifications)).map(([key, value]) => (
                          <TableRow key={key}>
                            <TableCell component="th" scope="row" sx={{ width: '40%', backgroundColor: '#f5f5f5' }}>
                              {key}
                            </TableCell>
                            <TableCell>{value}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetail}>Đóng</Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleOpenOrderDialog}
              >
                Đặt hàng
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog đặt hàng */}
      <Dialog
        open={orderDialogOpen}
        onClose={handleCloseOrderDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Thông tin đặt hàng</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Vui lòng điền thông tin để hoàn tất đơn hàng của bạn.
          </DialogContentText>
          
          {selectedPart && (
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  component="img"
                  src={selectedPart.image && selectedPart.image.length > 0 
                    ? `http://localhost:1337${selectedPart.image[0].url}` 
                    : '/path/to/default-image.jpg'}
                  alt={selectedPart.name}
                  sx={{ width: 60, height: 60, objectFit: 'cover', mr: 2 }}
                />
                <Box>
                  <Typography variant="subtitle1">{selectedPart.name}</Typography>
                  <Typography variant="body2">
                    {formatCurrency(selectedPart.price)} x {quantity} = {formatCurrency(selectedPart.price * quantity)}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Tạm tính:</Typography>
                <Typography fontWeight="bold">{formatCurrency(selectedPart.price * quantity)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Phí vận chuyển:</Typography>
                <Typography>{formatCurrency(30000)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography fontWeight="bold">Tổng thanh toán:</Typography>
                <Typography fontWeight="bold" color="primary">
                  {formatCurrency(selectedPart.price * quantity + 30000)}
                </Typography>
              </Box>
            </Paper>
          )}
          
          <TextField
            margin="dense"
            label="Địa chỉ giao hàng"
            type="text"
            fullWidth
            name="shippingAddress"
            value={orderInfo.shippingAddress}
            onChange={handleOrderInfoChange}
            required
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Số điện thoại liên hệ"
            type="tel"
            fullWidth
            name="contactPhone"
            value={orderInfo.contactPhone}
            onChange={handleOrderInfoChange}
            required
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Phương thức thanh toán</InputLabel>
            <Select
              name="paymentMethod"
              value={orderInfo.paymentMethod}
              label="Phương thức thanh toán"
              onChange={handleOrderInfoChange}
            >
              <MenuItem value="cod">Thanh toán khi nhận hàng (COD)</MenuItem>
              <MenuItem value="bank_transfer">Chuyển khoản ngân hàng</MenuItem>
              <MenuItem value="credit_card">Thẻ tín dụng/ghi nợ</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            label="Ghi chú (tùy chọn)"
            type="text"
            fullWidth
            name="note"
            value={orderInfo.note}
            onChange={handleOrderInfoChange}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOrderDialog} disabled={loading}>Hủy</Button>
          <Button 
            onClick={handleSubmitOrder} 
            variant="contained" 
            color="primary"
            disabled={loading || !orderInfo.shippingAddress || !orderInfo.contactPhone}
          >
            {loading ? <CircularProgress size={24} /> : 'Xác nhận đặt hàng'}
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
    </Container>
  );
};

export default UserOrderInterface;
