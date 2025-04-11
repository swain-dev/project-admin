import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Lock, Email, Person, Visibility, VisibilityOff, CheckCircleOutline } from '@mui/icons-material';
import {
  Box,
  Link,
  Alert,
  Stack,
  Button,
  Checkbox,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  FormHelperText,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';

import { RouterLink } from 'src/routes/components';

import axiosInstance from 'src/utils/axios';

import { Logo } from 'src/components/logo';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(3);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: '',
  });
  
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
    terms: false,
  });

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (redirecting && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (redirecting && countdown === 0) {
      navigate('/auth/login');
    }
    return () => clearTimeout(timer);
  }, [redirecting, countdown, navigate]);

  const validateField = (name, value) => {
    let error = '';
    
    switch(name) {
      case 'username':
        if (!value.trim()) {
          error = 'Tên đăng nhập không được để trống';
        } else if (value.length < 3) {
          error = 'Tên đăng nhập phải có ít nhất 3 ký tự';
        }
        break;
        
      case 'email':
        if (!value.trim()) {
          error = 'Email không được để trống';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
          error = 'Email không hợp lệ';
        }
        break;
        
      case 'password':
        if (!value) {
          error = 'Mật khẩu không được để trống';
        } else if (value.length < 6) {
          error = 'Mật khẩu phải có ít nhất 6 ký tự';
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          error = 'Vui lòng xác nhận mật khẩu';
        } else if (value !== formData.password) {
          error = 'Mật khẩu xác nhận không khớp';
        }
        break;
        
      case 'terms':
        if (!value) {
          error = 'Bạn phải đồng ý với điều khoản dịch vụ';
        }
        break;
        
      default:
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    
    if (name === 'terms') {
      setAgreeTerms(checked);
      
      if (touched.terms) {
        setErrors(prev => ({
          ...prev,
          terms: checked ? '' : 'Bạn phải đồng ý với điều khoản dịch vụ'
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      if (touched[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: validateField(name, value)
        }));
      }
      
      // Nếu đang chỉnh sửa mật khẩu, cũng kiểm tra lại xác nhận mật khẩu
      if (name === 'password' && touched.confirmPassword) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: formData.confirmPassword !== value ? 'Mật khẩu xác nhận không khớp' : ''
        }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value, checked } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (name === 'terms') {
      setErrors(prev => ({
        ...prev,
        [name]: checked ? '' : 'Bạn phải đồng ý với điều khoản dịch vụ'
      }));
    } else {
      setErrors(prev => ({
        ...prev,
        [name]: validateField(name, value)
      }));
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(prev => !prev);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(prev => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const usernameError = validateField('username', formData.username);
    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);
    const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword);
    const termsError = validateField('terms', agreeTerms);
    
    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
      terms: true,
    });
    
    setErrors({
      username: usernameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
      terms: termsError,
    });
    
    // Return if there are validation errors
    if (usernameError || emailError || passwordError || confirmPasswordError || termsError) {
      return;
    }
    
    setLoading(true);
    setServerError('');
    
    try {
      const registerData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: '2',
        confirmed: true,
        manager: true,
      };
      
      // Gọi API đăng ký
      const response = await axiosInstance.post('/users', registerData);
      
      // Xử lý thành công
      setSuccessMessage('Đăng ký thành công! Vui lòng kiểm tra email của bạn để xác nhận tài khoản.');
      
      navigate('/login');
      
    } catch (err) {
      console.error('Registration error:', err);
      // Xử lý lỗi từ API
      if (err.response && err.response.data) {
        // Lấy thông báo lỗi từ API
        setServerError(err.response.data.error?.message || 'Đăng ký thất bại. Vui lòng thử lại sau.');
      } else {
        // Lỗi kết nối hoặc lỗi không xác định
        setServerError('Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối và thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Manual redirect to login
  const handleRedirectToLogin = () => {
    // Sử dụng router.push trực tiếp
    navigate('/login');
  };

  // Hàm check validation cho nút submit
  const isFormValid = () => (
      formData.username.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.password !== '' &&
      formData.confirmPassword !== '' &&
      formData.password === formData.confirmPassword &&
      agreeTerms &&
      !errors.username &&
      !errors.email &&
      !errors.password &&
      !errors.confirmPassword
    );

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
          Đăng ký tài khoản
        </Typography>
        
        <Typography variant="body2" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
          Tạo tài khoản mới để trải nghiệm dịch vụ của chúng tôi
        </Typography>
        
        {serverError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {serverError}
          </Alert>
        )}
        
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3, display: 'flex', flexDirection: 'column' }}>
            <div>{successMessage}</div>
            {redirecting && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Tự động chuyển hướng đến trang đăng nhập sau {countdown} giây...
                <Button 
                  size="small" 
                  onClick={handleRedirectToLogin} 
                  sx={{ ml: 1, textTransform: 'none' }}
                >
                  Đăng nhập ngay
                </Button>
              </Typography>
            )}
          </Alert>
        )}
        
        {!redirecting ? (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.875rem' }}>
                  Tên đăng nhập <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                </Typography>
                <TextField
                  fullWidth
                  required
                  name="username"
                  placeholder="Tên đăng nhập"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.username && errors.username)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '48px',
                    }
                  }}
                />
                {touched.username && errors.username && (
                  <FormHelperText error>{errors.username}</FormHelperText>
                )}
              </Box>
              
              <Box>
                <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.875rem' }}>
                  Email <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                </Typography>
                <TextField
                  fullWidth
                  required
                  name="email"
                  placeholder="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.email && errors.email)}
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
                {touched.email && errors.email && (
                  <FormHelperText error>{errors.email}</FormHelperText>
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: 'text.disabled' }} />
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '48px',
                    }
                  }}
                />
                {touched.password && errors.password && (
                  <FormHelperText error>{errors.password}</FormHelperText>
                )}
              </Box>
              
              <Box>
                <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.875rem' }}>
                  Xác nhận mật khẩu <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                </Typography>
                <TextField
                  fullWidth
                  required
                  name="confirmPassword"
                  placeholder="Xác nhận mật khẩu"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleToggleConfirmPassword} edge="end">
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '48px',
                    }
                  }}
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <FormHelperText error>{errors.confirmPassword}</FormHelperText>
                )}
              </Box>
              
              <Box>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={agreeTerms} 
                      onChange={handleChange} 
                      onBlur={handleBlur}
                      name="terms" 
                      color="primary" 
                      icon={<Box sx={{ width: 20, height: 20, border: '1px solid', borderColor: touched.terms && errors.terms ? 'error.main' : 'text.disabled', borderRadius: 1 }} />}
                      checkedIcon={<CheckCircleOutline />}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Tôi đồng ý với{' '}
                      <Link component={RouterLink} href="/terms" color="primary" underline="hover">
                        Điều khoản dịch vụ
                      </Link>{' '}
                      và{' '}
                      <Link component={RouterLink} href="/privacy" color="primary" underline="hover">
                        Chính sách bảo mật
                      </Link>
                    </Typography>
                  }
                />
                {touched.terms && errors.terms && (
                  <FormHelperText error>{errors.terms}</FormHelperText>
                )}
              </Box>
            </Stack>
            
            <Button
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !isFormValid()}
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
              ) : 'Đăng ký'}
            </Button>
            
            <Box sx={{ textAlign: 'center', my: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                HOẶC
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2">
                Đã có tài khoản?{' '}
                <Link
                  component={RouterLink}
                  href="/login"
                  color="primary"
                  underline="hover"
                  sx={{ fontWeight: 500 }}
                >
                  Đăng nhập ngay
                </Link>
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <CircularProgress size={32} sx={{ mb: 2 }} />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Đang chuyển hướng đến trang đăng nhập...
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}