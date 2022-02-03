import React, { useEffect, useState } from "react";
import { genSecretKey } from "searchable-encryption";
import { ReactComponent as IdCardSVG } from "../assets/id-card.svg";
import AdvanceFileInput from "../libs/advance-file-input.js";
import Spinner from "../components/Spinner";
import "../libs/advance-file-input.css";

function RegisterPage(props) {
  const [peerId, setPeerId] = useState("");
  const [peerCA, setPeerCA] = useState("");
  const [showSpinner, setShowSpinner] = useState(false);
  const [showSpinnerReg, setShowSpinnerReg] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty("--color-primary", "#83BDBD");
    document.documentElement.style.setProperty("--color-primary-light", "#83BDBD");
    document.documentElement.style.setProperty("--color-primary-dark", "#83BDBD");
    document.documentElement.style.setProperty("--color-primary-bg", "#e1f3f3");
    document.documentElement.style.setProperty("--color-primary-bg-tint", "#cfe9e9");

    new AdvanceFileInput({
      selector: "#peer-id",
      dragText: "Drag \"Peer.id\" file here",
      onFileAdded: (fileList) => {
        let file = fileList[0];
        let reader = new FileReader();
        reader.onloadend = function (e) {
          setPeerId(this.result);
        };
        reader.readAsText(file);
      },
      onFileRemoved: () => {
        setPeerId("");
      },
    });

    new AdvanceFileInput({
      selector: "#peer-ca",
      dragText: "Drag \"Peer CA.id\" file here",
      onFileAdded: (fileList) => {
        let file = fileList[0];
        let reader = new FileReader();
        reader.onloadend = function (e) {
          setPeerCA(this.result);
        };
        reader.readAsText(file);
      },
      onFileRemoved: () => {
        setPeerCA("");
      },
    });
  }, []);

  useEffect(() => {
    if (peerId && peerCA && !showSpinner) {
      const cb = () => {
        setShowSpinner(true);
        setTimeout(async () => {
          const { ipcRenderer } = window.require("electron");
          ipcRenderer.invoke("add-peer", [peerId, peerCA])
            .then(() => {
              props.nextBtn.setShow(false);
              setShowSpinner(false);
              props.setPageCount(props.pageCount + 1);
            })
            .catch((e) => {
              let errorEl = Array.from(document.querySelectorAll('.advance-file-input + .error')).pop();
              let helpEl = Array.from(document.querySelectorAll('.advance-file-input + .error + .help-text')).pop();
              errorEl.textContent = "There is an issue occurred; please try again! " + e;
              errorEl.classList.remove('hide');
              errorEl.style.display = "block";
              helpEl.style.display = "none";
              setShowSpinner(false);
            });
        }, 1400);
      };
      props.nextBtn.setCallback(() => cb);
      props.nextBtn.setShow(true);
    }
  }, [peerId, peerCA, showSpinner]);

  return (
    <main>
      <div className="sub-header" style={{ marginBottom: "2rem" }}>
        <IdCardSVG />
        <h2> Tell us more about your identity! </h2>
      </div>
      <section className="either-area">
        <form
          id="register-user"
          style={{ position: "relative" }}
          onSubmit={() => {
            alert(
              'Sorry, this functionality is still under development, please register a new peer manually and upload your "Peer.id" and "Peer CA.id"'
            );
          }}
        >
          {showSpinnerReg && <Spinner floating overlayColor={"white"} overlayOpacity={0.8} />}
          <div className="form-field" style={{ width: "36vw" }}>
            <label htmlFor="name">Peer Name</label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Type here your desired name for peer!"
              required
            />
          </div>
          <div className="form-field" style={{ width: "36vw" }}>
            <label htmlFor="passphrase">Organisation</label>
            <input type="text" name="name" id="organization" placeholder="Org1" required />
            <p style={{ width: "100%", marginBottom: 0 }}>
              The new user identity will be registered to this organization.
            </p>
          </div>
          <button roll="submit" form="register-user">
            Register User Identity
          </button>
        </form>
        <p className="OR"> OR </p>
        <div style={{ position: "relative" }}>
          {showSpinner && <Spinner floating overlayColor={"white"} overlayOpacity={0.8} />}
          <div>
            <label className="label">Peer Identity: "Peer.id"</label>
            <input type="file" name="peer-id" id="peer-id" />
          </div>
          <div>
            <label className="label">Certificate Authority: "Peer CA.id"</label>
            <input type="file" name="peer-ca" id="peer-ca" />
            <p className="help-text">
              Couldn't you find this file? &nbsp;
              <a
                href="https://github.com/MahmoudRe/searchable-encryption"
                onClick={(e) => {
                  e.preventDefault();
                  const { shell } = window.require("electron");
                  shell.openExternal(e.target.href);
                }}
              >
                check this link for help!
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default RegisterPage;
