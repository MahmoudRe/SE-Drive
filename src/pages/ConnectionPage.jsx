import React, { useEffect, useState, useRef } from "react";
import { ReactComponent as NetworkSVG } from "../assets/network.svg";
import AdvanceFileInput from "../libs/advance-file-input.js";
import Spinner from "../components/Spinner";
import Link from "../components/Link";
import { readFile } from "../libs/utils";

function ConnectionPage(props) {
  const [data, setData] = useState("");
  const [showSpinner, setShowSpinner] = useState(false);
  const channelNameInput = useRef(null);
  const chaincodeNameInput = useRef(null);

  useEffect(() => {
    props.nextBtn.setShow(false);
    document.documentElement.style.setProperty("--color-primary", "#009FDA");
    document.documentElement.style.setProperty("--color-primary-light", "#13b0e9");
    document.documentElement.style.setProperty("--color-primary-dark", "#2c8caf");
    document.documentElement.style.setProperty("--color-primary-bg", "#eff9ff");
    document.documentElement.style.setProperty("--color-primary-bg-tint", "#dbf0fd");

    new AdvanceFileInput({
      selector: "#connection-config",
      dragText: "Drag your network connection.json file",
      onFileAdded: async (fileList) => {
        let file = fileList[0];
        let res = await readFile(file);
        setData(res);
      },
      onFileRemoved: () => {
        setData("");
        props.nextBtn.setShow(false);
      },
    });
  }, []);

  useEffect(() => {
    if (data && !showSpinner) {
      const cb = () => {
        setShowSpinner(true);
        setTimeout(async () => {
          let option = {
            chaincodeName: chaincodeNameInput.current.value || undefined,
            channelName: channelNameInput.current.value || undefined,
          };
          const { ipcRenderer } = window.require("electron");
          ipcRenderer
            .invoke("connect", [data, option])
            .then(() => {
              props.nextBtn.setShow(false);
              props.setPageCount(props.pageCount + 1);
            })
            .catch((e) => {
              let errorEl = Array.from(
                document.querySelectorAll(".advance-file-input + .error")
              ).pop();
              let helpEl = Array.from(
                document.querySelectorAll(".advance-file-input + .error + .help-text")
              ).pop();
              errorEl.textContent = "There is an issue occurred; please try again! " + e;
              errorEl.classList.remove("hide");
              errorEl.style.display = "block";
              helpEl.style.display = "none";
              setShowSpinner(false);
            });

          setShowSpinner(false);
        }, 1400);
      };
      props.nextBtn.setCallback(() => cb);
      props.nextBtn.setShow(true);
    }
  }, [data, showSpinner]);

  return (
    <main>
      <div className="sub-header" style={{ marginBottom: "2rem" }}>
        <NetworkSVG />
        <h2> Connect to Fabric's network... </h2>
      </div>
      <section className="either-area">
        <div style={{ position: "relative" }}>
          {showSpinner && <Spinner floating overlayColor={"white"} overlayOpacity={0.8} />}
          <form id="register-user" style={{ position: "relative" }}>
            <div className="form-field" style={{ width: "36vw" }}>
              <label htmlFor="channelName">Channel Name</label>
              <input
                type="text"
                name="channelName"
                id="channelName"
                placeholder="mychannel"
                ref={channelNameInput}
                required
              />
              <p style={{ width: "100%", marginBottom: 0 }}></p>
            </div>
            <div className="form-field" style={{ width: "36vw" }}>
              <label htmlFor="chaincodeName">Chaincode Name</label>
              <input
                type="text"
                name="chaincodeName"
                id="chaincodeName"
                placeholder="sse-chaincode"
                ref={chaincodeNameInput}
                required
              />
              <p style={{ width: "100%", marginBottom: 0 }}></p>
            </div>
          </form>
          <div>
            <label className="label">Add Connection Profile</label>
            <input type="file" accept="application/json" name="connection" id="connection-config" />
            <p className="help-text">
              Connection profile is used to get access to the network; &nbsp;
              <Link href="https://github.com/MahmoudRe/searchable-encryption">learn more!</Link>
            </p>
          </div>
        </div>
        <p className="OR"> OR </p>
        <button
          onClick={() =>
            alert(
              "Sorry, you can't use this feature currently. The app is in demo mode and isn't connected to a server!"
            )
          }
          style={{ placeSelf: "center" }}
        >
          Single Sign On OAuth 2
        </button>
      </section>
    </main>
  );
}

export default ConnectionPage;
