import './App.css';
import Safe from './components/Safe'
import SafesList from './components/SafesList'
import TransactionsList from './components/TransactionsList';

function App() {
  return (
    <div className="p-20 flex flex-col gap-6 bg-[#1C1C1C]">
        <Safe safeAddr="0x6106FB94E31B83D0A15432FCA2927B838fB6D025" apiUrl="https://safe-transaction-gnosis-chain.safe.global/" chainNativeToken={{symbol: "xDai", icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/8635.png", decimals: 18}}></Safe>
        <SafesList walletAddr="0x0E1774FD4f836E6Ba2E22d0e11F4c69684ae4EB7" apiUrl="https://safe-transaction-gnosis-chain.safe.global/"></SafesList>
        <TransactionsList safeAddr="0x6106FB94E31B83D0A15432FCA2927B838fB6D025" apiUrl="https://safe-transaction-gnosis-chain.safe.global/"></TransactionsList>
    </div>
  );
}

export default App;
