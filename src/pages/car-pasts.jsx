import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import CarPartsManagement from 'src/sections/cart-parts';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Products - ${CONFIG.appName}`}</title>
      </Helmet>

      <CarPartsManagement />
    </>
  );
}
