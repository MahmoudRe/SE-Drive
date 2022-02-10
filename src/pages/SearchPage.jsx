import React, { useEffect, useState } from "react";
import { trapdoor, decrypt } from "searchable-encryption";
import SearchIcon from "../assets/search.png";
import NoResultsIllustration from "../assets/no-record.png";
import SearchIllustration from "../assets/search-illustration.png";
import Spinner from "../components/Spinner";
import FileCard from "../components/FileCard";

function SearchPage(props) {
  useEffect(() => {
    document.documentElement.style.setProperty("--color-primary", "#4345CF");
    document.documentElement.style.setProperty("--color-primary-light", "#4B4DE1");
    document.documentElement.style.setProperty("--color-primary-dark", "#282AC2");
    document.documentElement.style.setProperty("--color-primary-bg", "#F8F9FF");
    document.documentElement.style.setProperty("--color-primary-bg-tint", "#D8D9ED");
  }, []);

  const [keyword, setSearchKeyword] = useState("");
  const [resultNotes, setResultNotes] = useState([]);
  const [resultFiles, setResultFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null); //for real-time search

  const search = async (queries) => {
    setLoading(true);

    let hashedQueries = queries
      .trim()
      .toUpperCase()
      .replace(/\"/g, "") //remove quotes as it's used to apply strict search filter on the results
      .split("|")
      .map(async (query) => {
        // for query consists of multiple keywords, the trapdoor is the hash for each keyword
        // intersection of the associated pointers is done by Chaincode transation
        let hashedQuery = query
          .trim()
          .split(" ")
          .map(async (e) => await trapdoor(e, props.user.keyObj));
        return (await Promise.all(hashedQuery)).join(" ");
      });

    let finalTrapdoor = (await Promise.all(hashedQueries)).join("|");

    const { ipcRenderer } = window.require("electron");
    let encryptedSegments = await ipcRenderer
      .invoke("evaluate-transaction", ["search", finalTrapdoor])
      .catch((e) => {
        setResultNotes([]);
        setLoading(false);
        return null;
      });

    if (!encryptedSegments) return;

    encryptedSegments = JSON.parse(new TextDecoder("utf-8").decode(encryptedSegments));

    let result = encryptedSegments.map(async (encryptedSegment) =>
      decrypt(encryptedSegment, props.user.keyObj)
    );

    result = await Promise.all(result);

    let textResult = [];
    let filesResult = [];

    for (let item of result) {
      try {
        let file = JSON.parse(item);
        filesResult.push(file);
      } catch (err) {
        textResult.push(item);
      }
    }

    setResultFiles(filesResult);
    setResultNotes(textResult);
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
                setResultNotes([]);
                setResultFiles([]);
                clearTimeout(timeoutId);
                setLoading(false);
                return;
              }

              setLoading(true);

              //real-time search with 1.5s delay
              clearTimeout(timeoutId);
              let timeoutIdLocal = setTimeout(() => search(e.target.value), 1500, [e.target.value]);
              setTimeoutId(timeoutIdLocal);
            }}
          />
        </div>
        <div className="tooltip">
          i
          <span className="tooltiptext">
            This search results in all the segments and files that include all the words of the
            search query. For advance searching, you can use:
            <li>Pipe character "|" as an "OR" operator</li>
            <li>Quotes to define strict searching</li>
          </span>
        </div>
      </div>
      <section
        className="search-results"
        style={{
          //if the content fits the view, skip adding marginBottom to prevent unnecessary scrollbar
          // marginBottom: document.body.scrollHeight > document.body.clientHeight ? "5rem" : "0",
          position: "relative",
          minHeight: "80%",
        }}
      >
        {loading && <Spinner floating overlayColor="white" />}

        {!!resultFiles.length && <h3> Files: </h3>}
        {!!resultFiles.length &&
          resultFiles.map((file, idx) => <FileCard key={idx} file={file} user={props.user} />)}

        {!!resultNotes.length && <h3> Notes: </h3>}
        {!!resultNotes.length &&
          resultNotes.map((e, idx) => {
            let regex = new RegExp(
              "(?<=[\r\n\t ])(" + //don't match partial words (lookbehind to check if it's the start of the word)
                keyword
                  .trim()
                  .split("|")
                  .map((w) => w.trim())
                  .join("|")
                  .split(/ (?![^"]*")/g) //split by white-spaces outside string quotes
                  .map((w) => w.replace(/"/g, "").replace(/ /g, "[\r\n\t ]*").trim())
                  .join("|") +
                ")(?=[\r\n\t ])", //don't match partial words (lookahead to check if it's the end of the word)
              "gi"
            );

            if(e.match(regex))
              return (
                <div
                  className="result-segment"
                  key={idx}
                  dangerouslySetInnerHTML={{
                    __html: e
                      .replace(regex, '<span class="highlight"}>$&</span>') // $&: is the placeholder for the matched string
                      .replace(/[\r\n]/g, "<br/>"),
                  }}
                />
            );
          })}

        {!resultNotes.length && !resultFiles.length && (
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
