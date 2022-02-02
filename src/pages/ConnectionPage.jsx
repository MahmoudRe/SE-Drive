import React, { useEffect } from "react";
import { ReactComponent as NetworkSVG } from "../assets/network.svg";
import AdvanceFileInput from '../libs/advance-file-input.js';
import '../libs/advance-file-input.css';

function ConnectionPage() {

  useEffect(() => {
    new AdvanceFileInput({selector: "#connection-config", onFileAdded: console.log})
  }, [])

  return (
    <main>
      <div className="sub-header">
        <NetworkSVG />
        <h2> Connect to Fabric's network... </h2>
      </div>
      <section className="either-area">
        <button
          onClick={() =>
            alert("Sorry, you can't use this feature currently. The app is in demo mode and isn't connected to a server!")
          }
        >
          One sign-in TU Delft
        </button>
        <p className="OR"> OR </p>
        <div>
          <label className="label">Connection.json</label>
          <input type="file" accept="application/json" name="connection" id="connection-config"/>
        </div>
      </section>
    </main>
  );
}

export default ConnectionPage;
