import React from 'react';
import {createRoot} from 'react-dom/client';
import {App} from './App.jsx';

import {ChainProvider} from 'hooks/chainProvider';
import {AccountProvider} from 'hooks/web3AccountProvider';

const Providers = ({children}) => {
  return (
    <AccountProvider>
      <ChainProvider>{children}</ChainProvider>
    </AccountProvider>
  );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>,
);
