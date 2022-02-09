export function downloadFromString(content, fileName, contentType) {
  let a = document.createElement("a");
  if (typeof content !== "string") {
    content = Buffer.from(content);
  }
  let file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

export async function downloadFromURL(url, options) {
  let { fileName = "", contentType = "", contentSize = 0, callbackProgress = () => {} } = options;
  let response = await fetch(url);

  if (response.redirected)
    return downloadFromURL(response.url, options);

  const reader = response.body.getReader();
  contentSize = contentSize || response.headers.get("Content-Length");
  contentType = contentType || response.headers.get("Content-Type");

  let receivedLength = 0; // received that many bytes at the moment
  let chunks = []; // array of received binary chunks (comprises the body)
  
  for (;;) {
    const { done, value } = await reader.read();

    if (done) break;

    chunks.push(value);
    receivedLength += value.length;

    console.log(`Received ${Math.floor((receivedLength / contentSize) * 100)} of ${contentSize}`);
    callbackProgress(Math.floor((receivedLength / contentSize) * 100));
  }

  let file = new Blob(chunks);

  let a = document.createElement("a");
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();

  return chunks;
}

export function formatText(str) {
  return str
    .replace(/^\r*\n*|[ ]*/, "") //remove leading  empty lines and spaces
    .replace(/(?<=\n)\d+(\n\n|$)/g, "") //remove page numbers
    .replace(/(?<=\n)(?<!(\n\d.*|\:)\n)(\d.*[a-zA-Z]{2,}|Abstract|References)\n/g, "\n\n$&") //divided it according to numerical (sub)sections
    .replace(/(?<!(\n|\n((\d|•).{3,}|Abstract)))\n(?!(\[?\d\]?|•).{4,}\n)/g, " ");
}