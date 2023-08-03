State.init({
  sender: null,
  queuedTransactions: [],
  executedTransactions: [],
  openStates: [],
});

if (state.sender === null) {
  const accounts = Ethers.send("eth_requestAccounts", []);
  if (accounts.length) {
    const checksummedAddr = ethers.utils.getAddress(accounts[0]);
    State.update({ sender: checksummedAddr });
  } else {
    return <Web3Connect />;
  }
}

function isERC20Transfer(tx) {
  return (
    tx.value === "0" &&
    tx.data &&
    tx.dataDecoded &&
    tx.dataDecoded.method === "transfer"
  );
}

function isNativeTokenTransfer(tx) {
  return tx.value && !tx.data;
}

// get proposed transactions from the backend
const url =
  props.apiBaseUrl + `/api/v1/safes/${props.safeAddress}/all-transactions`;
console.log(url);
const response = fetch(url);
if (response.ok) {
  const notExecuted = response.body.results.filter(
    (tx) =>
      tx.executionDate === null &&
      tx.to != props.safeAddress &&
      (isNativeTokenTransfer(tx) || isERC20Transfer(tx))
  );

  const formattedQueuedTxs = notExecuted.map((tx) => {
    if (isNativeTokenTransfer(tx)) {
      return {
        safeTxHash: tx.safeTxHash,
        to: tx.to,
        value: tx.value,
        data: tx.data,
        operation: tx.operation,
        safeTxGas: tx.safeTxGas,
        baseGas: tx.baseGas,
        gasPrice: tx.gasPrice,
        gasToken: tx.gasToken,
        refundReceiver: tx.refundReceiver,
        symbol: "xDai",
        decimals: 18,
        confirmationsRequired: tx.confirmationsRequired,
        confirmations: tx.confirmations,
      };
    }
    if (isERC20Transfer(tx)) {
      const token = fetch(`${props.apiBaseUrl}/api/v1/tokens/${tx.to}`);
      return {
        safeTxHash: tx.safeTxHash,
        to: tx.dataDecoded.parameters[0].value,
        value: tx.dataDecoded.parameters[1].value,
        data: tx.data,
        operation: tx.operation,
        safeTxGas: tx.safeTxGas,
        baseGas: tx.baseGas,
        gasPrice: tx.gasPrice,
        gasToken: tx.gasToken,
        refundReceiver: tx.refundReceiver,
        symbol: token.body.symbol,
        decimals: token.body.decimals,
        confirmationsRequired: tx.confirmationsRequired,
        confirmations: tx.confirmations,
      };
    }
  });
  const executed = response.body.results.filter(
    (tx) => tx.executionDate !== null
  );
  State.update({ queuedTransactions: formattedQueuedTxs });
  State.update({ executedTransactions: executed });
}

// choose relevant transaction to sign and confirm
const selectTransaction = (tx) => {
  State.update({ selectedTransaction: tx });
};

// sign relevant transaction
const signTransaction = (safeTxHash) => {
  const signer = Ethers.provider().getSigner();
  signer.signMessage(ethers.utils.arrayify(safeTxHash)).then((sig) => {
    const setV = ethers.utils.hexDataSlice(sig, 0, 64) + "1f";

    const url =
      props.apiBaseUrl +
      `/api/v1/multisig-transactions/${safeTxHash}/confirmations/`;
    const params = JSON.stringify({ signature: setV });
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: params,
    };

    //   post confirmed sig with set V to gnosis API backend
    asyncFetch(url, options).then((res) => {
      // if status is 201 then confirmation was successful
      console.log(res);
    });
  });
};

const execTransaction = (tx) => {
  // get Gnosis Safe contract ABI
  const abiUrl =
    "https://raw.githubusercontent.com/safe-global/safe-deployments/main/src/assets/v1.3.0/gnosis_safe_l2.json";
  const abi = fetch(abiUrl);
  const signer = Ethers.provider().getSigner();
  let abiJson;
  let safeContract;
  if (abi.ok) {
    abiJson = JSON.parse(abi.body)["abi"];
    safeContract = new ethers.Contract(props.safeAddress, abiJson, signer);
    const signatures = tx.confirmations.map((obj) => obj.signature);

    const data = tx.data == null ? "0x" : tx.data;

    // todo contract call seems entirely correct but throws gas estimation error
    safeContract.execTransaction(
      tx.to,
      tx.value,
      data,
      tx.operation,
      tx.safeTxGas,
      tx.baseGas,
      tx.gasPrice,
      tx.gasToken,
      tx.refundReceiver,
      ethers.utils.hexConcat(signatures)
    );
  }
};

