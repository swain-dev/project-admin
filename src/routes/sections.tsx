import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { varAlpha } from 'src/theme/styles';
import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

export const HomePage = lazy(() => import('src/pages/home'));
export const UserPage = lazy(() => import('src/pages/user'));
export const ChatPage = lazy(() => import('src/pages/chat'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const ProductsPage = lazy(() => import('src/pages/products'));

// phụ tùng
export const CarPartsPage = lazy(() => import('src/pages/car-pasts'));
export const CarPartsOrdersPage = lazy(() => import('src/pages/car-pasts-orders'));
export const OrdersUserPage = lazy(() => import('src/pages/order-ui'));
export const OrdersManagementPage = lazy(() => import('src/pages/orders-managemen'));
// ------------
// blogs
export const BlogPage = lazy(() => import('src/pages/articles'));
export const CrteateBlogPage = lazy(() => import('src/pages/new-article'));
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

        // blog
        { path: 'blog', element: <BlogPage /> },
        { path: 'blog/create', element: <CrteateBlogPage /> },
        { path: 'blog/edit/:id', element: <CrteateBlogPage /> },
      ],
    },
    {
      path: 'sign-in',
      element: (
        <AuthLayout>
          <SignInPage />
        </AuthLayout>
      ),
    },
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
