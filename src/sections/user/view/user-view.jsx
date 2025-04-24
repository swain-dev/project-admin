import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Table,
  Stack,
  Paper,
  Button,
  Popover,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  Container,
  Typography,
  IconButton,
  TableContainer,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Checkbox,
  TableHead,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';

import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

import axiosInstance from 'src/utils/axios';

const USER_CATEGORIES = [
  {
    label: "Người dùng",
    value: false
  },
  {
    label: "Nhân viên",
    value: true
  },
];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  const [selected, setSelected] = useState([]);
  const [filterName, setFilterName] = useState('');

  const [openUserForm, setOpenUserForm] = useState(false);
  const [userFormData, setUserFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    manager: true
  });
  const [userFormErrors, setUserFormErrors] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [multiDelete, setMultiDelete] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [openPopover, setOpenPopover] = useState(null);
  const [popoverUserId, setPopoverUserId] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Lấy danh sách users khi component mount
  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, filterName]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Phân trang
      params.append('pagination[page]', (page + 1).toString());
      params.append('pagination[pageSize]', rowsPerPage.toString());
      
      // Sắp xếp theo thời gian tạo, mới nhất trước
      params.append('sort[0]', 'createdAt:desc');
      
      // Tìm kiếm
      if (filterName) {
        params.append('filters[$or][0][username][$containsi]', filterName);
        params.append('filters[$or][1][email][$containsi]', filterName);
        params.append('filters[$or][2][fullName][$containsi]', filterName);
      }
      
      // Chỉ hiển thị người dùng thông thường (manager=false)
      // params.append('filters[$or][super_admin][$null]', 'true');
      params.append('filters[$or][0][super_admin][$null]', 'true');
      params.append('filters[$or][1][super_admin][$eq]', 'false');
      params.append('filters[role]', '2');

      // Populate relationships
      params.append('populate', '*');

      const response = await axiosInstance.get(`/users?${params.toString()}`);
      
      // Xử lý response dựa vào cấu trúc API của bạn
      const userData = Array.isArray(response) ? response : response.data || [];
      setUsers(userData);
      
      // Xử lý pagination dựa vào API của bạn
      setTotalUsers(response.meta?.pagination?.total || userData.length);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Không thể tải danh sách người dùng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
    setPage(0);
  };

  const handleRefresh = () => {
    setFilterName('');
    setPage(0);
    fetchUsers();
  };

  const handleUserFormChange = (event) => {
    const { name, value } = event.target;
    setUserFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateUserForm = () => {
    const errors = {};
    
    if (!userFormData.username.trim()) {
      errors.username = 'Tên đăng nhập không được để trống';
    }
    
    if (!userFormData.email.trim()) {
      errors.email = 'Email không được để trống';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(userFormData.email)) {
      errors.email = 'Email không hợp lệ';
    }
    
    if (!editMode) {
      if (!userFormData.password) {
        errors.password = 'Mật khẩu không được để trống';
      } else if (userFormData.password.length < 6) {
        errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
      
      if (!userFormData.confirmPassword) {
        errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
      } else if (userFormData.password !== userFormData.confirmPassword) {
        errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      }
    } else if (userFormData.password) {
      if (userFormData.password.length < 6) {
        errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
      
      if (!userFormData.confirmPassword) {
        errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
      } else if (userFormData.password !== userFormData.confirmPassword) {
        errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      }
    }
    
    setUserFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateUser = async () => {
    if (!validateUserForm()) return;
    console.log(userFormData);
    setLoading(true);
    try {
      const userData = {
        username: userFormData.username,
        email: userFormData.email,
        password: userFormData.password,
        fullName: userFormData.fullName || null,
        phone: userFormData.phone || null,
        manager: userFormData.manager, // Luôn là false cho người dùng thông thường
        confirmed: true, // Mặc định đã xác nhận
        blocked: false, // Mặc định không bị khóa,
        role: '2'
      };
      
      await axiosInstance.post('/users', userData);
      
      setSnackbar({
        open: true,
        message: 'Người dùng đã được tạo thành công!',
        severity: 'success',
      });
      
      setOpenUserForm(false);
      resetUserForm();
      fetchUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.error?.message || 'Không thể tạo người dùng. Vui lòng thử lại sau.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!validateUserForm()) return;
    
    setLoading(true);
    try {
      const userData = {
        username: userFormData.username,
        email: userFormData.email,
        fullName: userFormData.fullName || null,
        phone: userFormData.phone || null,
        manager: userFormData.manager
      };
      
      // Chỉ gửi mật khẩu nếu đã nhập mật khẩu mới
      if (userFormData.password) {
        userData.password = userFormData.password;
      }
      
      await axiosInstance.put(`/users/${currentUserId}`, userData);
      
      setSnackbar({
        open: true,
        message: 'Thông tin người dùng đã được cập nhật thành công!',
        severity: 'success',
      });
      
      setOpenUserForm(false);
      resetUserForm();
      fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.error?.message || 'Không thể cập nhật thông tin người dùng. Vui lòng thử lại sau.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setLoading(true);
    try {
      if (multiDelete) {
        // Xóa nhiều người dùng
        for (const userId of selected) {
          await axiosInstance.delete(`/users/${userId}`);
        }
        setSnackbar({
          open: true,
          message: `Đã xóa ${selected.length} người dùng thành công!`,
          severity: 'success',
        });
        setSelected([]);
      } else {
        // Xóa một người dùng
        await axiosInstance.delete(`/users/${deleteUserId}`);
        setSnackbar({
          open: true,
          message: 'Người dùng đã được xóa thành công!',
          severity: 'success',
        });
      }
      
      setOpenDeleteDialog(false);
      setDeleteUserId(null);
      setMultiDelete(false);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user(s):', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.error?.message || 'Không thể xóa người dùng. Vui lòng thử lại sau.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (user) => {
    setUserFormData({
      username: user.username || '',
      email: user.email || '',
      password: '',
      confirmPassword: '',
      fullName: user.fullName || '',
      phone: user.phone || '',
      manager: user.manager || false
    });
    setCurrentUserId(user.id);
    setEditMode(true);
    setOpenUserForm(true);
    setOpenPopover(null);
  };

  const handleOpenCreate = () => {
    resetUserForm();
    setEditMode(false);
    setOpenUserForm(true);
  };

  const resetUserForm = () => {
    setUserFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phone: '',
      manager: true
    });
    setUserFormErrors({});
    setCurrentUserId(null);
  };

  const handleOpenDelete = (userId) => {
    setDeleteUserId(userId);
    setMultiDelete(false);
    setOpenDeleteDialog(true);
    setOpenPopover(null);
  };

  const handleOpenMultiDelete = () => {
    setMultiDelete(true);
    setOpenDeleteDialog(true);
  };

  const handleCloseUserForm = () => {
    setOpenUserForm(false);
    resetUserForm();
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeleteUserId(null);
    setMultiDelete(false);
  };

  const handleOpenPopover = (event, userId) => {
    setOpenPopover(event.currentTarget);
    setPopoverUserId(userId);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
    setPopoverUserId(null);
  };

  const handleToggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = users.map((user) => user.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleSelectClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else {
      newSelected = selected.filter((item) => item !== id);
    }

    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Quản lý người dùng</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Thêm người dùng
        </Button>
      </Stack>

      <Card>
        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: '100%', md: 'auto' } }}>
            <TextField
              size="small"
              value={filterName}
              onChange={handleFilterByName}
              placeholder="Tìm kiếm người dùng..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: '100%', md: 300 } }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {selected.length > 0 && (
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleOpenMultiDelete}
              >
                Xóa ({selected.length})
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Làm mới
            </Button>
          </Box>
        </Box>

        <TableContainer sx={{ overflow: 'unset' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < users.length}
                    checked={users.length > 0 && selected.length === users.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell>Tên đăng nhập</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Họ tên</TableCell>
                <TableCell>Điện thoại</TableCell>
                <TableCell>Quyền</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading && users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Paper
                      sx={{
                        textAlign: 'center',
                        p: 2,
                      }}
                    >
                      <Typography variant="h6" paragraph>
                        Có lỗi xảy ra
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {error}
                      </Typography>
                    </Paper>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Paper
                      sx={{
                        textAlign: 'center',
                        p: 2,
                      }}
                    >
                      <Typography variant="h6" paragraph>
                        Không tìm thấy người dùng nào
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Không có kết quả nào phù hợp với bộ lọc của bạn.
                      </Typography>
                    </Paper>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const isItemSelected = isSelected(user.id);
                  
                  return (
                    <TableRow
                      hover
                      key={user.id}
                      tabIndex={-1}
                      role="checkbox"
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          onChange={(event) => handleSelectClick(event, user.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              borderRadius: '50%',
                              bgcolor: 'info.lighter',
                            }}
                          >
                            <PersonIcon />
                          </Box>
                          <Typography variant="subtitle2" noWrap>
                            {user.username}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.fullName || '-'}</TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>{user.manager ? 'Nhân viên' : 'Người dùng'}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={(event) => handleOpenPopover(event, user.id)}>
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          page={page}
          component="div"
          count={totalUsers}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Popover cho action */}
      <Popover
        open={Boolean(openPopover)}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: 140,
          },
        }}
      >
        {popoverUserId && (
          <Box>
            <MenuItem onClick={() => handleOpenEdit(users.find(user => user.id === popoverUserId))}>
              <EditIcon sx={{ mr: 1, width: 20, height: 20 }} />
              Sửa
            </MenuItem>
            <MenuItem onClick={() => handleOpenDelete(popoverUserId)} sx={{ color: 'error.main' }}>
              <DeleteIcon sx={{ mr: 1, width: 20, height: 20 }} />
              Xóa
            </MenuItem>
          </Box>
        )}
      </Popover>

      {/* Dialog tạo/sửa người dùng */}
      <Dialog
        open={openUserForm}
        onClose={handleCloseUserForm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editMode ? 'Cập nhật thông tin người dùng' : 'Thêm người dùng mới'}</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 2 }}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Tên đăng nhập"
                name="username"
                value={userFormData.username}
                onChange={handleUserFormChange}
                error={Boolean(userFormErrors.username)}
                helperText={userFormErrors.username}
                required
              />

              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={userFormData.email}
                onChange={handleUserFormChange}
                error={Boolean(userFormErrors.email)}
                helperText={userFormErrors.email}
                required
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label={editMode ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={userFormData.password}
                  onChange={handleUserFormChange}
                  error={Boolean(userFormErrors.password)}
                  helperText={userFormErrors.password}
                  required={!editMode}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleToggleShowPassword} edge="end">
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label={editMode ? "Xác nhận mật khẩu mới" : "Xác nhận mật khẩu"}
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={userFormData.confirmPassword}
                  onChange={handleUserFormChange}
                  error={Boolean(userFormErrors.confirmPassword)}
                  helperText={userFormErrors.confirmPassword}
                  required={!editMode || Boolean(userFormData.password)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleToggleShowConfirmPassword} edge="end">
                          {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>

              <TextField
                fullWidth
                label="Họ và tên"
                name="fullName"
                value={userFormData.fullName || ''}
                onChange={handleUserFormChange}
              />

              <TextField
                fullWidth
                label="Số điện thoại"
                name="phone"
                value={userFormData.phone || ''}
                onChange={handleUserFormChange}
              />

              <TextField
                fullWidth
                select
                label="Quyền"
                name="manager"
                value={userFormData.manager}
                defaultValue={true}
                onChange={handleUserFormChange}
                required
              >
                {USER_CATEGORIES.map((option) => (
                  <MenuItem key={option.label} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserForm}>Hủy</Button>
          <Button
            variant="contained"
            onClick={editMode ? handleUpdateUser : handleCreateUser}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : editMode ? 'Cập nhật' : 'Tạo'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            {multiDelete 
              ? `Bạn có chắc chắn muốn xóa ${selected.length} người dùng đã chọn?` 
              : 'Bạn có chắc chắn muốn xóa người dùng này?'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            Hành động này không thể hoàn tác. Tất cả dữ liệu người dùng sẽ bị xóa vĩnh viễn.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteUser}
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
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}