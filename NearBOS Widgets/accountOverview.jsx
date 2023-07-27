const { chain, safeAddr, apiBaseURL, chainNativeToken } = props;

State.init({
  threshold: null,
  valueInUSD: null,
  owners: [],
  balances: [],
  openOwners: false,
  openBalances: false,
});

function fetchData() {
  // Fetch onwers and threshold
  asyncFetch(`${props.apiBaseUrl}/api/v1/safes/${props.safeAddr}`).then(
    (res) => {
      State.update({
        threshold: res.body.threshold,
        owners: res.body.owners,
      });
    }
  );

  // Fetch balances
  asyncFetch(
    `${props.apiBaseUrl}/api/v1/safes/${props.safeAddr}/balances/usd?trusted=false&exclude_spam=false`
  ).then((res) => {
    let safeBalances = [
      {
        icon: props.chainNativeToken.icon,
        symbol: props.chainNativeToken.symbol,
        amount:
          res.body[0].balance / Math.pow(10, props.chainNativeToken.decimals),
      },
    ];
    console.log(safeBalances);
    console.log("Native token balance", JSON.parse(res), res.body[0]);
    // console.log(safeBalances);
    const totalValueUSD = res.body.reduce(
      (acc, token) => acc + Number(token.fiatBalance),
      0
    );
    console.log(totalValueUSD);
    State.update({
      balances: safeBalances,
      valueInUSD: totalValueUSD,
    });
  });
}

fetchData();

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
  State.update({
    styles: styled.div`
      ${css.body}

      .bg-primary-black {
        background-color: #1C1C1C
      }
      .bg-primary-green {
        background-color: #00EC97
      }
      .border-gray-dark {
        border-color: #3E3E3E
      }
    `,
  });
}

const owners = ["addr1", "addr2"];
const balances = [
  {
    symbol: "USDC",
    amount: 100,
  },
];

return (
  <TWStyles>
    <div className="bg-primary-black text-white border border-gray-dark border-solid">
      <h1 className="text-xl font-bold border-b border-gray-dark border-solid py-3 px-8">
        Overview
      </h1>
      <div className="px-8 py-5 flex flex-col gap-3">
        <div>
          <p>Account</p>
          <div className="grid grid-cols-12 gap-4 items-center mb-3">
            <div className="bg-slate-300 rounded-full w-10 h-10"></div>
            <div className="">{props.safeAddr}</div>
            <div className="col-start-11 col-span-2 bg-primary-green rounded-3xl h-full flex items-center justify-center">
              <span className="">{props.chain}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="">
            <p className="text-gray-light">Value</p>
            <p>${state.valueInUSD}</p>
          </div>
          <div className="">
            <p className="text-gray-light">Threshold</p>
            <p>{state.threshold}</p>
          </div>
          <div className="">
            <p className="text-gray-light">Owners</p>
            <p>{state.owners.length}</p>
          </div>
        </div>
        <br></br>
        <Collapsible.Root
          className=""
          open={state.openOwners}
          onOpenChange={() => State.update({ openOwners: !state.openOwners })}
        >
          <div className="flex justify-between">
            <p> Owners </p>
            <Collapsible.Trigger asChild>
              <button className="">
                {state.openOwners ? <label>Close</label> : <label>Open</label>}
              </button>
            </Collapsible.Trigger>
          </div>

          <Collapsible.Content className="px-3">
            <ul>
              {state.owners.map((owner) => (
                <li key={owner}>{owner}</li>
              ))}
            </ul>
          </Collapsible.Content>
        </Collapsible.Root>

        <Collapsible.Root
          className=""
          open={state.openBalances}
          onOpenChange={() =>
            State.update({ openBalances: !state.openBalances })
          }
        >
          <div className="flex justify-between">
            <p> Balances </p>
            <Collapsible.Trigger asChild>
              <button className="">
                {state.openBalances ? (
                  <label>Close</label>
                ) : (
                  <label>Open</label>
                )}
              </button>
            </Collapsible.Trigger>
          </div>

          <Collapsible.Content>
            <ul className="px-3">
              {state.balances.map((token) => (
                <li className="" key={token.symbol}>
                  <p className="">
                    {token.symbol} - {token.amount}
                  </p>
                </li>
              ))}
            </ul>
          </Collapsible.Content>
        </Collapsible.Root>
      </div>
    </div>
  </TWStyles>
);
