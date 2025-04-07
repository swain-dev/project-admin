import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Stack,
  FormHelperText,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axiosInstance from 'src/utils/axios';
import { Logo } from 'src/components/logo';
import { RouterLink } from 'src/routes/components';

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    identifier: '',
    password: '',
  });
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({
    identifier: false,
    password: false,
  });

  // Kiểm tra token khi component mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        navigate('/');
      }
    };

    checkAuth();
  }, [navigate]);

  const validateField = (name, value) => {
    let error = '';
    if (!value.trim()) {
      error = name === 'identifier' 
        ? 'Email hoặc tên đăng nhập không được để trống' 
        : 'Mật khẩu không được để trống';
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: validateField(name, value)
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({
      ...prev,
      [name]: validateField(name, value)
    }));
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const identifierError = validateField('identifier', formData.identifier);
    const passwordError = validateField('password', formData.password);
    
    setTouched({
      identifier: true,
      password: true,
    });
    
    setErrors({
      identifier: identifierError,
      password: passwordError,
    });
    
    // Return if there are validation errors
    if (identifierError || passwordError) {
      return;
    }
    
    setLoading(true);
    setServerError('');

    try {
      const response = await axiosInstance.post('/auth/local', formData);
      
      // Kiểm tra quyền manager của người dùng
      if (response.user && response.user.manager === false) {
        setServerError('Bạn không có quyền truy cập vào hệ thống quản trị.');
        setLoading(false);
        return;
      }
      
      localStorage.setItem('token', response.jwt);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setServerError(
        err.response?.data?.error?.message || 'Thông tin đăng nhập không chính xác. Vui lòng kiểm tra lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Tạo style chung cho input để đảm bảo tính nhất quán
  const inputProps = {
    sx: {
      '& .MuiOutlinedInput-root': {
        height: '48px', // Đảm bảo chiều cao nhất quán
        '& .MuiInputAdornment-root': {
          // Đảm bảo kích thước biểu tượng nhất quán
          minWidth: '40px',
          display: 'flex',
          justifyContent: 'center',
        },
      },
    },
    InputLabelProps: {
      shrink: true,
    },
  };

  return (
    <Box
      sx={{
        width: 'var(--layout-auth-content-width, 420px)',
        margin: '0 auto',
        padding: 0,
      }}
      className="login-wrapper"
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
          Đăng nhập Quản trị viên
        </Typography>
        
        <Typography variant="body2" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
          Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.
        </Typography>
        
        {serverError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {serverError}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.875rem' }}>
                Email hoặc Tên đăng nhập <Box component="span" sx={{ color: 'error.main' }}>*</Box>
              </Typography>
              <TextField
                fullWidth
                required
                name="identifier"
                placeholder="Email hoặc Tên đăng nhập"
                value={formData.identifier}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(touched.identifier && errors.identifier)}
                {...inputProps}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box component="span" sx={{ color: 'text.disabled' }}>
                        ✉️
                      </Box>
                    </InputAdornment>
                  ),
                }}
              />
              {touched.identifier && errors.identifier && (
                <FormHelperText error>{errors.identifier}</FormHelperText>
              )}
            </Box>
            
            <Box>
              <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.875rem' }}>
                Mật khẩu <Box component="span" sx={{ color: 'error.main' }}>*</Box>
              </Typography>
              <TextField
                fullWidth
                required
                name="password"
                placeholder="Mật khẩu"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={Boolean(touched.password && errors.password)}
                {...inputProps}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box component="span" sx={{ color: 'text.disabled' }}>
                        🔒
                      </Box>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleTogglePassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {touched.password && errors.password && (
                <FormHelperText error>{errors.password}</FormHelperText>
              )}
            </Box>
          </Stack>
          
          <Box sx={{ textAlign: 'right', mt: 1 }}>
            <Link
              component={RouterLink}
              href="/forgot-password" 
              variant="body2"
              color="primary"
              underline="hover"
              sx={{ fontSize: '0.875rem' }}
            >
              Quên mật khẩu?
            </Link>
          </Box>
          
          <Button
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
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
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
          
          <Box sx={{ textAlign: 'center', my: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              HOẶC
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2">
              Chưa có tài khoản?{' '}
              <Link
                component={RouterLink}
                href="/register"
                color="primary"
                underline="hover"
                sx={{ fontWeight: 500 }}
              >
                Đăng ký ngay
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}