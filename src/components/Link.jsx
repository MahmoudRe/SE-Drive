import React from "react";

export default function Link(props) {
  return (
    <a
      {...props}
      onClick={(e) => {
        e.preventDefault();
        const { shell } = window.require("electron");
        shell.openExternal(e.target.href);
      }}
    >
      {props.children}
    </a>
  );
}
