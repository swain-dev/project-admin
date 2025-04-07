import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { varAlpha } from 'src/theme/styles';
import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

export const HomePage = lazy(() => import('src/pages/dashboard'));
export const UserPage = lazy(() => import('src/pages/user'));
export const ChatPage = lazy(() => import('src/pages/chat'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const ProductsPage = lazy(() => import('src/pages/products'));

// phụ tùng
export const CarPartsPage = lazy(() => import('src/pages/car-pasts'));
export const CarPartsOrdersPage = lazy(() => import('src/pages/car-pasts-orders'));
export const OrdersUserPage = lazy(() => import('src/pages/order-ui'));
export const OrdersManagementPage = lazy(() => import('src/pages/orders-managemen'));
// service
export const OrdersSercivePage = lazy(() => import('src/pages/service/order-service'));
// ------------
// blogs
export const BlogPage = lazy(() => import('src/pages/articles'));
export const CrteateBlogPage = lazy(() => import('src/pages/new-article'));
// auth
export const LoginPage = lazy(() => import('src/pages/auth/login'));
export const ChangePasswordPage = lazy(() => import('src/pages/auth/change-password'));
export const ProfilePage = lazy(() => import('src/pages/auth/profile'));
export const EditProfilePage = lazy(() => import('src/pages/auth/edit-profile'));
export const RegisterPage = lazy(() => import('src/pages/auth/register'));
export const ForgotPasswordPage = lazy(() => import('src/pages/auth/forgot-password'));
export const ResetPasswordPage = lazy(() => import('src/pages/auth/reset-password'));
// ----------
export const Page404 = lazy(() => import('src/pages/page-not-found'));

// ----------------------------------------------------------------------

const renderFallback = (
  <Box display="flex" alignItems="center" justifyContent="center" flex="1 1 auto">
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export function Router() {
  return useRoutes([
    {
      element: (
        <DashboardLayout>
          <Suspense fallback={renderFallback}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      ),
      children: [
        { element: <HomePage />, index: true },
        { path: 'user', element: <UserPage /> },
        { path: 'products', element: <ProductsPage /> },
        { path: 'car-parts', element: <CarPartsPage /> },
        { path: 'car-parts-orders', element: <CarPartsOrdersPage /> },
        { path: 'car-parts-orders-ui', element: <OrdersUserPage /> },
        { path: 'orders-management', element: <OrdersManagementPage /> },
        { path: 'chat', element: <ChatPage /> },
        // service
        
        { path: 'order-service', element: <OrdersSercivePage /> },
        // blog
        { path: 'blog', element: <BlogPage /> },
        { path: 'blog/create', element: <CrteateBlogPage /> },
        { path: 'blog/edit/:id', element: <CrteateBlogPage /> },
         // auth
         { path: 'change-password', element: <ChangePasswordPage /> },
         { path: 'profile', element: <ProfilePage /> },
         { path: 'profile/edit', element: <EditProfilePage /> },
      ],
    },
    {
      path: 'login', element: <AuthLayout><LoginPage /></AuthLayout> ,
    },
    {
      path: 'sign-in',
      element: (
        <AuthLayout>
          <SignInPage />
        </AuthLayout>
      ),
    },
    { path: 'register', element: (
      <AuthLayout>
        <RegisterPage />
      </AuthLayout>
    )},

    { path: 'reset-password', element: <AuthLayout><ResetPasswordPage /></AuthLayout> },
    { path: 'forgot-password', element: <AuthLayout><ForgotPasswordPage /></AuthLayout> },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);
}
