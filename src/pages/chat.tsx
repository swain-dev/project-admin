import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { ChatView } from 'src/sections/chat/view/chat-view';
import { ProductsView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Products - ${CONFIG.appName}`}</title>
      </Helmet>

      <ChatView />
    </>
  );
}
