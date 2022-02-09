import React, { useEffect, useState } from "react";
import { encrypt, buildIndex } from "searchable-encryption";
import Spinner from "../components/Spinner";
import { ReactComponent as FilesDirSVG } from "../assets/files-dir.svg";
import AdvanceFileInput from "../libs/advance-file-input.js";

function NotesPage(props) {
  useEffect(() => {
    document.documentElement.style.setProperty("--color-primary", "#0FD15C");
    document.documentElement.style.setProperty("--color-primary-light", "#2CE174");
    document.documentElement.style.setProperty("--color-primary-dark", "#17B254");
    document.documentElement.style.setProperty("--color-primary-bg", "#E4FDEF");
    document.documentElement.style.setProperty("--color-primary-bg-tint", "#D3F8E3");
  }, []);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [advanceFileInput, setAdvanceFileInput] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setAdvanceFileInput(
      new AdvanceFileInput({
        selector: "input#files",
        withLabel: false,
        withKeywordsField: true,
        dragText: "Drag one or many files here",
        maxFileSize: 6e10, //60 GB
      })
    );
  }, []);

  const store = async () => {
    setLoading(true);
    const { ipcRenderer } = window.require("electron");
    let keywordsExtractor = {};
    let data = {};
    data.segments = [];

    for (let { file, keywords } of advanceFileInput.getData()) {
      let encryptedFile = await crypto.subtle.encrypt(
        { name: "AES-CBC", iv: props.user.keyObj.iv },
        props.user.keyObj.key,
        await file.arrayBuffer()
      );

      const ipfsFile = await ipcRenderer.invoke("upload-ipfs", encryptedFile).catch((e) => {
        alert("There is an issue occurred! " + e.message);
        setLoading(false);
      });

      let segmentData = JSON.stringify({
        segType: "ipfsFile",
        type: file.type,
        path: ipfsFile.path,
        size: file.size,
        name: file.name,
      });
      
      data.segments.push({ pointer: crypto.randomUUID(), data: segmentData });
      keywordsExtractor = { ...keywordsExtractor, [segmentData]: keywords.split(", ") };
    }

    data.indexTable = buildIndex(data.segments, props.user.keyObj, (e) => keywordsExtractor[e]);
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

    if (!data.segments.length) {
      setLoading(false);
      alert("No files are founds; please select or drop some files first!");
      return;
    }

    await ipcRenderer
      .invoke("submit-transaction", [
        "storeJSON",
        JSON.stringify(data.segments),
        JSON.stringify(data.indexTable),
      ])
      .then(() => {
        advanceFileInput.removeAll();
        setSuccess(true);
        setTimeout(() => {
          setLoading(false);
          setSuccess(false);
        }, 2500);
      })
      .catch((e) => {
        setLoading(false);
        setError(e.message);
      });
  };

  return (
    <main className="files-page" style={{ position: "relative" }}>
      <div className="sub-header">
        <FilesDirSVG width={30} />
        <h2> Upload your files </h2>
      </div>
      <input type="file" id="files" multiple />
      {loading && <Spinner floating done={success} />}
      <div
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "auto min-content min-content",
          alignItems: "center",
          marginTop: "1rem",
          gap: "2rem",
          bottom: 0,
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
          i
          <span className="tooltiptext --gray">
            The provided keywords next to each file will be used to identify this file when
            searching for one of the given keywords. It is a comma separated keywords, and the
            auto-filled value are extracted from file name, so feel free to edit them.
          </span>
        </div>
        <button onClick={store} style={{ width: "35rem", height: "5rem" }} disabled={loading}>
          Upload to IPFS and Store to ledger
        </button>
      </div>
    </main>
  );
}

export default NotesPage;
