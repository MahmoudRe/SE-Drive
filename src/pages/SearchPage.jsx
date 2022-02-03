import React, { useEffect } from "react";
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

  return (
    <main style={{ position: "relative", display: 'grid', justifyContent: "center" }}>
      <div className="sub-header" style={{ position: "relative", width: "100%", marginTop: '2rem' }}>
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
        />
      </div>
    </main>
  );
}

export default SearchPage;
