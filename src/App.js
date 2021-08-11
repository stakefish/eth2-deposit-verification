import { useState } from "react";

import { initBLS } from "@chainsafe/bls";
import abiDecoder from "abi-decoder";
import { buildMessageRoot } from "./ssz";
import { verifySignature } from "./verify-signature";
import BatchDeposit from "./BatchDeposit.json";
import SingleDeposit from "./SingleDeposit.json";

function App() {
  const [status, setStatus] = useState();
  const [contract, setContract] = useState();
  const [credentials, setCredentials] = useState();
  const [validators, setValidators] = useState();

  const buildDepositData = (pubkey, cred, amount, sign) => {
    const depositDatum = {
      pubkey,
      withdrawal_credentials: cred,
      amount,
      signature: sign,
    };
    const messageRoot = buildMessageRoot(depositDatum).toString("hex");

    return { ...depositDatum, deposit_message_root: messageRoot };
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setStatus(undefined);

    try {
      await initBLS();

      abiDecoder.addABI(BatchDeposit);

      let decodedData = abiDecoder.decodeMethod(contract);

      if (!decodedData?.params?.length) {
        abiDecoder.removeABI(BatchDeposit);
        abiDecoder.addABI(SingleDeposit);

        decodedData = abiDecoder.decodeMethod(contract);

        if (!decodedData?.params?.length) {
          setStatus("error");
          return;
        }

        //Arrayify single deposit data root
        decodedData.params[3].value = [decodedData.params[3].value];
      }

      // Get number of validators
      const validatorCount = decodedData.params[3].value.length;

      const pubkeys = decodedData.params[0].value.slice(2).match(/.{1,96}/g);
      const signatures = decodedData.params[2].value.slice(2).match(/.{1,192}/g);

      // loop each deposit
      for (let i = 0; i < validatorCount; i++) {
        var depositData = buildDepositData(
          pubkeys[i],
          decodedData.params[1].value.slice(2),
          Number("32000000000"),
          signatures[i]
        );

        // Verify signatures to prevent fork version mismatch / mitm
        if (!verifySignature(depositData)) {
          console.error("Can't verify backend signature!", depositData);
          setStatus("error");
          return;
        } else {
          console.log(decodedData.params);
          setCredentials(decodedData?.params[1].value);
          setValidators(decodedData?.params[3].value.length);
          console.log("Sign ok");
          setStatus("success");
        }
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <a href="https://stake.fish/" tabIndex="-1" rel="noopener">
            <img className="logo" src="logo.svg" width="220px" alt="stake.fish" />
          </a>
        </div>
      </header>
      <section className="section">
        <div className="container">
          <h1 className="title">Check your ETH 2.0 Deposit Message</h1>
          <div className="row">
            <div className="col-left">
              <div className="group">
                <p className="lead">
                  This tool check if transaction raw data contains a valid ETH 2.0 Deposit Message. Copy and
                  paste your ETH1.x Deposit transaction raw data here
                </p>
                <form className="form" onSubmit={onSubmit}>
                  <div className="form-group">
                    <textarea
                      name="contract"
                      className="textarea-field"
                      placeholder="Paste your code here"
                      onChange={(event) => setContract(event.target.value)}
                    ></textarea>
                  </div>
                  <button type="submit" className="btn-primary" disabled={!contract}>
                    Check
                  </button>
                </form>
                {status === "success" ? (
                  <div className="message message--success">
                    <div className="message-inner">
                      <div className="message-icon">
                        <img src="success-icn.svg" width="64px" alt="success" />
                      </div>
                      <div className="message-content">
                        <div className="message-title">Success!</div>
                        <div className="message-text">Withdrawal credentials: {credentials}</div>
                        <div className="message-text">Validator number: {validators}</div>
                      </div>
                    </div>
                  </div>
                ) : null}
                {status === "error" ? (
                  <div className="message message--error">
                    <div className="message-inner">
                      <div className="message-icon">
                        <img src="error-icn.svg" width="64px" alt="error" />
                      </div>
                      <div className="message-content">
                        <div className="message-title">Error</div>
                        <div className="message-text">
                          Whoops! It looks like your transaction is not vaild for ETH 2 Mainnet. Do not
                          broadcast the transaction and contact your staking provider.
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="col-right">
              <img className="section-image" src="developer@2x.png" alt="developer" width="440px" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
