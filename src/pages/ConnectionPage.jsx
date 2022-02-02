import React, { useEffect, useState } from "react";
import { ReactComponent as NetworkSVG } from "../assets/network.svg";
import AdvanceFileInput from "../libs/advance-file-input.js";
import "../libs/advance-file-input.css";

function ConnectionPage() {
  const [data, setData] = useState("");

  useEffect(() => {
    new AdvanceFileInput({
      selector: "#connection-config",
      onFileAdded: (fileList) => {
        let file = fileList[0];
        var reader = new FileReader();
        reader.onloadend = function (e) {
          setData(this.result)
        };
        reader.readAsText(file);
      },
      onFileRemoved: () => {
        setData('')
      }
    });
  }, []);

  return (
    <main>
      <div className="sub-header">
        <NetworkSVG />
        <h2> Connect to Fabric's network... </h2>
      </div>
      <section className="either-area">
        <button
          onClick={() => alert("Sorry, you can't use this feature currently. The app is in demo mode and isn't connected to a server!")}
        >
          One sign-in TU Delft
        </button>
        <p className="OR"> OR </p>
        <div style={{position: 'relative'}}>
          <div>
            <label className="label">Connection profile</label>
            <input type="file" accept="application/json" name="connection" id="connection-config" />
            <p className="help-text"> Connection profile is used to get access to the network; <a href="https://github.com/MahmoudRe/searchable-encryption" onClick={(e) => {
              e.preventDefault();
              const { shell } = window.require('electron');
              shell.openExternal(e.target.href);
            }}> learn more! </a></p>
          </div>
          {data && 
            <button 
              style={{position: 'absolute'}}
              onClick={() => {
                setTimeout(() => {
                  const { ipcRenderer } = window.require("electron");
                  ipcRenderer.invoke("connect", data);
                },400)
              }}>
              connect →
            </button>
          }
        </div>
      </section>
    </main>
  );
}

export default ConnectionPage;
