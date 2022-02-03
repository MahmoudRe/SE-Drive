import React, { useState } from "react";
import ConnectionPage from "./pages/ConnectionPage";
import RegistrationPage from "./pages/RegistrationPage";
import { ReactComponent as LeftArrowSVG } from "./assets/left-arrow.svg";
import "./App.css";

function App() {
  const [name, setName] = useState("");
  const [keyObj, setKeyObj] = useState(null);
  const user = { name, setName, keyObj, setKeyObj };

  const [show, setShow] = useState(false);
  const [callback, setCallback] = useState(() => {});
  const nextBtn = {
    show,
    setShow,
    callback,
    setCallback,
  };

  const [pageCount, setPageCount] = useState(0);

  const props = { user, pageCount, setPageCount, nextBtn }
  const pages = [
    <ConnectionPage {...props} />,
    <RegistrationPage {...props} />,
  ];

  return (
    <div className="App">
      <header className="header">
        <h1>
          Searchable <span className="--color-primary-txt"> Encryption </span> Chaincode
        </h1>
      </header>
      {pages[pageCount % pages.length]}
      <footer
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {pageCount > 0 ? (
          <button className="back-button --hand" onClick={() => setPageCount(pageCount - 1)}>
            <LeftArrowSVG /> <span style={{ marginTop: "0.7rem" }}>Back</span>
          </button>
        ) : (
          <div></div>
        )}
        {nextBtn.show && (
          <button
            className="next-button --hand"
            onClick={() => nextBtn.callback()}
          >
            <span style={{ marginTop: "0.7rem" }}>Proceed</span>
            <LeftArrowSVG style={{ transform: "rotate(180deg)" }} />
          </button>
        )}
      </footer>
    </div>
  );
}

export default App;
