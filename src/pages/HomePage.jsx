import React, { useEffect } from "react";
import HomeIcon from "../assets/home.png";
import SearchIcon from "../assets/search.png";
import { exportSecretKey } from "searchable-encryption";
import { ReactComponent as BookSVG } from "../assets/book.svg";
import { ReactComponent as KeySVG } from "../assets/key.svg";
import { ReactComponent as LogoutSVG } from "../assets/logout.svg";
import "../libs/advance-file-input.css";

const styleCard = {
  width: "27.25rem",
  height: "13rem",
  padding: "2rem 3rem",
  backgroundColor: "var(--color-primary-bg)",
  border: "3px solid var(--color-primary)",
  borderRadius: "10px",
  display: "flex",
  gap: "1.5rem",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "3.5rem",
  fontWeight: "bold",
  color: "black",
};

function HomePage(props) {
  useEffect(() => {
    document.documentElement.style.setProperty("--color-primary", "#EA8341");
    document.documentElement.style.setProperty("--color-primary-light", "#F0A513");
    document.documentElement.style.setProperty("--color-primary-dark", "#E1464C");
    document.documentElement.style.setProperty("--color-primary-bg", "#FFFBF3");
    document.documentElement.style.setProperty("--color-primary-bg-tint", "#F8EBC3");

    props.nextBtn.setShow(false); // [TEMP FIX] this is done in the previous page, but currently it does't work.
  }, []);

  return (
    <main>
      <LogoutSVG
        width={60}
        style={{ position: "absolute", top: "calc(4vh + 3rem)", right: "4%" }}
        className="back-home"
        onClick={async () => {
          //remove user data
          const { ipcRenderer } = window.require("electron");
          await ipcRenderer.invoke("logout");
          props.setKeyObj(null);
          props.setPageCount(0);
        }}
      />
      <div className="sub-header" style={{ marginBottom: "2rem" }}>
        <img
          src={HomeIcon}
          alt="home page icon"
          width={35}
          style={{ margin: "auto", marginBottom: "15px" }}
        />
        <h2> Welcome Home{props.user.name ? "," + props.user.name : ""}! </h2>
      </div>
      <section style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        <button
          style={{ ...styleCard, backgroundColor: "#FFDCE3", border: "3px solid #DF2549" }}
          onClick={() => {
            props.setPageCount(props.pageCount + 1);
          }}
        >
          <BookSVG width={60} />
          Store
        </button>
        <button
          style={{ ...styleCard, backgroundColor: "#D8D9ED", border: "3px solid #4345CF" }}
          onClick={() => {
            props.setPageCount(props.pageCount + 2);
          }}
        >
          <img src={SearchIcon} alt="search page" width={65} />
          Search
        </button>
        <button
          style={{
            ...styleCard,
            backgroundColor: "#FFF7E4",
            border: "3px solid #E8BB1A",
            lineHeight: 1,
          }}
          onClick={async () => {
            let exportedKey = await exportSecretKey(props.user.keyObj);

            function download(content, fileName, contentType) {
              let a = document.createElement("a");
              let file = new Blob([content], { type: contentType });
              a.href = URL.createObjectURL(file);
              a.download = fileName;
              a.click();
            }
            download(JSON.stringify(exportedKey), "key.json", "json/application");
          }}
        >
          <KeySVG width={60} />
          Export key
        </button>
      </section>
    </main>
  );
}

export default HomePage;
