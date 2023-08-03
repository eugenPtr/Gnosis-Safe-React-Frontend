if (!props.apiBaseUrl || !props.safeAddress || !props.chainNativeToken)
  return "[New Transaction] One of the following props is missing: apiBaseUrl, safeAddress, chainNativeToken";

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
  asyncFetch(`${props.apiBaseUrl}/api/v1/safes/${props.safeAddress}`).then(
    (res) => {
      State.update({
        threshold: res.body.threshold,
        owners: res.body.owners,
      });
    }
  );

  // Fetch balances
  asyncFetch(
    `${props.apiBaseUrl}/api/v1/safes/${props.safeAddress}/balances/usd?trusted=false&exclude_spam=false`
  ).then((res) => {
    let safeBalances = [
      {
        icon: props.chainNativeToken.icon,
        symbol: props.chainNativeToken.symbol,
        amount:
          res.body[0].balance / Math.pow(10, props.chainNativeToken.decimals),
      },
    ];

    const totalValueUSD = res.body.reduce(
      (acc, token) => acc + Number(token.fiatBalance),
      0
    );

    res.body
      .filter((item) => item.token != null)
      .forEach((item) =>
        safeBalances.push({
          icon: item.token.logoUri,
          symbol: item.token.symbol,
          amount: item.balance / Math.pow(10, item.token.decimals),
        })
      );
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
    <div className="bg-primary-black text-white border">
      <h1 className="text-xl font-bold text-green border-b py-3 px-8">
        Overview
      </h1>
      <div className="py-5 flex flex-col gap-3">
        <div className="px-8">
          <p>Account</p>
          <div className="grid grid-cols-12 gap-4 items-center mb-3">
            <div className="">{props.safeAddress}</div>
          </div>
        </div>

        <div className="px-8 flex justify-between items-center border-b border-gray-dark">
          <div className="">
            <p className="text-gray">Value</p>
            <p>${state.valueInUSD}</p>
          </div>
          <div className="">
            <p className="text-gray">Threshold</p>
            <p>{state.threshold}</p>
          </div>
          <div className="">
            <p className="text-gray">Owners</p>
            <p>{state.owners.length}</p>
          </div>
        </div>
        <br></br>
        <Collapsible.Root
          className="px-8 border-b"
          open={state.openOwners}
          onOpenChange={() => State.update({ openOwners: !state.openOwners })}
        >
          <div className="flex justify-between">
            <p> Owners </p>
            <Collapsible.Trigger asChild>
              <span className="">
                {state.openOwners ? (
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
                  <svg stroke="#00ec97" className="h-8 w-8" viewBox="0 0 24 24">
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

          <Collapsible.Content className="px-3">
            <ul>
              {state.owners.map((owner) => (
                <li key={owner}>{owner}</li>
              ))}
            </ul>
          </Collapsible.Content>
        </Collapsible.Root>

        <Collapsible.Root
          className="px-8 border-b"
          open={state.openBalances}
          onOpenChange={() =>
            State.update({ openBalances: !state.openBalances })
          }
        >
          <div className="flex justify-between">
            <p> Balances </p>
            <Collapsible.Trigger asChild>
              <span className="">
                {state.openBalances ? (
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
                  <svg stroke="#00ec97" className="h-8 w-8" viewBox="0 0 24 24">
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
            <ul className="px-3">
              {state.balances.map((token) => (
                <li className="flex gap-4 items-center mb-3" key={token.symbol}>
                  {token.icon ? (
                    <img
                      className="inline h-8 w-8 rounded-full"
                      src={token.icon}
                    />
                  ) : (
                    <span className="dot"></span>
                  )}

                  <span className="inline">{token.symbol}</span>
                  <span className="justify-self-end">{token.amount}</span>
                </li>
              ))}
            </ul>
          </Collapsible.Content>
        </Collapsible.Root>
      </div>
    </div>
  </TWStyles>
);