const TWStyles = state.styles;
const css = fetch(
  "https://gist.githubusercontent.com/Pikqi/658b6ee444d26dd69f0d5150797077dd/raw/d8f929729176bb30d86e2839443fddb83a87a685/tw-all-classes.css"
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
        background-color: ${colors.primaryBlack};
        text-align: center;
        color: ${colors.primaryGreen};

        &:active {
          background: ${colors.primaryGreen} !important;
          color: white !important;
        }
      }
    `,
  });
}

function toggleOpen(index) {
  State.update({
    openStates: state.openStates.map((val, idx) =>
      idx === index ? !val : val
    ),
  });
}

return (
  <TWStyles>
    <div className="bg-primary-black text-white border">
      <div className="border-b px-8 py-4">
        <h1 className="text-xl font-bold text-green">Transactions</h1>
        <p className="text-sm text-gray">
          {" "}
          **Only token transfers are listed **
        </p>
      </div>

      <Tabs.Root className="" defaultValue="tab1">
        <Tabs.List className="grid grid-cols-2 text-center " aria-label="">
          <Tabs.Trigger
            className="py-3 px-5 border bg-primary-black text-white  hover:text-primary-green focus:text-primary-green focus:border-b-primary-green focus:border-b"
            value="tab1"
          >
            Queue
          </Tabs.Trigger>
          <Tabs.Trigger
            className="py-3 px-5 border bg-primary-black text-white hover:text-primary-green focus:text-primary-green focus:border-b-primary-green focus:border-b"
            value="tab2"
          >
            History
          </Tabs.Trigger>
        </Tabs.List>
        {/* TX QUEUE */}
        <Tabs.Content className="" value="tab1">
          <ul className="p-4 flex flex-col gap-2">
            {state.queuedTransactions.map((tx, index) => (
              <li className="px-4 py-3 bg-gray-dark rounded-md" key={index}>
                <Collapsible.Root
                  className=""
                  open={state.openStates[index]}
                  onOpenChange={() => toggleOpen(index)}
                >
                  <div className="flex justify-between">
                    <span>To: {tx.to}</span>
                    <span>
                      {tx.value / Math.pow(10, tx.decimals)} {tx.symbol}
                    </span>
                    <Collapsible.Trigger asChild>
                      <span className="">
                        {state.openStates[index] ? (
                          <svg className="h-8 w-8" viewBox="0 0 24 24">
                            <path
                              d="m15 11-3 3-3-3"
                              stroke="#00ec97"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                            />
                          </svg>
                        ) : (
                          <svg
                            stroke="#00ec97"
                            className="h-8 w-8"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="m9 13 3-3 3 3"
                              stroke="#00ec97"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                            />
                          </svg>
                        )}
                      </span>
                    </Collapsible.Trigger>
                  </div>

                  <Collapsible.Content>
                    <div className="p-3">
                      <div className="flex justify-between">
                        <p>
                          Confirmations: {tx.confirmations?.length}/
                          {tx.confirmationsRequired}
                        </p>
                        {tx.confirmations?.length ==
                        tx.confirmationsRequired ? (
                          <button
                            className="cta px-10 py-2 bg-primary-black"
                            onClick={() => execTransaction(tx)}
                          >
                            {" "}
                            Execute{" "}
                          </button>
                        ) : (
                          <button
                            className="cta px-10 py-2 bg-primary-black"
                            onClick={() => signTransaction(tx.safeTxHash)}
                          >
                            {" "}
                            Confirm{" "}
                          </button>
                        )}
                      </div>
                      <ul className="px-3">
                        {tx.confirmations.map((conf) => (
                          <li>{conf.owner}</li>
                        ))}
                      </ul>
                    </div>
                  </Collapsible.Content>
                </Collapsible.Root>
              </li>
            ))}
          </ul>
        </Tabs.Content>
        <Tabs.Content className="TabsContent" value="tab2">
          <ul className="p-4 flex flex-col gap-2">
            {state.executedTransactions.map((tx, index) => (
              <li className="px-4 py-3 bg-gray-dark rounded-md" key={index}>
                <Collapsible.Root
                  className=""
                  open={state.openStates[index]}
                  onOpenChange={() => toggleOpen(index)}
                >
                  <div className="flex justify-between">
                    <span>
                      {tx.to === safeAddr ? "Received" : "Sent"} -{" "}
                      {tx.executionDate === null ? "Queued" : "Executed"}
                    </span>
                    <Collapsible.Trigger asChild>
                      <span className="">
                        {state.openStates[index] ? (
                          <svg className="h-8 w-8" viewBox="0 0 24 24">
                            <path
                              d="m15 11-3 3-3-3"
                              stroke="#00ec97"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                            />
                          </svg>
                        ) : (
                          <svg
                            stroke="#00ec97"
                            className="h-8 w-8"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="m9 13 3-3 3 3"
                              stroke="#00ec97"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                            />
                          </svg>
                        )}
                      </span>
                    </Collapsible.Trigger>
                  </div>

                  <Collapsible.Content>
                    <div className="p-3">
                      <p>To: {tx.to}</p>
                      {tx.to !== safeAddr && (
                        <div>
                          <p>
                            Confirmations: {tx.confirmations?.length}/
                            {tx.confirmationsRequired}
                          </p>
                        </div>
                      )}
                    </div>
                  </Collapsible.Content>
                </Collapsible.Root>
              </li>
            ))}
          </ul>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  </TWStyles>
);
