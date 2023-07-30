/Connect to Wallet
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

const TWStyles = state.styles;
const css = fetch(
  "https://gist.githubusercontent.com/Pikqi/658b6ee444d26dd69f0d5150797077dd/raw/d8f929729176bb30d86e2839443fddb83a87a685/tw-all-classes.css"
);
const fontAwesome = fetch(
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
);

if (!css.ok) {
  return (
    <Widget
      props={{
        color1: "#ef4444",
        color2: "#7f1d1d",
      }}
      src="nui.sking.near/widget/Feedback.Spinner"
    />
  );
}

if (!state.styles) {
  const colors = {
    primaryGreen: "#00EC97",
    primaryBlack: "#151718",
    accentYellow: "#F2FF9F",
    accentGreen: "#17D9D4",
    accentBlue: "#3D7FFF",
    darkGray: "#3E3E3E",
    lightGray: "#B6B6B6",
  };

  State.update({
    styles: styled.div`
      ${css.body}
      ${fontAwesome.body}
      .bg-primary-black {
        background-color: ${colors.primaryBlack}
      }
      .bg-primary-green {
        background-color: ${colors.primaryGreen}
      }
      .bg-primary-dark-gray {
        background-color: ${colors.darkGray}
      }
      .text-gray {
        color: ${colors.lightGray}
      }
      .text-green {
        color: ${colors.primaryGreen}
      }
      .dot {
        height: 40px;
        width: 40px;
        background-color: #bbb;
        border-radius: 50%;
        display: inline-block;
      }
      ul {
        list-style-type: none;
      }
      .border-b {
        border-bottom: 1px solid ${colors.darkGray};
      }
      .border {
        border: 1px solid ${colors.darkGray};
      }
    `,
  });
}

return (
  <TWStyles>
    <div className="border-b bg-primary-black text-white text-xl font-bold border px-8 py-3">
      Create Safe Account
      <Web3Connect className="bg-primary-black text-green text-xl font-bold ml-80" />
      <div>
        <div className="text-green py-3">Owners and Confimations</div>
        {state.walletOwners.map((walletOwner, index) => (
          <div className="text-lg font-bold border-b py-3" key={index}>
            <label className="text-gray text-sm py-1">
              Owner Address
              <input
                className="rounded-full border-opacity-25 bg-primary-dark-gray py-3 px-6"
                type="text"
                style={{ width: "82%" }}
                value={walletOwner}
                onChange={(e) => {
                  const a = [...state.walletOwners];
                  a[index] = e.target.value;
                  State.update({ walletOwners: a });
                }}
              />
            </label>
            <button
              className="rounded-full border-opacity-25 bg-primary-black"
              onClick={() => {
                const a = [...state.walletOwners];
                a.splice(index, 1);
                State.update({ walletOwners: a });
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#00EC97"
                class="w-5 h-5"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
      <button
        className="bg-primary-black text-green text-sm border-none font-bold "
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
          <div className="text-green py-3">Threeshold</div>
          <label className="text-gray text-sm py-1">
            Any transaction requires the confirmation of:
            <input
              className="rounded-full border-opacity-25 bg-primary-dark-gray py-3 px-6"
              type="text"
              style={{ width: "82%" }}
              value={threeshold}
              onChange={(e) => {
                let a = e.target.value;
                State.update({ threeshold: a });
              }}
            />
          </label>
        </div>
      </div>
      <button
        className="rounded-full border-opacity-25 bg-primary-black text-green font-bold text-lg"
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
    </div>
  </TWStyles>
);
