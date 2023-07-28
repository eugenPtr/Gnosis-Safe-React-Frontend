// Example addresses to use as props
// "gnosis-chain-safe": "0x6106FB94E31B83D0A15432FCA2927B838fB6D025"
// "owner-recipient": "0x5d5d4d04B70BFe49ad7Aac8C4454536070dAf180"
// "gnosis-chain-USDC": "0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83"
// "mainnet-safe": "0xf7b458443B6a3e2Cd12b315Ed703c98e030b9Bba"

State.init({
  chainId: null,
  baseUrl: "",
  safeAddress: null,
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
  const safe = new ethers.Contract(state.safeAddress, abiJson, signer);

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
    safe: state.safeAddress,
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

return (
  <div>
    <p>
      Leave ERC20 token address field blank if performing a native currency
      (ETH, MATIC, xDAI) transfer
    </p>
    <input
      value={state.contract}
      onChange={(e) => State.update({ contract: e.target.value })}
      placeholder="ERC20 address"
      label="TokenAddressInput"
    />
    <input
      value={state.safeAddress}
      onChange={(e) => State.update({ safeAddress: e.target.value })}
      placeholder="Safe address"
      label="SafeAddressInput"
    />
    <input
      value={state.recipient}
      onChange={(e) => State.update({ recipient: e.target.value })}
      placeholder="Recipient address"
      label="RecipientAddressInput"
    />
    <input
      value={state.value}
      onChange={(e) => State.update({ value: e.target.value })}
      placeholder="ETH Amount"
      label="ETHValueInput"
    />
    <button
      onClick={() =>
        getNonce(
          state.contract,
          state.safeAddress,
          state.recipient,
          state.value
        ).then(getAndSignTxHash())
      }
      label="SignButton"
    >
      <span>Sign Transaction</span>
    </button>
    <button onClick={() => postToSafeApi()} label="ProposeButton">
      <span>Propose Transaction</span>
    </button>
    <Web3Connect className="web3-connect" connectLabel="Connect Wallet" />
  </div>
);
