import React, { useEffect, useState } from "react";
import { genSecretKey } from "searchable-encryption";
import { ReactComponent as IdCardSVG } from "../assets/id-card.svg";
import AdvanceFileInput from "../libs/advance-file-input.js";
import Spinner from "../components/Spinner";
import "../libs/advance-file-input.css";

function RegistrationPage(props) {
  const [data, setData] = useState("");
  const [showSpinner, setShowSpinner] = useState(false);
  const [showSpinnerGen, setShowSpinnerGen] = useState(false);
  const [passphrase, setPassphrase] = useState(undefined);

  useEffect(() => {
    document.documentElement.style.setProperty("--color-primary", "#83BDBD");
    document.documentElement.style.setProperty("--color-primary-light", "#83BDBD");
    document.documentElement.style.setProperty("--color-primary-dark", "#83BDBD");
    document.documentElement.style.setProperty("--color-primary-bg", "#e1f3f3");
    document.documentElement.style.setProperty("--color-primary-bg-tint", "#cfe9e9");

    new AdvanceFileInput({
      selector: "#connection-config",
      dragText: "Drag your key file here",
      onFileAdded: (fileList) => {
        let file = fileList[0];
        var reader = new FileReader();
        reader.onloadend = function (e) {
          setData(this.result);
        };
        reader.readAsText(file);
      },
      onFileRemoved: () => {
        setData("");
      },
    });
  }, []);

  const onSubmitGenKey = (e) => {
    e.preventDefault()
    setShowSpinnerGen(true)
    setTimeout(async () => {
      const keyObj = await genSecretKey(passphrase);
      props.user.setKeyObj(keyObj);
      props.setPageCount(props.pageCount + 1);
      setShowSpinnerGen(false);
    }, 1400)
  }

  return (
    <main>
      <div className="sub-header" style={{ marginBottom: "2rem" }}>
        <IdCardSVG />
        <h2> Generate an account.. I mean a secret key! </h2>
      </div>
      <section className="either-area">
        <form id="generate-key" style={{ position: "relative" }} onSubmit={onSubmitGenKey}>
          {showSpinnerGen && <Spinner floating overlayColor={"white"} overlayOpacity={0.8} />}
          <div className="form-field" style={{ width: "36vw" }}>
            <label htmlFor="name">Your Name / Nick Name</label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="What should we call you?"
              value={props.user.name}
              onChange={(e) => props.user.setName(e.target.value)}
              required
            />
          </div>
          <div className="form-field" style={{ width: "36vw" }}>
            <label htmlFor="passphrase">Passphrase</label>
            <input
              type="text"
              name="name"
              id="passphrase"
              placeholder="Just type some random thoughts!  ^_^"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              required
            />
            <p style={{ width: "100%", marginBottom: 0, textAlign: "justify" }}>
              The passphrase will be used in contracting your secret key, but it isn't only depends
              on it, hence same passphrase won't generate the same key! Please preserve your key
              securely for later use!
            </p>
          </div>
          <button roll="submit" form="generate-key">
            Generate Secret Key
          </button>
        </form>
        <p className="OR"> OR </p>
        <div style={{ position: "relative" }}>
          {showSpinner && <Spinner floating overlayColor={"white"} overlayOpacity={0.8} />}
          <div>
            <label className="label">Are you a registered user? Add your Secret Key</label>
            <input type="file" accept="application/json" name="connection" id="connection-config" />
            <p className="help-text">
              Your secret key is kept locally and used for encryption; &nbsp;
              <a
                href="https://github.com/MahmoudRe/searchable-encryption"
                onClick={(e) => {
                  e.preventDefault();
                  const { shell } = window.require("electron");
                  shell.openExternal(e.target.href);
                }}
              >
                learn more!
              </a>
            </p>
          </div>
          {data && !showSpinner && (
            <button
              style={{ position: "absolute" }}
              onClick={() => {
                setShowSpinner(true);
                setTimeout(async () => {
                  const { ipcRenderer } = window.require("electron");
                  await ipcRenderer.invoke("connect", data);
                  setShowSpinner(false);
                }, 1400);
              }}
            >
              Proceed →
            </button>
          )}
        </div>
      </section>
    </main>
  );
}

export default RegistrationPage;
