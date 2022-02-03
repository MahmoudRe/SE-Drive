import React, { useEffect, useState } from "react";
import { ReactComponent as NetworkSVG } from "../assets/network.svg";
import AdvanceFileInput from "../libs/advance-file-input.js";
import Spinner from "../components/Spinner";
import "../libs/advance-file-input.css";
import userEvent from "@testing-library/user-event";

function ConnectionPage(props) {
  const [data, setData] = useState("");
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty("--color-primary", "#009FDA");
    document.documentElement.style.setProperty("--color-primary-light", "#13b0e9");
    document.documentElement.style.setProperty("--color-primary-dark", "#2c8caf");
    document.documentElement.style.setProperty("--color-primary-bg", "#eff9ff");
    document.documentElement.style.setProperty("--color-primary-bg-tint", "#dbf0fd");

    new AdvanceFileInput({
      selector: "#connection-config",
      dragText: "Drag your network connection.json file",
      onFileAdded: (fileList) => {
        let file = fileList[0];
        let reader = new FileReader();
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

  useEffect(() => {
    if(data && !showSpinner) {
      props.nextBtn.setCallback(() => {
        setShowSpinner(true);
        setTimeout(async () => {
          const { ipcRenderer } = window.require("electron");
          await ipcRenderer.invoke("connect", data);
          setShowSpinner(false);
          props.setPageCount(props.pageCount + 1);
          props.nextBtn.setShow(false);
        }, 1400);
      })
      props.nextBtn.setShow(true);
    }
  }, [props, data, showSpinner]);

  return (
    <main>
      <div className="sub-header" style={{ marginBottom: "2rem" }}>
        <NetworkSVG />
        <h2> Connect to Fabric's network... </h2>
      </div>
      <section className="either-area">
        <button
          onClick={() =>
            alert(
              "Sorry, you can't use this feature currently. The app is in demo mode and isn't connected to a server!"
            )
          }
          style={{ placeSelf: "center" }}
        >
          Single Sign On for TU Delft
        </button>
        <p className="OR"> OR </p>
        <div style={{ position: "relative" }}>
          {showSpinner && <Spinner floating overlayColor={"white"} overlayOpacity={0.8} />}
          <div>
            <label className="label">Add Connection Profile</label>
            <input type="file" accept="application/json" name="connection" id="connection-config" />
            <p className="help-text">
              Connection profile is used to get access to the network;{" "}
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
        </div>
      </section>
    </main>
  );
}

export default ConnectionPage;
