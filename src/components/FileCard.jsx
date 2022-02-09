import React, { useState } from "react";
import { downloadFromURL } from "../libs/utils";
import { getFileIcon, bytesToString } from "../libs/advance-file-input";
import "./FileCard.css";

/**
 * @param {object} props
 * @param {{path: string, name: string, size: number}} props.file object should contain: name, type, size, path
 * @returns
 */
export default function FileCard(props) {
  const { file, ...restProps } = props;
  const [progress, setProgress] = useState(0);
  const [buffer, setBuffer] = useState();

  return (
    <div
      className="file-card"
      onClick={async () => {
        // if(buffer) {
        //   return downloadFromBuffer(buffer, file.name, file.type);
        // }
        let buff = await downloadFromURL("https://dweb.link/ipfs/" + file.path, {
          fileName: file.name,
          contentType: file.type,
          contentSize: file.size,
          callbackProgress: setProgress,
        });
        setBuffer(buff);
      }}
      {...restProps}
    >
      <div
        className="file-card__icon"
        dangerouslySetInnerHTML={{ __html: getFileIcon(file.type) }}
      />
      <div className="file-card__name">{file.name}</div>
      <div className="file-card__size-progress-wrapper">
        <div className="file-card__size">{bytesToString(file.size)}</div>
        <div
          className="file-card__progress"
          style={{ "--progress": progress + "%", display: progress ? "flex" : "none" }}
        ></div>
      </div>
    </div>
  );
}