import './App.css';
import Safe from './components/Safe'
import SafesList from './components/SafesList'
import TransactionsList from './components/TransactionsList';
import CreateSafe from './components/CreateSafe';
import NewTransaction from './components/NewTransaction';
import NewTransactionEthers from './components/NewTransactionEthers';
import {
  useAccount,
  useNetwork,
} from "wagmi";


function App() {
  const {chain} = useNetwork()
  const {address} = useAccount()
  console.log("Chain", chain)

  if (!chain || !address) {
    return "Please connect wallet first"
  }

  return(

    <div className="p-20 flex flex-col gap-6 bg-[#1C1C1C]">
        <Safe safeAddr="0x6106FB94E31B83D0A15432FCA2927B838fB6D025" apiUrl="https://safe-transaction-gnosis-chain.safe.global/" chainNativeToken={{symbol: "xDai", icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/8635.png", decimals: 18}}></Safe>
        <SafesList walletAddr={address} apiUrl="https://safe-transaction-gnosis-chain.safe.global/"></SafesList>
        <TransactionsList safeAddr="0x6106FB94E31B83D0A15432FCA2927B838fB6D025" apiUrl="https://safe-transaction-gnosis-chain.safe.global/"></TransactionsList>
        <CreateSafe chain={chain} connectedWalletAddr={address}></CreateSafe>
        <NewTransaction chain={chain} connectedWalletAddr={address} safeAddr="0x6106FB94E31B83D0A15432FCA2927B838fB6D025" apiUrl="https://safe-transaction-gnosis-chain.safe.global" chainNativeToken={{symbol: "xDai", icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/8635.png", decimals: 18}}></NewTransaction>
        {/* <NewTransactionEthers chain={chain} connectedWalletAddr={address} safeAddr="0x6106FB94E31B83D0A15432FCA2927B838fB6D025" apiUrl="https://safe-transaction-gnosis-chain.safe.global" chainNativeToken={{symbol: "xDai", icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/8635.png", decimals: 18}}></NewTransactionEthers> */}
    </div>


  );
}

export default App;
