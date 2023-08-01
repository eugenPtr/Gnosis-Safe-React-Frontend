// Example addresses to use as props
// "gnosis-chain-safe": "0x6106FB94E31B83D0A15432FCA2927B838fB6D025"
// "owner-recipient": "0x5d5d4d04B70BFe49ad7Aac8C4454536070dAf180"
// "gnosis-chain-USDC": "0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83"
// "mainnet-safe": "0xf7b458443B6a3e2Cd12b315Ed703c98e030b9Bba"

State.init({
  chainId: null,
  baseUrl: "",
  recipient: "",
  value: Number(0), //initialized to 0 to avoid ethers complaints and enable valueless tx
  contract: "",
  tokenDecimals: 0,
  data: "0x", // transaction calldata
  operation: 0,
  gasToken: "0x0000000000000000000000000000000000000000",
  safeTxGas: 0,
  baseGas: 0,
  gasPrice: 0,
  refundReceiver: "0x0000000000000000000000000000000000000000",
  nonce: 0,
  txHash: "0x",
  sender: null,
  signature: "",
  origin: "NEAR Blockchain Operating System",
});

// connect account
if (state.sender === null) {
  const accounts = Ethers.send("eth_requestAccounts", []);
  const checksummedAddr = ethers.utils.getAddress(accounts[0]);
  if (accounts.length) {
    State.update({ sender: checksummedAddr });

    Ethers.provider()
      .getNetwork()
      .then((chainIdData) => {
        if (chainIdData?.chainId == 1) {
          State.update({
            chainId: "mainnet",
          });
        } else if (chainIdData?.chainId == 5) {
          State.update({
            chainId: "goerli",
          });
        } else if (chainIdData?.chainId == 100) {
          State.update({
            chainId: "gnosis-chain",
          });
        }
      });
  }
}

const getAbi = () => {
  // fetch abi
  const url =
    "https://gist.githubusercontent.com/veox/8800debbf56e24718f9f483e1e40c35c/raw/f853187315486225002ba56e5283c1dba0556e6f/erc20.abi.json";
  const erc20Abi = fetch(url);
  let iface;
  if (erc20Abi.ok) iface = new ethers.utils.Interface(erc20Abi.body);

  // get token decimals, parse units via decimals
  const encodedData = iface.encodeFunctionData("decimals", []);

  Ethers.provider()
    .call({
      to: state.contract,
      data: encodedData,
    })
    .then((tokenDecimals) => {
      State.update({ tokenDecimals: parseInt(Number(tokenDecimals)) });
    });

  const amount = ethers.utils.parseUnits(
    state.value.toString(),
    state.tokenDecimals
  );

  State.update({
    data: iface.encodeFunctionData("transfer", [
      state.recipient.toString(),
      amount,
    ]),
  });
};

const getNonce = (_contract, _addr, _to, _value) => {
  // support ERC20 tokens
  const contract = _contract;
  if (contract) getAbi();

  const addr = ethers.utils.getAddress(_addr); // convert input addrs to checksum
  const to = ethers.utils.getAddress(_to);
  const value = Number(_value);

  State.update({ safeAddress: addr });
  State.update({ recipient: to });
  State.update({ value: value });

  const baseUrl = `https://safe-transaction-${state.chainId}.safe.global/api`;
  const url = baseUrl + `/v1/safes/${addr}/`;
  State.update({ baseUrl: url });

  // http options
  const options = {
    headers: {
      accept: "application/json",
    },
    mode: "no-cors",
  };

  // get nonce
  const res = fetch(url, options);
  State.update({ nonce: res.body.nonce });
};

const getAndSignTxHash = () => {
  // get txhash from contract
  // The Gnosis Safe contract ABI
  const safeAbi = fetch(
    "https://raw.githubusercontent.com/safe-global/safe-deployments/main/src/assets/v1.3.0/gnosis_safe_l2.json"
  ).body;
  const abiJson = JSON.parse(safeAbi)["abi"];
  const signer = Ethers.provider().getSigner();
  const safe = new ethers.Contract(props.safeAddress, abiJson, signer);

  // obtain txHash
  const txHash = safe
    .getTransactionHash(
      state.recipient,
      state.value,
      state.data,
      state.operation,
      state.safeTxGas,
      state.baseGas,
      state.gasPrice,
      state.gasToken,
      state.refundReceiver,
      state.nonce
    )
    .then((res) => {
      State.update({ txHash: res });
      // sign contractTransactionHash using private key of Gnosis Safe owner (or deployer)
      const signature = signer
        .signMessage(ethers.utils.arrayify(res))
        .then((sig) => {
          const alterV = ethers.utils.hexDataSlice(sig, 0, 64) + "1f";
          State.update({ signature: ethers.utils.hexlify(alterV) });
        });
    });
};

