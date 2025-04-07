import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  Paper,
  Container,
  Typography,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Button,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import axiosInstance from 'src/utils/axios';

// Icons import
import CircleIcon from '@mui/icons-material/Circle';
import RefreshIcon from '@mui/icons-material/Refresh';

// Màu sắc cho biểu đồ dịch vụ
const SERVICE_COLORS = ['#0088FE', '#FF8042', '#00C49F', '#FFBB28', '#8884d8'];

// Màu sắc cho biểu đồ phụ tùng
const PARTS_COLORS = ['#00C49F', '#0088FE', '#FF8042', '#FFBB28'];

// Ánh xạ trạng thái
const SERVICE_STATUS_MAP = {
  'Đang chờ': { color: '#0088FE', label: 'Đang chờ' },
  'Đã xác nhận': { color: '#8884d8', label: 'Hoàn thành' },
  'Đang thực hiện': { color: '#00C49F', label: 'Đang thực hiện' },
  'Hoàn thành': { color: '#FFBB28', label: 'Hoàn thành' },
  'Đã hủy': { color: '#FF8042', label: 'Đã hủy' }
};

const PARTS_STATUS_MAP = {
  'pending': { color: '#00C49F', label: 'Chờ xử lý' },
  'confirmed': { color: '#8884d8', label: 'Đã xác nhận' },
  'processing': { color: '#0088FE', label: 'Đang xử lý' },
  'shipping': { color: '#FFBB28', label: 'Đang vận chuyển' },
  'delivered': { color: '#1E88E5', label: 'Đã giao' },
  'cancelled': { color: '#FF8042', label: 'Đã hủy' }
};

