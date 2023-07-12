import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import './styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme, lightTheme, midnightTheme,
} from '@rainbow-me/rainbowkit';  
import {
  chain,
  configureChains,
  createClient,
  WagmiConfig,
} from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'; 



const GnosisChain = {
  id: 100,
  name: 'Gnosis Chain',
  network: 'Gnosis',
  nativeCurrency: {
    decimals: 18,
    name: 'xDai',
    symbol: 'xDai',
  },
  rpcUrls: {
    default: 'https://rpc.ankr.com/gnosis',
  },
  blockExplorers: {
    default: { name: 'Blockscout', url: 'https://blockscout.com/xdai/mainnet' },
  },
  iconUrls: ["https://images.prismic.io/koinly-marketing/16d1deb7-e71f-48a5-9ee7-83eb0f7038e4_Gnosis+Chain+Logo.png"],
  testnet: false,
}

const { chains, provider } = configureChains(
  [chain.mainnet, chain.polygon, chain.optimism, chain.arbitrum, GnosisChain],
  [
    alchemyProvider({ alchemyId: process.env.ALCHEMY_ID }),
    jsonRpcProvider({ rpc: () => ({ http: "https://rpc.ankr.com/gnosis" }) }), 
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <WagmiConfig client={wagmiClient}>
    <RainbowKitProvider coolMode chains={chains} theme={lightTheme({
      accentColor: '#623485', 
      accentColorForeground: 'white', 
      borderRadius: 'large',
      fontStack: 'system',  
    })}>
      <ConnectButton showBalance={false} />
      <App />
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
