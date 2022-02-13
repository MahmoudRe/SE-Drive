import React, { useEffect, useState } from "react";
import SettingIcon from "../assets/setting.png";
import Spinner from "../components/Spinner";
import Link from "../components/Link";
import AdvanceFileInput from "../libs/advance-file-input";
import { readFile } from "../libs/utils";

function HomePage(props) {
  const [showSpinner, setShowSpinner] = useState(false);
  const [keyObjRaw, setKeyObjRaw] = useState("");

  useEffect(() => {
    props.nextBtn.setShow(false);
    document.documentElement.style.setProperty("--color-primary", "#FABB54");
    document.documentElement.style.setProperty("--color-primary-light", "#F0A513");
    document.documentElement.style.setProperty("--color-primary-dark", "#E1464C");
    document.documentElement.style.setProperty("--color-primary-bg", "#FFFBF3");
    document.documentElement.style.setProperty("--color-primary-bg-tint", "#FFEDE2");

    new AdvanceFileInput({
      selector: "#key-object-file",
      dragText: "Drag your key file here",
      beforeFileAdded: async (fileList) => {
        let file = fileList[0];
        return readFile(file)
          .then((res) => {
            try {
              setKeyObjRaw(JSON.parse(res));
              return true;
            } catch (err) {
              alert("The selected file isn't a valid key: \n" + err.message);
              return false;
            }
          })
          .catch((err) => {
            alert("There is an issue while reading the file: \n" + err.message);
            return false;
          });
      },
      onFileRemoved: () => {
        setKeyObjRaw("");
      },
    });
  }, []);

  return (
    <main>
      <div className="sub-header" style={{ marginBottom: "2rem" }}>
        <img
          src={SettingIcon}
          alt="home page icon"
          width={40}
          style={{ margin: "auto", marginBottom: "15px" }}
        />
        <h2> Application settings </h2>
      </div>
      <section style={{display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: "1rem 7rem", placeItems: "start"}}>
        <form id="generate-key" style={{ position: "relative" }} onSubmit={() => {}}>
          {showSpinner && <Spinner floating overlayColor={"white"} overlayOpacity={0.8} />}
          <div className="form-field">
            <label htmlFor="name">Your Name / Nick Name</label>
            <input type="text" name="name" id="name" placeholder="What should we call you?" />
          </div>
          <div className="form-field">
            <label htmlFor="passphrase">IPFS Gateway link</label>
            <input type="text" name="name" id="passphrase" placeholder="https://dweb.link/ipfs/" />
            <p style={{ width: "100%", marginBottom: 0 }}>
              A public gateway for accessing IPFS assets, check{" "}
              <Link href="https://lazyweirdo.github.io/public-gateway-checker/">this list!</Link>{" "}
            </p>
          </div>
        </form>
        <div style={{ position: "relative" }}>
          {showSpinner && <Spinner floating overlayColor={"white"} overlayOpacity={0.8} />}
          <div>
            <label className="label">Use different secret key</label>
            <input type="file" accept="application/json" name="connection" id="key-object-file" />
            <p className="help-text">
              Your secret key is kept locally and used for encryption; &nbsp;
              <Link href="https://github.com/MahmoudRe/searchable-encryption">learn more!</Link>
              <br /> To generate a new secret key, you need to log out first!
            </p>
          </div>
        </div>
        <button
            roll="submit"
            form="generate-key"
            style={{ width: "22rem", height: "4.5rem" }}
        >
          Save changes
        </button>
        <button
            style={{ width: "22rem", height: "4.5rem" }}
            onClick={() => { alert("hii")}}
            disabled
        >
            Update secret key
        </button>
      </section>
    </main>
  );
}

export default HomePage;
