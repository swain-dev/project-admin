import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import OrdersManagementView from 'src/sections/car-parts-orders';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Products - ${CONFIG.appName}`}</title>
      </Helmet>

      <OrdersManagementView  />
    </>
  );
}