const DashboardStatistics = () => {
  // States
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('today');
  const [serviceOrders, setServiceOrders] = useState([]);
  const [partsOrders, setPartsOrders] = useState([]);
  
  // Thống kê đơn dịch vụ
  const [serviceStats, setServiceStats] = useState({
    total: 0,
    byStatus: [],
    totalRevenue: 0
  });
  
  // Thống kê đơn phụ tùng
  const [partsStats, setPartsStats] = useState({
    total: 0,
    byStatus: [],
    totalRevenue: 0
  });

  // Thống kê theo tháng
  const [monthlyStats, setMonthlyStats] = useState([]);
  
  // Ngày bắt đầu và kết thúc dựa trên time range
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  
  // Khởi tạo component với dữ liệu mặc định
  useEffect(() => {
    // Khởi tạo timeRange và gọi API
    updateDateFilter(timeRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Cập nhật dateFilter khi timeRange thay đổi
  useEffect(() => {
    if (timeRange) {
      updateDateFilter(timeRange);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);
  
  // Hàm lấy date trước đó n ngày
  function getDateBefore(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  // Cập nhật filter dựa vào timeRange và fetch data
  const updateDateFilter = (selectedTimeRange) => {
    let startDate = '';
    const today = new Date().toISOString().split('T')[0];
    
    switch(selectedTimeRange) {
      case 'today':
        startDate = today;
        break;
      case 'week':
        startDate = getDateBefore(7);
        break;
      case 'month':
        startDate = getDateBefore(30);
        break;
      case 'quarter':
        startDate = getDateBefore(90);
        break;
      case 'year':
        startDate = getDateBefore(365);
        break;
      default:
        startDate = getDateBefore(7);
    }
    
    const newDateFilter = {
      startDate,
      endDate: today
    };
    
    setDateFilter(newDateFilter);
    
    // Fetch data ngay sau khi cập nhật filter
    fetchAllOrders(newDateFilter);
  };
  
  // Hàm lấy dữ liệu đơn hàng
  const fetchAllOrders = async (filters = dateFilter) => {
    setLoading(true);
    try {
      const [serviceData, partsData] = await Promise.all([
        fetchServiceOrders(filters),
        fetchPartsOrders(filters)
      ]);
      
      // Cập nhật state với dữ liệu mới
      setServiceOrders(serviceData);
      setPartsOrders(partsData);
      
      // Tính toán thống kê từ dữ liệu mới
      calculateStats(serviceData, partsData);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu đơn hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  // Lấy dữ liệu đơn dịch vụ
  const fetchServiceOrders = async (filters) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Filter theo thời gian với format ISO cho Strapi
      if (filters.startDate) {
        // Bắt đầu từ đầu ngày của startDate (00:00:00)
        const startDate = new Date(filters.startDate);
        startDate.setHours(0, 0, 0, 0);
        queryParams.append('filters[createdAt][$gte]', startDate.toISOString());
      }
      
      if (filters.endDate) {
        // Kết thúc vào cuối ngày của endDate (23:59:59.999)
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        queryParams.append('filters[createdAt][$lte]', endDate.toISOString());
      }
      
      // Thêm populate để lấy thông tin liên quan
      queryParams.append('populate', '*');
      queryParams.append('pagination[pageSize]', 100); // Tăng số lượng items mỗi trang
      
      const response = await axiosInstance.get(`/service-orders?${queryParams.toString()}`);
      return response.data || [];
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu đơn dịch vụ:', error);
      return [];
    }
  };

  // Lấy dữ liệu đơn phụ tùng
  const fetchPartsOrders = async (filters) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Filter theo thời gian với format ISO cho Strapi
      if (filters.startDate) {
        // Bắt đầu từ đầu ngày của startDate (00:00:00)
        const startDate = new Date(filters.startDate);
        startDate.setHours(0, 0, 0, 0);
        queryParams.append('filters[createdAt][$gte]', startDate.toISOString());
      }
      
      if (filters.endDate) {
        // Kết thúc vào cuối ngày của endDate (23:59:59.999)
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        queryParams.append('filters[createdAt][$lte]', endDate.toISOString());
      }
      
      // Thêm populate để lấy thông tin liên quan
      queryParams.append('populate', '*');
      queryParams.append('pagination[pageSize]', 100); // Tăng số lượng items mỗi trang
      
      const response = await axiosInstance.get(`/orders?${queryParams.toString()}`);
      return response.data || [];
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu đơn phụ tùng:', error);
      return [];
    }
  };

  // Tính toán thống kê từ dữ liệu
  const calculateStats = (serviceData = serviceOrders, partsData = partsOrders) => {
    // Thống kê đơn dịch vụ
    if (serviceData && serviceData.length > 0) {
      // Tổng số đơn
      const total = serviceData.length;
      
      // Thống kê theo trạng thái
      const statusCounts = {
        'Đang chờ': 0,
        'Đã xác nhận': 0,
        'Đang thực hiện': 0,
        'Hoàn thành': 0,
        'Đã hủy': 0
      };
      
      let totalRevenue = 0;
      
      serviceData.forEach(order => {
        // Đếm theo trạng thái
        const status = order.status_order || 'Đang chờ';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
        
        // Tính tổng doanh thu
        totalRevenue += parseFloat(order.totalAmount || 0);
      });
      
      // Chuyển đổi sang định dạng cho biểu đồ
      const byStatus = Object.entries(statusCounts)
        .filter(([_, count]) => count > 0) // Lọc bỏ các trạng thái có count = 0
        .map(([status, count]) => ({
          name: status,
          value: count
        }));
      
      setServiceStats({
        total,
        byStatus,
        totalRevenue
      });
    } else {
      // Reset khi không có dữ liệu
      setServiceStats({
        total: 0,
        byStatus: [],
        totalRevenue: 0
      });
    }
    
    // Thống kê đơn phụ tùng
    if (partsData && partsData.length > 0) {
      // Tổng số đơn
      const total = partsData.length;
      
      // Thống kê theo trạng thái
      const statusCounts = {
        'pending': 0,
        'confirmed': 0,
        'processing': 0,
        'shipping': 0, 
        'delivered': 0,
        'cancelled': 0
      };
      
      let totalRevenue = 0;
      
      partsData.forEach(order => {
        // Đếm theo trạng thái
        const status = order.status_order || 'pending';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
        
        // Tính tổng doanh thu
        totalRevenue += parseFloat(order.totalAmount || 0);
      });
      
      // Chuyển đổi sang định dạng cho biểu đồ
      const byStatus = Object.entries(statusCounts)
        .filter(([_, count]) => count > 0) // Lọc bỏ các trạng thái có count = 0
        .map(([status, count]) => ({
          name: status,
          value: count
        }));
      
      setPartsStats({
        total,
        byStatus,
        totalRevenue
      });
    } else {
      // Reset khi không có dữ liệu
      setPartsStats({
        total: 0,
        byStatus: [],
        totalRevenue: 0
      });
    }
    
    // Tính toán thống kê theo tháng
    calculateMonthlyStats(serviceData, partsData);
  };

  // Tính toán thống kê theo tháng
  const calculateMonthlyStats = (serviceData = serviceOrders, partsData = partsOrders) => {
    // Tạo đối tượng lưu trữ dữ liệu theo tháng
    const months = {};
    
    // Tạo mảng tháng trong năm hiện tại
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 12; i++) {
      const monthKey = `T${i + 1}`;
      months[monthKey] = {
        month: monthKey,
        serviceOrders: 0,
        partsOrders: 0,
        serviceRevenue: 0,
        partsRevenue: 0
      };
    }
    
    // Xử lý đơn dịch vụ
    serviceData && serviceData.forEach(order => {
      if (!order.createdAt) return;
      
      const date = new Date(order.createdAt);
      const monthKey = `T${date.getMonth() + 1}`;
      
      if (months[monthKey]) {
        months[monthKey].serviceOrders += 1;
        months[monthKey].serviceRevenue += parseFloat(order.totalAmount || 0);
      }
    });
    
    // Xử lý đơn phụ tùng
    partsData && partsData.forEach(order => {
      if (!order.createdAt) return;
      
      const date = new Date(order.createdAt);
      const monthKey = `T${date.getMonth() + 1}`;
      
      if (months[monthKey]) {
        months[monthKey].partsOrders += 1;
        months[monthKey].partsRevenue += parseFloat(order.totalAmount || 0);
      }
    });
    
    // Chuyển object thành array và lọc bỏ các tháng không có đơn hàng
    const monthlyData = Object.values(months)
      .filter(m => m.serviceOrders > 0 || m.partsOrders > 0)
      .sort((a, b) => {
        // Sắp xếp theo thứ tự tháng
        return parseInt(a.month.substring(1)) - parseInt(b.month.substring(1));
      });
    
    setMonthlyStats(monthlyData);
  };
  
  // Xử lý thay đổi khoảng thời gian
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };
  
  // Xử lý nút cập nhật - Refresh data
  const handleRefreshData = () => {
    fetchAllOrders();
  };
  
  // Định dạng tiền tệ VND
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') {
      amount = parseFloat(amount || 0);
    }
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Tạo dữ liệu hiển thị chi tiết cho đơn dịch vụ
  const getServiceStatusDetails = () => {
    const statusCounts = {
      'Đang chờ': 0,
      'Hoàn thành': 0,
      'Đã hủy': 0,
      'Đang thực hiện': 0,
      'Đã xác nhận': 0
    };
    
    serviceStats.byStatus.forEach(item => {
      statusCounts[item.name] = item.value;
    });
    
    return [
      { label: `Đang chờ: ${statusCounts['Đang chờ']} đơn`, color: SERVICE_COLORS[0] },
      { label: `Hoàn thành: ${statusCounts['Hoàn thành']} đơn`, color: SERVICE_COLORS[3] },
      { label: `Đã hủy: ${statusCounts['Đã hủy']} đơn`, color: SERVICE_COLORS[1] },
      { label: `Đang thực hiện: ${statusCounts['Đang thực hiện']} đơn`, color: SERVICE_COLORS[2] },
      { label: `Đã xác nhận: ${statusCounts['Đã xác nhận']} đơn`, color: SERVICE_COLORS[4] }
    ].filter(item => !item.label.includes(' 0 đơn'));  // Loại bỏ các trạng thái có 0 đơn
  };
  
  // Tạo dữ liệu hiển thị chi tiết cho đơn phụ tùng
  const getPartsStatusDetails = () => {
    const statusCounts = {
      'pending': 0,
      'confirmed': 0,
      'processing': 0,
      'shipping': 0,
      'delivered': 0,
      'cancelled': 0
    };
    
    partsStats.byStatus.forEach(item => {
      statusCounts[item.name] = item.value;
    });
    
    return [
      { label: `Chờ xử lý: ${statusCounts['pending']} đơn`, color: PARTS_COLORS[0], key: 'pending' },
      { label: `Đã giao: ${statusCounts['delivered']} đơn`, color: PARTS_COLORS[1], key: 'delivered' },
      { label: `Đã hủy: ${statusCounts['cancelled']} đơn`, color: PARTS_COLORS[2], key: 'cancelled' },
      { label: `Đã xác nhận: ${statusCounts['confirmed']} đơn`, color: PARTS_COLORS[3], key: 'confirmed' }
    ].filter(item => !item.label.includes(' 0 đơn'));  // Loại bỏ các trạng thái có 0 đơn
  };
  
  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
      <Container>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Thống kê đơn hàng
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Thống kê tổng quan về đơn dịch vụ và đơn phụ tùng
          </Typography>
        </Box>
        
        {/* Bộ lọc thời gian */}
        <Paper sx={{ p: 2, mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="time-range-label">Khoảng thời gian</InputLabel>
            <Select
              labelId="time-range-label"
              id="time-range-select"
              value={timeRange}
              onChange={handleTimeRangeChange}
              label="Khoảng thời gian"
            >
              <MenuItem value="today">Hôm nay</MenuItem>
              <MenuItem value="week">7 ngày qua</MenuItem>
              <MenuItem value="month">30 ngày qua</MenuItem>
              <MenuItem value="quarter">Quý này</MenuItem>
              <MenuItem value="year">Năm nay</MenuItem>
            </Select>
          </FormControl>
          
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleRefreshData}
            startIcon={<RefreshIcon />}
          >
            Cập nhật
          </Button>
        </Paper>
        
        {/* Loading indicator */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {/* Thống kê tổng quan */}
        {!loading && (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Thống kê đơn dịch vụ */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                      Thống kê đơn dịch vụ
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={5}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Tổng số đơn dịch vụ
                          </Typography>
                          <Typography variant="h3" sx={{ my: 1 }}>
                            {serviceStats.total}
                          </Typography>
                        </Box>
                        
                        <List dense sx={{ p: 0 }}>
                          {getServiceStatusDetails().map((item, index) => (
                            <ListItem key={index} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <CircleIcon sx={{ color: item.color, fontSize: 12 }} />
                              </ListItemIcon>
                              <ListItemText primary={item.label} />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                      
                      <Grid item xs={12} sm={7}>
                        <Box sx={{ height: 200, display: 'flex', justifyContent: 'center' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={serviceStats.byStatus}
                                cx="50%"
                                cy="50%"
                                innerRadius={0}
                                outerRadius={80}
                                paddingAngle={0}
                                dataKey="value"
                              >
                                {serviceStats.byStatus.map((entry, index) => (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={SERVICE_STATUS_MAP[entry.name]?.color || SERVICE_COLORS[index % SERVICE_COLORS.length]} 
                                  />
                                ))}
                              </Pie>
                              <Tooltip 
                                formatter={(value, name) => [`${value} đơn`, name]} 
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Thống kê đơn phụ tùng */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                      Thống kê đơn phụ tùng
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={5}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Tổng số đơn phụ tùng
                          </Typography>
                          <Typography variant="h3" sx={{ my: 1 }}>
                            {partsStats.total}
                          </Typography>
                        </Box>
                        
                        <List dense sx={{ p: 0 }}>
                          {getPartsStatusDetails().map((item, index) => (
                            <ListItem key={item.key} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <CircleIcon sx={{ color: item.color, fontSize: 12 }} />
                              </ListItemIcon>
                              <ListItemText primary={item.label} />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                      
                      <Grid item xs={12} sm={7}>
                        <Box sx={{ height: 200, display: 'flex', justifyContent: 'center' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={partsStats.byStatus}
                                cx="50%"
                                cy="50%"
                                innerRadius={0}
                                outerRadius={80}
                                paddingAngle={0}
                                dataKey="value"
                              >
                                {partsStats.byStatus.map((entry, index) => (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={PARTS_STATUS_MAP[entry.name]?.color || PARTS_COLORS[index % PARTS_COLORS.length]} 
                                  />
                                ))}
                              </Pie>
                              <Tooltip 
                                formatter={(value, name) => [
                                  `${value} đơn`, 
                                  PARTS_STATUS_MAP[name]?.label || name
                                ]} 
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {/* Biểu đồ thống kê theo tháng */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  Thống kê theo tháng
                </Typography>
                
                {monthlyStats.length > 0 ? (
                  <Box sx={{ height: 300, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={monthlyStats}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value, name) => {
                          if (name === "serviceOrders") return [`${value} đơn`, "Số đơn dịch vụ"];
                          if (name === "partsOrders") return [`${value} đơn`, "Số đơn phụ tùng"];
                          return [value, name];
                        }} />
                        <Legend />
                        <Bar dataKey="serviceOrders" name="Số đơn dịch vụ" fill="#8884d8" />
                        <Bar dataKey="partsOrders" name="Số đơn phụ tùng" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 5 }}>
                    Không có dữ liệu đơn hàng trong khoảng thời gian này
                  </Typography>
                )}
              </CardContent>
            </Card>
            
            {/* Thống kê tổng doanh thu */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  Tổng doanh thu
                </Typography>
                
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Doanh thu dịch vụ
                      </Typography>
                      <Typography variant="h5" color="primary.main">
                        {formatCurrency(serviceStats.totalRevenue)}
                      </Typography>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Doanh thu phụ tùng
                      </Typography>
                      <Typography variant="h5" color="secondary.main">
                        {formatCurrency(partsStats.totalRevenue)}
                      </Typography>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ p: 2, bgcolor: 'primary.light' }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Tổng doanh thu
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {formatCurrency(serviceStats.totalRevenue + partsStats.totalRevenue)}
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </>
        )}
      </Container>
    </Box>
  );
};

export default DashboardStatistics;