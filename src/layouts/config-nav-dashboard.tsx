import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor width="100%" height="100%" src={`/assets/icons/navbar/${name}.svg`} />
);

export const navData = [
  {
    title: 'Thống kê',
    path: '/',
    icon: icon('ic-analytics'),
  },
  {
    title: 'Người dùng',
    path: '/user',
    icon: icon('ic-user'),
  },
  {
    title: 'Dịch vụ',
    path: '/products',
    icon: icon('ic-cart'),
  },
  {
    title: 'Đơn đặt dịch vụ',
    path: '/products',
    icon: icon('ic-cart'),
  },
  {
    title: 'Phụ tùng',
    path: '/car-parts',
    icon: icon('ic-cart'),
  },
  {
    title: 'Đơn đặt phụ tùng',
    path: '/orders-management',
    icon: icon('ic-cart'),
  },
  {
    title: 'Tin tức',
    path: '/blog',
    icon: icon('ic-blog'),
  },
  {
    title: 'Tin nhắn',
    path: '/chat',
    icon: icon('ic-blog'),
  },
  // {
  //   title: 'Sign in',
  //   path: '/sign-in',
  //   icon: icon('ic-lock'),
  // },
  // {
  //   title: 'Not found',
  //   path: '/404',
  //   icon: icon('ic-disabled'),
  // },
];
