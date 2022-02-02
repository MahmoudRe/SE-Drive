import React from "react";
import { ReactComponent as NetworkSVG } from "../assets/network.svg";

function ConnectionPage() {
  return (
    <main>
      <div className="sub-header">
        <NetworkSVG />
        <h2> Connect to Fabric's network... </h2>
      </div>
      <section class="either-area">
        <button
          onClick={() =>
            alert("Sorry, you can't use this feature currently. The app is in demo mode and isn't connected to a server!")
          }
        >
          One sign-in TU Delft
        </button>
        <p class="OR"> OR </p>
        <div>
          <div className="label">Connection.json</div>
          <div class="drag-drop-area">
            <div> Drop your network configuration file here </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ConnectionPage;
