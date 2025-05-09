import type { Theme, SxProps, Breakpoint } from '@mui/material/styles';

import { useState, useEffect } from 'react';
import { useRouter } from 'src/routes/hooks';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import { Snackbar } from '@mui/material';

import { _langs, _notifications } from 'src/_mock';

import { Iconify } from 'src/components/iconify';

import { Main } from './main';
import { layoutClasses } from '../classes';
import { NavMobile, NavDesktop } from './nav';
import { navData } from '../config-nav-dashboard';
import { Searchbar } from '../components/searchbar';
import { _workspaces } from '../config-nav-workspace';
import { MenuButton } from '../components/menu-button';
import { LayoutSection } from '../core/layout-section';
import { HeaderSection } from '../core/header-section';
import { AccountPopover } from '../components/account-popover';
import { LanguagePopover } from '../components/language-popover';
import { NotificationsPopover } from '../components/notifications-popover';

// ----------------------------------------------------------------------

export type DashboardLayoutProps = {
  sx?: SxProps<Theme>;
  children: React.ReactNode;
  header?: {
    sx?: SxProps<Theme>;
  };
};

export function DashboardLayout({ sx, children, header }: DashboardLayoutProps) {
  const theme = useTheme();
  const router:any = useRouter();
  const [navOpen, setNavOpen] = useState(false);
  const layoutQuery: Breakpoint = 'lg';
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [filteredNavData, setFilteredNavData] = useState(navData);

  // Hàm logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Kiểm tra thông tin user và phân quyền
  const checkUserInfo = () => {
    try {
      const userJson = localStorage.getItem('user');
      
      if (!userJson) {
        // Nếu không có thông tin user, đăng xuất
        handleLogout();
        return;
      }
      
      const user = JSON.parse(userJson);
      
      // Kiểm tra nếu manager không phải true
      if (user.manager !== true) {
        setAlertMessage('Bạn không có quyền truy cập vào hệ thống quản trị.');
        setAlertOpen(true);
        
        // Logout sau 3 giây
        setTimeout(() => {
          handleLogout();
        }, 3000);
      }

      // Lọc navData dựa trên quyền super_admin
      // Nếu user.super_admin là false hoặc không tồn tại, ẩn link "Người dùng"
      const isSuperAdmin = user.super_admin === true;
      
      const filtered = navData.filter((item) => {
        if (item.path === '/user' || item.path === '/') {
          return isSuperAdmin; // Chỉ hiển thị nếu là super_admin
        }
        return true; // Hiển thị tất cả các link khác
      });
      
      setFilteredNavData(filtered);
      
    } catch (error) {
      console.error('Error checking user info:', error);
      handleLogout();
    }
  };

  // Kiểm tra xác thực khi component được tải lần đầu
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Nếu không có token, chuyển hướng đến trang đăng nhập
      router.push('/login');
    } else {
      // Nếu có token, kiểm tra thông tin user
      checkUserInfo();
    }
  }, []);

  // Kiểm tra thông tin user khi router thay đổi
  useEffect(() => {
    const handleRouteChange = () => {
      const token = localStorage.getItem('token');
      if (token) {
        // Kiểm tra nếu đang ở trang /user nhưng không có quyền super_admin
        const currentPath = router.pathname || window.location.pathname;
        if (currentPath === '/user') {
          try {
            const userJson = localStorage.getItem('user');
            if (userJson) {
              const user = JSON.parse(userJson);
              const isSuperAdmin = user.super_admin === true;
              
              if (!isSuperAdmin) {
                // Redirect về trang chủ nếu không có quyền super_admin
                router.push('/products');
                setAlertMessage('Bạn không có quyền truy cập trang Quản lý người dùng.');
                setAlertOpen(true);
                
                // Tự động đóng thông báo sau 3 giây
                setTimeout(() => {
                  setAlertOpen(false);
                }, 3000);
                
                return;
              }
            }
          } catch (error) {
            console.error('Error checking super_admin permission:', error);
            router.push('/products');
          }
        }

        if (currentPath === '/') {
          try {
            const userJson = localStorage.getItem('user');
            if (userJson) {
              const user = JSON.parse(userJson);
              const isSuperAdmin = user.super_admin === true;
              
              if (!isSuperAdmin) {
                // Redirect về trang chủ nếu không có quyền super_admin
                router.push('/products');
                setAlertMessage('Bạn không có quyền truy cập trang thống kê.');
                setAlertOpen(true);
                
                // Tự động đóng thông báo sau 3 giây
                setTimeout(() => {
                  setAlertOpen(false);
                }, 3000);
                
                return;
              }
            }
          } catch (error) {
            console.error('Error checking super_admin permission:', error);
            router.push('/products');
          }
        }
        
        // Kiểm tra thông tin user như bình thường
        checkUserInfo();
      }
    };

    // Đăng ký sự kiện với router
    router.events?.subscribe('routeChangeComplete', handleRouteChange);
    
    // Thực hiện kiểm tra ngay khi component mount để bắt trường hợp truy cập trực tiếp
    handleRouteChange();

    // Cleanup
    return () => {
      router.events?.unsubscribe('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  return (
    <LayoutSection
      /** **************************************
       * Header
       *************************************** */
      headerSection={
        <HeaderSection
          layoutQuery={layoutQuery}
          slotProps={{
            container: {
              maxWidth: false,
              sx: { px: { [layoutQuery]: 5 } },
            },
          }}
          sx={header?.sx}
          slots={{
            topArea: (
              <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
                This is an info Alert.
              </Alert>
            ),
            leftArea: (
              <>
                <MenuButton
                  onClick={() => setNavOpen(true)}
                  sx={{
                    ml: -1,
                    [theme.breakpoints.up(layoutQuery)]: { display: 'none' },
                  }}
                />
                <NavMobile
                  data={filteredNavData}
                  open={navOpen}
                  onClose={() => setNavOpen(false)}
                  workspaces={_workspaces}
                />
              </>
            ),
            rightArea: (
              <Box gap={1} display="flex" alignItems="center">
                {/* <Searchbar />
                <LanguagePopover data={_langs} />
                <NotificationsPopover data={_notifications} /> */}
                <AccountPopover
                  data={[
                    {
                      label: 'Hồ sơ người dùng',
                      href: '/profile',
                      icon: <Iconify width={22} icon="solar:user-bold-duotone" />,
                    },
                    {
                      label: 'Đổi mật khẩu',
                      href: '/change-password',
                      icon: <Iconify width={22} icon="solar:lock-password-bold-duotone" />,
                    },
                  ]}
                />
              </Box>
            ),
          }}
        />
      }
      /** **************************************
       * Sidebar
       *************************************** */
      sidebarSection={
        <NavDesktop data={filteredNavData} layoutQuery={layoutQuery} workspaces={_workspaces} />
      }
      /** **************************************
       * Footer
       *************************************** */
      footerSection={null}
      /** **************************************
       * Style
       *************************************** */
      cssVars={{
        '--layout-nav-vertical-width': '300px',
        '--layout-dashboard-content-pt': theme.spacing(1),
        '--layout-dashboard-content-pb': theme.spacing(8),
        '--layout-dashboard-content-px': theme.spacing(5),
      }}
      sx={{
        [`& .${layoutClasses.hasSidebar}`]: {
          [theme.breakpoints.up(layoutQuery)]: {
            pl: 'var(--layout-nav-vertical-width)',
          },
        },
        ...sx,
      }}
    >
      {/* Thông báo khi phát hiện không có quyền truy cập */}
      <Snackbar
        open={alertOpen}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        message={alertMessage}
        ContentProps={{
          sx: {
            bgcolor: 'error.main',
            color: 'error.contrastText',
          },
        }}
      />

      <Main>{children}</Main>
    </LayoutSection>
  );
}