import React, { useEffect, useState } from "react";
import { trapdoor, decrypt } from "searchable-encryption";
import SearchIcon from "../assets/search.png";
import NoResultsIllustration from "../assets/no-record.png";
import SearchIllustration from "../assets/search-illustration.png";
import "../libs/advance-file-input.css";

function SearchPage(props) {
  useEffect(() => {
    document.documentElement.style.setProperty("--color-primary", "#4345CF");
    document.documentElement.style.setProperty("--color-primary-light", "#4B4DE1");
    document.documentElement.style.setProperty("--color-primary-dark", "#282AC2");
    document.documentElement.style.setProperty("--color-primary-bg", "#F8F9FF");
    document.documentElement.style.setProperty("--color-primary-bg-tint", "#D8D9ED");
  }, []);

  const [keyword, setSearchKeyword] = useState("");
  const [result, setResult] = useState([]);

  const search = async (e) => {
    const { ipcRenderer } = window.require("electron");
    let encryptedSegments = await ipcRenderer
      .invoke("evaluate-transaction", ["search", await trapdoor(keyword, props.user.keyObj)])
      .catch((e) => {
        setResult([]);
        return null;
      });

    if (!encryptedSegments) return;

    encryptedSegments = JSON.parse(new TextDecoder("utf-8").decode(encryptedSegments));

    let result = encryptedSegments.map(async (encryptedSegment) =>
      decrypt(encryptedSegment, props.user.keyObj)
    );

    Promise.all(result).then((e) => {
      setResult(e);
    });
  };

  return (
    <main style={{ position: "relative" }}>
      <div className="sub-header" style={{ width: "100%", marginTop: "2rem" }}>
        <div style={{ position: "relative" }}>
          <img
            src={SearchIcon}
            alt="search term"
            width={30}
            style={{ position: "absolute", top: "1.2rem", left: "1rem" }}
          />
          <input
            type="text"
            name="search"
            style={{
              height: "3.5rem",
              fontSize: "2.5rem",
              width: "50vw",
              paddingLeft: "5rem",
              backgroundColor: "var(--color-primary-bg)",
            }}
            value={keyword}
            onChange={(e) => {
              if (!e.target.value) setResult([]);
              setSearchKeyword(e.target.value);
            }}
            onClick={search}
          />
        </div>
      </div>
      <section
        className="search-results"
        // style={{
        //   //if the content fits the view, skip adding marginBottom to prevent unnecessary scrollbar
        //   marginBottom: document.body.scrollHeight > document.body.clientHeight ? "5rem" : "0", 
        // }}
      >
        {!!result.length && <h3> Results: </h3>}
        {!!result.length &&
          result.map((e, idx) => (
            <div
              className="result-segment"
              key={idx}
              dangerouslySetInnerHTML={{
                __html: e.replace(
                  new RegExp(keyword, "gi"),
                  `<span class="highlight"}>${keyword}</span>`
                ),
              }}
            />
          ))}
        {!result.length && (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "grid",
              placeItems: "center",
              marginTop: "5rem",
              gap: "2rem",
            }}
          >
            {!!keyword ? (
              <>
                <img src={NoResultsIllustration} alt="no results found!" width="250" />
                <p style={{ opacity: ".4", fontSize: "1.8rem" }}>
                  Sorry, no results found for your query!
                </p>
              </>
            ) : (
              <img
                src={SearchIllustration}
                alt="no results found!"
                width="350"
                style={{ opacity: ".6" }}
              />
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default SearchPage;
