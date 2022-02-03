import React, { useEffect } from "react";
import HomeIcon from "../assets/home.png";
import SearchIcon from "../assets/search.png";
import { ReactComponent as BookSVG } from "../assets/book.svg";
import "../libs/advance-file-input.css";

const styleCard = {
  width: "30rem",
  height: "15rem",
  padding: "3rem 5rem",
  backgroundColor: "var(--color-primary-bg)",
  border: "3px dashed var(--color-primary)",
  borderRadius: "10px",
  display: "flex",
  gap: "1.5rem",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "4.5rem",
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
  }, []);

  return (
    <main>
      <div className="sub-header" style={{ marginBottom: "2rem" }}>
        <img
          src={HomeIcon}
          alt="home page icon"
          width={35}
          style={{ margin: "auto", marginBottom: "15px" }}
        />
        <h2> Welcome Home! </h2>
      </div>
      <section className="either-area" style={{ alignItems: "center" }}>
        <button
          style={styleCard}
          onClick={() => {
            props.setPageCount(props.pageCount + 1);
          }}
        >
          <BookSVG width={60} />
          Store
        </button>
        <button
          style={styleCard}
          onClick={() => {
            props.setPageCount(props.pageCount + 2);
          }}
        >
          <img src={SearchIcon} alt="search page" width={65} />
          Search
        </button>
      </section>
    </main>
  );
}

export default HomePage;
