import React, { useEffect, useState } from "react";
import { ReactComponent as IdCardSVG } from "../assets/id-card.svg";
import AdvanceFileInput from "../libs/advance-file-input.js";
import Spinner from "../components/Spinner";
import Link from "../components/Link";

function RegisterPage(props) {
  const [peerId, setPeerId] = useState("");
  const [showSpinner, setShowSpinner] = useState(false);
  const [showSpinnerReg, setShowSpinnerReg] = useState(false);

  useEffect(() => {
    props.nextBtn.setShow(false);
    document.documentElement.style.setProperty("--color-primary", "#83BDBD");
    document.documentElement.style.setProperty("--color-primary-light", "#83BDBD");
    document.documentElement.style.setProperty("--color-primary-dark", "#83BDBD");
    document.documentElement.style.setProperty("--color-primary-bg", "#e1f3f3");
    document.documentElement.style.setProperty("--color-primary-bg-tint", "#cfe9e9");

    new AdvanceFileInput({
      selector: "#peer-id",
      dragText: 'Drag "Peer.id" file here',
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
  }, []);

  useEffect(() => {
    if (peerId && !showSpinner) {
      const cb = () => {
        setShowSpinner(true);
        setTimeout(async () => {
          const { ipcRenderer } = window.require("electron");
          ipcRenderer
            .invoke("add-peer", [peerId])
            .then(() => {
              props.nextBtn.setShow(false);
              setShowSpinner(false);
              props.setPageCount(props.pageCount + 1);
            })
            .catch((e) => {
              let errorEl = Array.from(
                document.querySelectorAll(".advance-file-input + .error")
              ).pop();
              let helpEl = Array.from(
                document.querySelectorAll(".advance-file-input + .error + .help-text")
              ).pop();
              errorEl.textContent = "There is an issue occurred; please try again! " + e;
              errorEl.classList.remove("hide");
              errorEl.style.display = "block";
              helpEl.style.display = "none";
              setShowSpinner(false);
            });
        }, 750);
      };
      props.nextBtn.setCallback(() => cb);
      props.nextBtn.setShow(true);
    }
  }, [peerId, showSpinner]);

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
            setShowSpinnerReg(false);
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
            <p className="help-text">
              Couldn't you find this file? &nbsp;
              <Link href="https://github.com/MahmoudRe/searchable-encryption">
                Check this link for help!
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default RegisterPage;
