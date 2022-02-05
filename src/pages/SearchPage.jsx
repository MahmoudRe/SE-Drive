import React, { useEffect, useState } from "react";
import { trapdoor, decrypt } from "searchable-encryption";
import SearchIcon from "../assets/search.png";
import NoResultsIllustration from "../assets/no-record.png";
import SearchIllustration from "../assets/search-illustration.png";
import Spinner from "../components/Spinner"
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
  const [loading, setLoading] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null); //for real-time search

  const search = async (query) => {
    setLoading(true);

    //if query consists of multiple keywords, the trapdoor is the hash for each keyword
    let hashedQuery = query.split(' ').map(async e => await trapdoor(e, props.user.keyObj))
    hashedQuery = (await Promise.all(hashedQuery)).join(' ')

    const { ipcRenderer } = window.require("electron");
    let encryptedSegments = await ipcRenderer
      .invoke("evaluate-transaction", ["search", hashedQuery])
      .catch((e) => {
        setResult([]);
        setLoading(false);
        return null;
      });

    if (!encryptedSegments) return;

    encryptedSegments = JSON.parse(new TextDecoder("utf-8").decode(encryptedSegments));

    let result = encryptedSegments.map(async (encryptedSegment) =>
      decrypt(encryptedSegment, props.user.keyObj)
    );

    result = await Promise.all(result);
    setResult(result);
    setLoading(false);
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
              setSearchKeyword(e.target.value);

              if (!e.target.value) {
                setResult([]);
                clearTimeout(timeoutId);
                setLoading(false);
                return;
              }

              setLoading(true);

              //real-time search with 1.5s delay
              clearTimeout(timeoutId);
              let timeoutIdLocal = setTimeout(() => {
                search(e.target.value);
              },  1500, [e.target.value])
              setTimeoutId(timeoutIdLocal)
            }}
          />
        </div>
      </div>
      <section
        className="search-results"
        style={{
          //if the content fits the view, skip adding marginBottom to prevent unnecessary scrollbar
          // marginBottom: document.body.scrollHeight > document.body.clientHeight ? "5rem" : "0", 
          position: "relative",
          minHeight: "80%"
        }}
      >
        {loading && <Spinner floating overlayColor="white" /> }
        {!!result.length && <h3> Results: </h3>}
        {!!result.length &&
          result.map((e, idx) => (
            <div
              className="result-segment"
              key={idx}
              dangerouslySetInnerHTML={{
                __html: e.replace(
                  new RegExp(keyword.split(' ').join('|'), "gi"),
                  '<span class="highlight"}>$&</span>' // $&: is the placeholder for the matched string
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
            {!!keyword && !loading ? (
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
