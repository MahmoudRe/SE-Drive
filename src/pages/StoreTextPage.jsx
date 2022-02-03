import React, { useEffect, useRef } from "react";
import { encrypt, buildIndex } from 'searchable-encryption';
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

  const textarea = useRef(null);

  const store = async () => {
    const { ipcRenderer } = window.require('electron');
    let plainText = textarea.current.value;
    const data = {};

    //split textual contents to paragraphs (segments)
    let segments = plainText.split('\n\n');
    data.segments = segments.map(e => ({ pointer: crypto.randomUUID(), data: e }))

    //build index and encrypt segments
    data.indexTable = buildIndex(data.segments, props.user.keyObj);
    data.segments = data.segments.map(async ({pointer, data}) => ({pointer: pointer, data: await encrypt(data, props.user.keyObj)}))
    data.segments = await Promise.all(data.segments);
    data.indexTable = await data.indexTable;
    data.indexTable = Object.entries(data.indexTable).map(([key, value]) => ({ hash: key, pointers: value }))
    
    await ipcRenderer.invoke('submit-transaction', ['storeJSON', JSON.stringify(data.segments), JSON.stringify(data.indexTable)])
  }

  return (
    <main style={{position: "relative"}}>
      <div className="sub-header">
        <BookSVG width={30} />
        <h2> Store your private text securely... </h2>
      </div>
      <textarea
        style={{
          height: "75%",
          width: "100%",
          border: "2px solid var(--color-primary)",
          borderRadius: 7,
          fontSize: "1.8rem",
          fontFamily: "Roboto Condensed",
          padding: "1rem"
        }}
        ref={textarea}
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
        <button onClick={store} style={{ width: "20rem", height: "5rem" }}>Store to ledger</button>
      </div>
    </main>
  );
}

export default StoreTextPage;