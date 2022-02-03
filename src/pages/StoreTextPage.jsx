import React, { useEffect } from "react";
import HomeIcon from "../assets/home.png";
import SearchIcon from "../assets/search.png";
import { ReactComponent as BookSVG } from "../assets/book.svg";
import "../libs/advance-file-input.css";

function StoreTextPage(props) {
  useEffect(() => {
    document.documentElement.style.setProperty("--color-primary", "#DF2549");
    document.documentElement.style.setProperty("--color-primary-light", "#FF1D48");
    document.documentElement.style.setProperty("--color-primary-dark", "#E1464C");
    document.documentElement.style.setProperty("--color-primary-bg", "#FFDCE3");
    document.documentElement.style.setProperty("--color-primary-bg-tint", "#FFC3CF");
  }, []);

  return (
    <main style={{position: "relative"}}>
      <div className="sub-header">
        <BookSVG width={30} />
        <h2> Store your private text securely... </h2>
      </div>
      <textarea
        style={{
          height: "80%",
          width: "100%",
          border: "2px solid var(--color-primary)",
          borderRadius: 7,
          fontSize: "1.8rem",
          fontFamily: "Roboto Condensed",
          padding: "1rem"
        }}
      />
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          marginTop: "1rem",
          gap: "2rem",
          position: "absolute",
        }}
      >
        <div className="tooltip"> i
          <span className="tooltiptext">
            To enable searching on encrypted (very long) text, it should be first divided into chunks or
            segments; the smaller the chunks, the accuracy of the search increases later on. Here the
            text is segmented per paragraph.
          </span>
        </div>
        <button onClick={() => {}} style={{ width: "20rem", height: "5rem" }}>Store to ledger</button>
      </div>
    </main>
  );
}

export default StoreTextPage;
