import React, { useEffect, useState } from "react";
import { trapdoor, decrypt } from "searchable-encryption";
import SearchIcon from "../assets/search.png";
import "../libs/advance-file-input.css";

function SearchPage(props) {
  useEffect(() => {
    document.documentElement.style.setProperty("--color-primary", "#4345CF");
    document.documentElement.style.setProperty("--color-primary-light", "#4B4DE1");
    document.documentElement.style.setProperty("--color-primary-dark", "#282AC2");
    document.documentElement.style.setProperty("--color-primary-bg", "#F8F9FF");
    document.documentElement.style.setProperty("--color-primary-bg-tint", "#D8D9ED");
  }, []);

  const [result, setResult] = useState("");

  const search = async (e) => {
    const { ipcRenderer } = window.require("electron");
    let pointers = await ipcRenderer.invoke("evaluate-transaction", [
      "search",
      await trapdoor(e.target.value, props.user.keyObj),
    ]);
    pointers = JSON.parse(new TextDecoder("utf-8").decode(pointers));

    let result = pointers.map(async (pointer) => {
      const encryptedSegment = await ipcRenderer.invoke("evaluate-transaction", ["read", pointer]); // ArrayBuffer object
      const decodedSegment = new TextDecoder("utf-8").decode(encryptedSegment);
      console.log(props.user.keyObj);
      return decrypt(decodedSegment, props.user.keyObj);
    });

    Promise.all(result).then((e) => setResult(e.reduce((prev, curr) => prev + " - " + curr)));
  };

  return (
    <main style={{ position: "relative", display: "grid", justifyContent: "center" }}>
      <div
        className="sub-header"
        style={{ position: "relative", width: "100%", marginTop: "2rem" }}
      >
        <img
          src={SearchIcon}
          alt="search term"
          width={30}
          style={{ position: "absolute", top: "1.2rem", left: "1rem" }}
        />
        <input
          type="text"
          name="search"
          style={{ height: "3.5rem", fontSize: "2.5rem", width: "50vw", paddingLeft: "5rem" }}
          onClick={search}
        />
      </div>
      <section>
        {result}
      </section>
    </main>
  );
}

export default SearchPage;
