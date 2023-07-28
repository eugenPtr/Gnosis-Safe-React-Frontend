State.init({
  chainId: null,
  baseUrl: "",
  safeAddress: null,
  sender: null,
  transactions: [],
  selectedTransaction: null,
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

// detect and set given safe address to state
if (state.safeAddress) {
  const _url = `https://safe-transaction-${state.chainId}.safe.global/api`;
  const _baseUrl = _url + `/v1/safes/${state.safeAddress}/`;
  State.update({ baseUrl: _baseUrl });

  // get proposed transactions from the backend
  const response = fetch(state.baseUrl + "all-transactions/");
  if (response.ok) {
    const notExecuted = response.body.results.filter(
      (tx) => tx.executionDate === null
    );
    State.update({ transactions: notExecuted });
  }
}

// choose relevant transaction to sign and confirm
const selectTransaction = (tx) => {
  State.update({ selectedTransaction: tx });
};

// sign relevant transaction
const signTransaction = () => {
  if (state.selectedTransaction) {
    // todo
    return;
  } else {
    console.log("Please select a transaction to sign.");
  }
};

// I don't know any CSS so please forgive the following fuckery
const Selection = styled.button`
  background: ${(tx) =>
    state.selectedTransaction == tx ? "palevioletred" : "white"};
  color: ${(props) => (props.primary ? "white" : "palevioletred")};

  font-size: 1em;
  margin: 1em;
  padding: 0.25em 1em;
  border: 2px solid palevioletred;
  border-radius: 10px;
`;

return (
  <div>
    <input
      value={state.safeAddress}
      onChange={(e) => State.update({ safeAddress: e.target.value })}
      placeholder="Enter Safe address to view txs"
      label="SafeAddressInput"
    />
    <p>Queued transactions:</p>
    <ul>
      {state.transactions.map((tx, index) => (
        <li key={index} onClick={() => selectTransaction(tx)}>
          <Selection>
            <span>
              From Safe Address: {state.safeAddress}
              <br />
              Type:
              {tx.data
                ? `ERC20 ${tx.dataDecoded.method} 
                To: ${tx.dataDecoded.parameters[0].value} 
                Value: ${tx.dataDecoded.parameters[1].value}`
                : `Native Currency Transfer 
                To: ${tx.to} 
                Value: ${tx.value} 
                `}
              <br />
              {
                state.selectedTransaction.safeTxHash == tx.safeTxHash
                  ? "!!!!!!THIS ONE IS SELECTED RIGHT NOW!!!!!!"
                  : "" /** Again I don't know css */
              }
            </span>
          </Selection>
        </li>
      ))}
    </ul>
    <button onClick={signTransaction()} label="SignButton">
      <span>Sign Selected Transaction</span>
    </button>
    <Web3Connect className="web3-connect" connectLabel="Connect Wallet" />
  </div>
);