const postToSafeApi = () => {
  // craft transaction from state vars
  const transaction = {
    safe: props.safeAddress,
    to: state.recipient,
    value: state.value,
    data: state.data,
    operation: state.operation,
    gasToken: state.gasToken,
    safeTxGas: state.safeTxGas,
    baseGas: state.baseGas,
    gasPrice: state.gasPrice,
    refundReceiver: state.refundReceiver,
    nonce: state.nonce, // Nonce of the Safe, transaction cannot be executed until Safe's nonce is accurate
    contractTransactionHash: state.txHash, // Contract transaction hash calculated from all the fields
    sender: state.sender, // must be checksummed Owner of the Safe
    signature: state.signature, // One or more ECDSA signatures of the `contractTransactionHash` as an hex string
    origin: state.origin,
  };

  const transactionsUrl = state.baseUrl + `multisig-transactions/`;
  const params = JSON.stringify(transaction);
  const proposalOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "no-cors",
    body: params,
  };

  // post to gnosis API backend
  const proposed = asyncFetch(transactionsUrl, proposalOptions).then((res) =>
    console.log(res)
  );
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
      .bg-dark-gray {
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
      .input-border {
        border: 1px solid ${colors.darkGray};
        border-radius: 25px;
      }
      .cta {
        border: 1px solid ${colors.primaryGreen};
        border-radius: 25px;
        background-color: ${colors.primaryBlack}
        text-align: center;
        color: ${colors.primaryGreen}

      }
      input:active
      {
        border: 1px solid ${colors.primaryGreen}
        background-color: ${colors.primaryGreen}
      }
    `,
  });
}

function signButton() {
  return (
    <button
      onClick={() =>
        getNonce(
          state.contract,
          props.safeAddress,
          state.recipient,
          state.value
        ).then(getAndSignTxHash())
      }
      label="SignButton"
      className="cta px-10 py-2 w-full bg-primary-black"
    >
      <span>Sign Transaction</span>
    </button>
  );
}

function proposeButton() {
  return (
    <button
      onClick={() => postToSafeApi()}
      label="ProposeButton"
      className="cta px-10 py-2 w-full bg-primary-black"
    >
      <span>Propose Transaction</span>
    </button>
  );
}

return (
  <TWStyles>
    <div className="bg-primary-black text-white border max-w-3xl">
      <h1 className="text-xl font-bold border-b py-3 px-8 text-green">
        New Transaction
      </h1>
      <div className="flex flex-col">
        <div className="border-b px-8 py-4">
          <p className="text-gray">Sending from</p>
          <p>{props.safeAddress}</p>

          <input
            value={state.recipient}
            onChange={(e) => State.update({ recipient: e.target.value })}
            placeholder="Recipient address"
            label="RecipientAddressInput"
            className="w-full px-4 py-2 bg-dark-gray input-border mb-3 text-gray"
          />

          <input
            value={state.contract}
            onChange={(e) => State.update({ contract: e.target.value })}
            placeholder="ERC20 address - leave empty if performing native currency transfer (ETH, MATIC, xDAI)"
            label="TokenAddressInput"
            className="w-full px-4 py-2 bg-dark-gray input-border mb-3 text-gray"
          />
        </div>
        <div className="border-b py-4 px-8">
          <div className="flex justify-between text-gray pb-2">
            <span>Amount available</span>
            <span>13 ETH</span>
          </div>
          <input
            value={state.value}
            onChange={(e) => State.update({ value: e.target.value })}
            placeholder="ETH Amount"
            label="ETHValueInput"
            className="w-full px-4 py-2 bg-dark-gray input-border mb-3 text-gray"
          />
          {state.signature === "" ? signButton() : proposeButton()}
        </div>
      </div>
    </div>
  </TWStyles>
);
