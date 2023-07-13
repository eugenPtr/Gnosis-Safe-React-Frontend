//Connect to Wallet
if (
  state.chainId === undefined &&
  ethers !== undefined &&
  Ethers.send("eth_requestAccounts", [])[0]
) {
  Ethers.provider()
    .getNetwork()
    .then((chainIdData) => {
      if (chainIdData?.chainId) {
        State.update({ chainId: chainIdData.chainId });
      }
    });
}

initState({
  walletAddress: "",
  walletNonce: 0,
});

//SelectGnosisSafeProxyFactory contract based on current chain ID
const proxyFactory = fetch(
  "https://raw.githubusercontent.com/safe-global/safe-deployments/main/src/assets/v1.3.0/proxy_factory.json"
).body;

const safeProxyFactoryContractAddress =
  JSON.parse(proxyFactory)["networkAddresses"][state.chainId.toString()];

//ABI contract proxyFactory
const safeProxyFactoryContractAbi = JSON.parse(proxyFactory)["abi"];

//const iface = new ethers.utils.Interface(safeProxyFactoryContractAbi);

//Select Singleton contract based on current chain ID
const singleton = fetch(
  "https://raw.githubusercontent.com/safe-global/safe-deployments/main/src/assets/v1.3.0/gnosis_safe_l2.json"
).body;
const singletonAddress =
  JSON.parse(singleton)["networkAddresses"][state.chainId.toString()];

//ABI contract singleton
const singletonAbi = JSON.parse(singleton)["abi"];

const iface = new ethers.utils.Interface(singletonAbi);

// Variable definition for setup
const ownersAddress = ["0x792D64733171E5dBd8C5BcfdDAcb4Ed445D58E4F"];

const address0 = "0x0000000000000000000000000000000000000000";
const bytes0 = new Uint8Array(0);

//Setup encodeData
const encodedData = iface.encodeFunctionData(
  "setup(address[],uint256, address,bytes, address, address, uint256, address)",
  [ownersAddress, 1, address0, bytes0, address0, address0, 0, address0]
);

const createNewMultiSig = () => {
  //Retrieve current nonce
  Ethers.provider()
    .getTransactionCount(ownersAddress[0])
    .then((res) => {
      State.update({ walletNonce: res });
    });

  const safeProxyFactory = new ethers.Contract(
    safeProxyFactoryContractAddress,
    safeProxyFactoryContractAbi,
    Ethers.provider().getSigner()
  );

  safeProxyFactory
    .createProxyWithNonce(singletonAddress, encodedData, state.walletNonce)
    .then((tx) => {
      console.log("tx ", tx);
      if (state.chainId === 1) {
        State.update({ txHash: "https://etherscan.io/tx/" + tx.hash });
      } else if (state.chainId === 11155111) {
        State.update({ txHash: "https://sepolia.etherscan.io/tx" + tx.hash });
      }
    })
    .catch((error) => {
      console.log(error);
      State.update({ error: true });
    });
};

return (
  <>
    <div>Gnosis Safe Deployer</div>
    <div>Click to create a multisig link to your wallet</div>
    <Web3Connect />
    <button onClick={() => createNewMultiSig()}>Deploy Safe</button>
  </>
);