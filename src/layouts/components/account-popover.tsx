import type { IconButtonProps } from '@mui/material/IconButton';

import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { useRouter, usePathname } from 'src/routes/hooks';

// ----------------------------------------------------------------------

// Interface cho thông tin người dùng
interface UserInfo {
  displayName: string;
  email: string;
  photoURL?: string;
}

export type AccountPopoverProps = IconButtonProps & {
  data?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    info?: React.ReactNode;
  }[];
};

export function AccountPopover({ data = [], sx, ...other }: AccountPopoverProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // State để lưu thông tin người dùng
  const [userInfo, setUserInfo] = useState<UserInfo>({
    displayName: '',
    email: '',
    photoURL: '',
  });

  // Lấy thông tin người dùng từ localStorage khi component mount
  useEffect(() => {
    try {
      const userFromStorage = localStorage.getItem('user');
      if (userFromStorage) {
        const parsedUser = JSON.parse(userFromStorage);
        
        // Tạo đối tượng userInfo từ dữ liệu lưu trong localStorage
        const userInfoFromStorage: UserInfo = {
          displayName: parsedUser.username || 'Người dùng',
          email: parsedUser.email || '',
          photoURL: parsedUser.avatar?.url || '',
        };
        
        setUserInfo(userInfoFromStorage);
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
    }
  }, []);

  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleClickItem = useCallback(
    (path: string) => {
      handleClosePopover();
      router.push(path);
    },
    [handleClosePopover, router]
  );

  // Hàm xử lý đăng xuất
  const handleLogout = useCallback(() => {
    // Xóa thông tin người dùng và token khỏi localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Đóng popover
    handleClosePopover();
    
    // Chuyển hướng người dùng về trang đăng nhập
    router.push('/login');
  }, [handleClosePopover, router]);

  return (
    <>
      <IconButton
        onClick={handleOpenPopover}
        sx={{
          p: '2px',
          width: 40,
          height: 40,
          background: (theme) =>
            `conic-gradient(${theme.vars.palette.primary.light}, ${theme.vars.palette.warning.light}, ${theme.vars.palette.primary.light})`,
          ...sx,
        }}
        {...other}
      >
        <Avatar src={userInfo.photoURL} alt={userInfo.displayName} sx={{ width: 1, height: 1 }}>
          {userInfo.displayName ? userInfo.displayName.charAt(0).toUpperCase() : 'U'}
        </Avatar>
      </IconButton>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { width: 200 },
          },
        }}
      >
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {userInfo.displayName}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {userInfo.email}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuList
          disablePadding
          sx={{
            p: 1,
            gap: 0.5,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              color: 'text.secondary',
              '&:hover': { color: 'text.primary' },
              [`&.${menuItemClasses.selected}`]: {
                color: 'text.primary',
                bgcolor: 'action.selected',
                fontWeight: 'fontWeightSemiBold',
              },
            },
          }}
        >
          {data.map((option) => (
            <MenuItem
              key={option.label}
              selected={option.href === pathname}
              onClick={() => handleClickItem(option.href)}
            >
              {option.icon}
              {option.label}
            </MenuItem>
          ))}
        </MenuList>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <Button 
            fullWidth 
            color="error" 
            size="medium" 
            variant="text"
            onClick={handleLogout}
          >
            Đăng xuất
          </Button>
        </Box>
      </Popover>
    </>
  );
}