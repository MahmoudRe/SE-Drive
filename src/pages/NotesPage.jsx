import React, { useEffect, useRef, useState } from "react";
import { encrypt, buildIndex } from "searchable-encryption";
import Spinner from "../components/Spinner";
import { ReactComponent as BookSVG } from "../assets/book.svg";
import DragDropArea from "../libs/drag-drop-area.js";
import { formatText } from "../libs/utils";

function NotesPage(props) {
  useEffect(() => {
    document.documentElement.style.setProperty("--color-primary", "#DF2549");
    document.documentElement.style.setProperty("--color-primary-light", "#FF1D48");
    document.documentElement.style.setProperty("--color-primary-dark", "#E1464C");
    document.documentElement.style.setProperty("--color-primary-bg", "#FFDCE3");
    document.documentElement.style.setProperty("--color-primary-bg-tint", "#FFC3CF");
  }, []);

  const textarea = useRef(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (props.textareaValue) {
      textarea.current.value = props.textareaValue;
      props.setNextPageProps({});
    }

    DragDropArea(textarea.current, async (fileList) => {
      const { ipcRenderer } = window.require("electron");
      let [result, error] = await ipcRenderer.invoke("get-text", await fileList[0].path);
      if (error) {
        setError(error.message);
        return;
      }

      if (
        [
          "application/msword",
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(fileList[0].type)
      )
        result = formatText(result);

      textarea.current.value = result;
    });
  }, []);

  const store = async () => {
    setLoading(true);

    const { ipcRenderer } = window.require("electron");
    let plainText = textarea.current.value;
    const data = {};

    if (!plainText) {
      setLoading(false);
      alert("Can't store empty data; please write something first!");
      return;
    }

    //split textual contents to paragraphs (segments)
    let segments = plainText.split("\n\n");
    data.segments = segments.map((e) => ({ pointer: crypto.randomUUID(), data: e }));

    //build index and encrypt segments
    data.indexTable = buildIndex(data.segments, props.user.keyObj, (e) => {
      let formatted = e
        .replace(/[^A-Za-z0-9_’'\n\r ]/g, "") //remove any symbol or punctuation attached to strings
        .split(/[\r\n ]/g)
        .map((w) => w.toUpperCase());

      return new Set(formatted);
    });

    data.segments = data.segments.map(async ({ pointer, data }) => ({
      pointer: pointer,
      data: await encrypt(data, props.user.keyObj),
    }));

    data.segments = await Promise.all(data.segments);
    data.indexTable = await data.indexTable;
    data.indexTable = Object.entries(data.indexTable).map(([key, value]) => ({
      hash: key,
      pointers: value,
    }));

    await ipcRenderer
      .invoke("submit-transaction", [
        "storeJSON",
        JSON.stringify(data.segments),
        JSON.stringify(data.indexTable),
      ])
      .then(() => {
        textarea.current.value = "";
        setSuccess(true);
        setTimeout(() => {
          setLoading(false);
          setSuccess(false);
        }, 2500);
      })
      .catch((e) => {
        setLoading(false);
        alert("Something went wrong: ", e);
      });
  };

  return (
    <main style={{ position: "relative" }}>
      <div className="sub-header">
        <BookSVG width={30} />
        <h2> Store your private text securely </h2>
      </div>
      <textarea
        style={{
          height: "75%",
          width: "100%",
          border: "2px solid var(--color-primary)",
          borderRadius: 7,
          fontSize: "1.8rem",
          fontFamily: "Roboto Condensed",
          padding: "1rem",
        }}
        placeholder="Start typing here... Or drop your file here... accepted files: [PDF, DOC, DOCX, DOT, TXT, CSV, XLS, XLSX]"
        ref={textarea}
        disabled={loading}
      />
      {loading && <Spinner floating done={success} />}
      <div
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "auto min-content min-content",
          alignItems: "center",
          marginTop: "1rem",
          gap: "2rem",
          position: "absolute",
        }}
      >
        <p
          className="error"
          style={{
            alignSelf: "flex-start",
          }}
        >
          {props.error || error}
        </p>
        <div className="tooltip">
          {" "}
          i
          <span className="tooltiptext">
            To enable searching on encrypted (very long) text, it should be first divided into
            chunks or segments; the smaller the chunks, the accuracy of the search increases. Here
            the text is segmented per paragraph, where paragraphs are separated by empty line.
          </span>
        </div>
        <button onClick={store} style={{ width: "20rem", height: "5rem" }} disabled={loading}>
          Store to ledger
        </button>
      </div>
    </main>
  );
}

export default NotesPage;
