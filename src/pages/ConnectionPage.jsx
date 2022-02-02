import React, { useEffect, useState } from "react";
import { ReactComponent as NetworkSVG } from "../assets/network.svg";
import AdvanceFileInput from "../libs/advance-file-input.js";
import Spinner from "../components/Spinner";
import "../libs/advance-file-input.css";

function ConnectionPage() {
  const [data, setData] = useState("");
  const [showSpinner, setShowSpinner] = useState(false);

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
      <div className="sub-header" style={{marginBottom: '2rem'}}>
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
          {showSpinner && <Spinner floating overlayColor={'white'} overlayOpacity={.8}/>}
          <div>
            <label className="label">Connection profile</label>
            <input type="file" accept="application/json" name="connection" id="connection-config" />
            <p className="help-text"> Connection profile is used to get access to the network; <a href="https://github.com/MahmoudRe/searchable-encryption" onClick={(e) => {
              e.preventDefault();
              const { shell } = window.require('electron');
              shell.openExternal(e.target.href);
            }}> learn more! </a></p>
          </div>
          {data && !showSpinner && 
            <button 
              style={{position: 'absolute'}}
              onClick={() => {
                setShowSpinner(true)
                setTimeout(async () => {
                  const { ipcRenderer } = window.require("electron");
                  await ipcRenderer.invoke("connect", data);
                  setShowSpinner(false)
                }, 1400)
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