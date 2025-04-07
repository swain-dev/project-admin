import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Avatar,
  Button,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Home,
  Edit,
  ArrowBack
} from '@mui/icons-material';
import axiosInstance from 'src/utils/axios';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const userFromStorage = JSON.parse(localStorage.getItem('user'));
        const userId = userFromStorage?.id;
        
        if (!userId) {
          throw new Error('Không tìm thấy ID người dùng');
        }

        const response = await axiosInstance.get(`/users/${userId}`);
        setUserData(response);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  // Hiển thị skeleton khi đang tải dữ liệu
  if (loading) {
    return (
      <Container component="main" maxWidth="md">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Skeleton variant="circular" width={150} height={150} />
                <Skeleton variant="text" width={120} height={40} sx={{ mt: 2 }} />
                <Skeleton variant="rectangular" width={150} height={36} sx={{ mt: 2 }} />
              </Grid>
              <Grid item xs={12} md={8}>
                <Skeleton variant="text" width={200} height={40} />
                <Skeleton variant="rectangular" height={20} sx={{ my: 1 }} />
                <Skeleton variant="rectangular" height={20} sx={{ my: 1 }} />
                <Skeleton variant="rectangular" height={20} sx={{ my: 1 }} />
                <Skeleton variant="rectangular" height={20} sx={{ my: 1 }} />
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Container>
    );
  }

  // Hiển thị thông báo lỗi nếu có
  if (error) {
    return (
      <Container component="main" maxWidth="md">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => navigate('/')}
            startIcon={<ArrowBack />}
          >
            Quay lại trang chủ
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: { md: 1, xs: 0 }, borderColor: 'divider' }}>
              <Avatar
                src={userData?.avatar?.url}
                sx={{ width: 150, height: 150, mb: 2 }}
              >
                {userData?.username ? userData.username.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                {userData?.username || 'Người dùng'}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={handleEditProfile}
                sx={{ mt: 2 }}
              >
                Chỉnh sửa thông tin
              </Button>
              <Button
                variant="outlined"
                onClick={handleChangePassword}
                sx={{ mt: 2 }}
              >
                Đổi mật khẩu
              </Button>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium' }}>
                Thông tin cá nhân
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText primary="Họ và tên" secondary={userData?.fullName || 'Chưa cập nhật'} />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Email />
                  </ListItemIcon>
                  <ListItemText primary="Email" secondary={userData?.email || 'Chưa cập nhật'} />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Phone />
                  </ListItemIcon>
                  <ListItemText primary="Số điện thoại" secondary={userData?.phone || 'Chưa cập nhật'} />
                </ListItem>
              </List>
              
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Thông tin tài khoản
              </Typography>
              <Card variant="outlined" sx={{ mt: 1 }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Ngày đăng ký: {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('vi-VN') : 'Không xác định'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cập nhật gần nhất: {userData?.updatedAt ? new Date(userData.updatedAt).toLocaleDateString('vi-VN') : 'Không xác định'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID người dùng: {userData?.id || 'Không xác định'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
}
