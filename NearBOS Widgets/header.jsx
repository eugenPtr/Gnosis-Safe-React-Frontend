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
      .bg-accent-yellow {
        background-color: ${colors.accentYellow}
      }
      .bg-accent-green {
        background-color: ${colors.accentGreen}
      }
      .bg-dark-gray {
        background-color: ${colors.darkGray}
      }
      .border-b {
        border-bottom: 1px solid ${colors.darkGray};
      }
      .web3-connect {
        border-radius: 25px;
        transition: all 300ms ease-in-out;
        &:hover {
          background: #262626;
          opacity: 0.5;
        }
        &:active {
          background: #262626 !important;
        }
      }
    `,
  });
}

return (
  <TWStyles>
    <div className="px-5 py-7 bg-primary-black flex justify-end border-b">
      <Web3Connect
        className="web3-connect bg-dark-gray text-white font-bold font-sm"
        connectLabel="Connect Wallet"
      />
      {props.chainName && props.connectedWallet && (
        <div className="flex gap-3">
          <div className="px-5 py-1 bg-accent-yellow rounded-3xl h-full flex items-center justify-center">
            <span className="">{props.connectedWallet}</span>
          </div>
          <div className="px-5 py-1 bg-primary-green rounded-3xl h-full flex items-center justify-center">
            <span className="">{props.chain}</span>
          </div>
        </div>
      )}
    </div>
  </TWStyles>
);
