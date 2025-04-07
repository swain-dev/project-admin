import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Email, Check, ArrowBack } from '@mui/icons-material';
import {
  Box,
  Alert,
  Stack,
  Button,
  TextField,
  Typography,
  InputAdornment,
  FormHelperText,
  CircularProgress,
} from '@mui/material';

import { RouterLink } from 'src/routes/components';

import axiosInstance from 'src/utils/axios';

import { Logo } from 'src/components/logo';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateEmail = (value) => {
    if (!value.trim()) {
      return 'Email không được để trống';
    } if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
      return 'Email không hợp lệ';
    }
    return '';
  };

  const handleChange = (e) => {
    const { value } = e.target;
    setEmail(value);
    
    if (touched) {
      setError(validateEmail(value));
    }
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validateEmail(email));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailError = validateEmail(email);
    setTouched(true);
    setError(emailError);
    
    if (emailError) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Gọi API khôi phục mật khẩu
      await axiosInstance.post('/auth/forgot-password', {
        email,
      });
      
      // Đặt trạng thái đã gửi email thành công
      setSuccessMessage('Email đã được gửi! Vui lòng kiểm tra hộp thư của bạn để đặt lại mật khẩu.');
      setSubmitted(true);
    } catch (err) {
      console.error('Forgot password error:', err);
      
      // Xử lý lỗi từ API
      if (err.response && err.response.data) {
        setError(
          err.response.data.error?.message || 'Không thể gửi email khôi phục. Vui lòng thử lại sau.'
        );
      } else {
        // Lỗi kết nối
        setError('Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    setSubmitted(false);
    setEmail('');
    setTouched(false);
    setError('');
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <Box
      sx={{
        width: 'var(--layout-auth-content-width, 420px)',
        margin: '0 auto',
        padding: 0,
      }}
    >
      <Box
        sx={{
          py: 5,
          px: 3,
          backgroundColor: '#fff',
          borderRadius: 2,
        }}
      >
        
        <Typography variant="h5" textAlign="center" gutterBottom>
          Quên mật khẩu?
        </Typography>
        
        {!submitted ? (
          <>
            <Typography variant="body2" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
              Vui lòng nhập địa chỉ email của bạn. Chúng tôi sẽ gửi một liên kết để tạo mật khẩu mới.
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.875rem' }}>
                    Email <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                  </Typography>
                  <TextField
                    fullWidth
                    required
                    name="email"
                    placeholder="Nhập email của bạn"
                    type="email"
                    value={email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched && error)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: 'text.disabled' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: '48px',
                      }
                    }}
                  />
                  {touched && error && (
                    <FormHelperText error>{error}</FormHelperText>
                  )}
                </Box>
              </Stack>
              
              <Button
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading || (touched && Boolean(error))}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 1,
                  fontSize: '0.9rem',
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                    Đang xử lý...
                  </Box>
                ) : 'Gửi liên kết khôi phục'}
              </Button>
              
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button
                  component={RouterLink}
                  href="/login"
                  startIcon={<ArrowBack />}
                  sx={{ textTransform: 'none' }}
                >
                  Quay lại đăng nhập
                </Button>
              </Box>
            </Box>
          </>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <Alert 
              severity="success" 
              icon={<Check fontSize="large" />}
              sx={{ 
                mb: 3, 
                py: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center' 
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Email đã được gửi!
              </Typography>
              <Typography variant="body2">
                {successMessage}
              </Typography>
            </Alert>
            
            <Typography variant="body2" sx={{ mb: 3 }}>
              Không nhận được email? Vui lòng kiểm tra thư mục spam hoặc
            </Typography>
            
            <Button
              variant="outlined"
              onClick={handleTryAgain}
              sx={{ mb: 2, textTransform: 'none' }}
            >
              Thử lại với email khác
            </Button>
            
            <Box sx={{ mt: 3 }}>
              <Button
                onClick={handleBackToLogin}
                startIcon={<ArrowBack />}
                sx={{ textTransform: 'none' }}
              >
                Quay lại đăng nhập
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}