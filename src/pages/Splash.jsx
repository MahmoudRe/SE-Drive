import React, { useEffect } from "react";
import { ReactComponent as LeftArrowSVG } from "../assets/left-arrow.svg";
import AppIcon from "../assets/logo/icon.png";

function HomePage(props) {
  useEffect(() => {
    document.documentElement.style.setProperty("--color-primary", "#4345CF");
    document.documentElement.style.setProperty("--color-primary-light", "#4B4DE1");
    document.documentElement.style.setProperty("--color-primary-dark", "#282AC2");
    document.documentElement.style.setProperty("--color-primary-bg", "#F8F9FF");
    document.documentElement.style.setProperty("--color-primary-bg-tint", "#D8D9ED");
  }, []);

  return (
    <div
      className="App"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        placeItems: "center",
      }}
    >
      <header className="header" style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
        <img
          src={AppIcon}
          alt="search page"
          width={100}
          style={{ filter: "drop-shadow(0px 3px 5px rgba(0, 0, 0, .2))" }}
        />
        <h1 style={{ margin: 0 }}>
          Searchable <span className="--color-primary-txt"> Encrypted </span> Drive
        </h1>
      </header>
      <main
        style={{
          width: "82%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2rem",
        }}
      >
        <p style={{ fontSize: "2rem", textAlign: "justify" }}>
          SE Drive is an open-source platform that allows its users to store 
          their <span className="highlight">notes</span>, <span className="highlight">files</span> 
          , <span className="highlight">photos</span> securely and privately on public/private blockchains, 
          untrusted cloud services, or even on a local disk drive. 
          State-of-the-art <span className="highlight">index-based searchable encryption</span> technique is utilized to
          ensure every bit of users' data is encrypted the moment it's uploaded, then only the
          key-owners can search through this encrypted data without any compromises on security
          , <span className="highlight">privacy</span>, or efficiency. The system is designed such that
          any party, involved in the data storage, knows <span className="highlight">NOTHING</span>
          about the actual data or the search queries, e.g. peers on a blockchain network, those who
          execute the <span className="highlight">smart contract</span> of the search queries, or cloud
          service providers.
        </p>
        <p style={{ fontSize: "2rem", textAlign: "justify" }}>
          The current version of the application is optimized to work with <span className="highlight">Hyperledger Fabric</span> through 
          smart contract <span className="highlight">(Chaincode)</span>. However, the application can be adjusted
          easily to adopt different blockchain solutions or conventional cloud server.
        </p>
        <button className="next-button --hand" onClick={() => props.setPageCount(0)}>
          <span style={{ marginTop: "0.7rem" }}>Let's get started!</span>
          <LeftArrowSVG style={{ transform: "rotate(180deg)", width: 40 }} />
        </button>
      </main>
    </div>
  );
}

export default HomePage;
