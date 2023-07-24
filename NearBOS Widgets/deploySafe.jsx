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
const walletOwner = Ethers.send("eth_requestAccounts", [])[0];

initState({
  factoryContractAddress: "",
  singletonAddress: "",
  walletOwners: [walletOwner],
  walletNonce: 0,
  threeshold: "",
  encondeDatas: "",
});

//SelectGnosisSafeProxyFactory contract based on current chain ID
const proxyFactory = fetch(
  "https://raw.githubusercontent.com/safe-global/safe-deployments/main/src/assets/v1.3.0/proxy_factory.json"
).body;

const safeProxyFactoryContractAddress =
  JSON.parse(proxyFactory)["networkAddresses"][state.chainId.toString()];
State.update({ factoryContractAddress: safeProxyFactoryContractAddress });

//ABI contract proxyFactory
const safeProxyFactoryContractAbi = JSON.parse(proxyFactory)["abi"];

//const iface = new ethers.utils.Interface(safeProxyFactoryContractAbi);

//Select Singleton contract based on current chain ID
const singleton = fetch(
  "https://raw.githubusercontent.com/safe-global/safe-deployments/main/src/assets/v1.3.0/gnosis_safe_l2.json"
).body;
const singletonAddress =
  JSON.parse(singleton)["networkAddresses"][state.chainId.toString()];
State.update({ singletonAddress: singletonAddress });

//ABI contract singleton
const singletonAbi = JSON.parse(singleton)["abi"];

const iface = new ethers.utils.Interface(singletonAbi);

// Variable definition for setup

const address0 = "0x0000000000000000000000000000000000000000";
const bytes0 = new Uint8Array(0);

const createSafeWallet = () => {
  //Retrieve current nonce
  Ethers.provider()
    .getTransactionCount(ownersAddress[0])
    .then((res) => {
      State.update({ walletNonce: res });
    });
  console.log("walletOwners", state.walletOwners);
  const safeProxyFactory = new ethers.Contract(
    state.factoryContractAddress,
    safeProxyFactoryContractAbi,
    Ethers.provider().getSigner()
  );

  safeProxyFactory
    .createProxyWithNonce(
      state.singletonAddress,
      state.encondeDatas,
      state.walletNonce
    )
    .then((tx) => {
      console.log("tx ", tx);
      if (state.chainId === 1) {
        State.update({ txHash: "https://etherscan.io/tx/" + tx.hash });
      } else if (state.chainId === 100) {
        State.update({ txHash: "https://gnosisscan.io/tx" + tx.hash });
      }
    })
    .catch((error) => {
      console.log(error);
      State.update({ error: true });
    });
};

return (
  <>
    <div>
      {state.walletOwners.map((walletOwner, index) => (
        <div key={index}>
          <label>Owner Address</label>
          &nbsp;
          <input
            type="text"
            style={{ width: "82%" }}
            value={walletOwner}
            onChange={(e) => {
              const a = [...state.walletOwners];
              a[index] = e.target.value;
              State.update({ walletOwners: a });
            }}
          />
          &nbsp;
          <button
            onClick={() => {
              const a = [...state.walletOwners];
              a.splice(index, 1);
              State.update({ walletOwners: a });
            }}
          >
            -
          </button>
        </div>
      ))}
    </div>
    <button
      onClick={() => {
        const a = [...state.walletOwners];
        a.push("");
        State.update({ walletOwners: a });
      }}
    >
      + Add new owner
    </button>
    <div>
      <div>
        <label>Threeshold</label>
        &nbsp;
        <input
          type="text"
          style={{ width: "82%" }}
          value={threeshold}
          onChange={(e) => {
            let a = e.target.value;
            State.update({ threeshold: a });
          }}
        />
      </div>
    </div>
    <button
      onClick={() => {
        let a = iface.encodeFunctionData(
          "setup(address[],uint256, address,bytes, address, address, uint256, address)",
          [
            state.walletOwners,
            state.threeshold,
            address0,
            bytes0,
            address0,
            address0,
            0,
            address0,
          ]
        );
        State.update({ encondeDatas: a });
        createSafeWallet();
      }}
    >
      Create Wallet
    </button>
    <Web3Connect />
  </>
);
