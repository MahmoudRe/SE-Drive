import React, { useEffect, useState } from "react";
import { ReactComponent as IdCardSVG } from "../assets/id-card.svg";
import AdvanceFileInput from "../libs/advance-file-input.js";
import Spinner from "../components/Spinner";
import "../libs/advance-file-input.css";

function ConnectionPage() {
  const [data, setData] = useState("");
  const [showSpinner, setShowSpinner] = useState(false);

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

  return (
    <main>
      <div className="sub-header" style={{ marginBottom: "2rem" }}>
        <IdCardSVG />
        <h2> Create an account.. I mean a secret key! </h2>
      </div>
      <section className="either-area">
        <div>
          <div className="form-field" style={{ width: "30vw" }}>
            <label htmlFor="name">Your Name / Nick Name</label>
            <input type="text" name="name" id="name" />
          </div>
          <div className="form-field" style={{ width: "30vw" }}>
            <label htmlFor="name">Passphrase</label>
            <input type="text" name="name" id="name" />
          </div>
          <button onClick={() => alert("Your password is generaded")}>Generate Secret Key</button>
        </div>
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

export default ConnectionPage;
