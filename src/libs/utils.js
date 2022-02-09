export function downloadFromBuffer(buffer, fileName) {
  let file = new Blob([buffer]);
  let a = document.createElement("a");
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

export function downloadFromString(content, fileName, contentType) {
  let a = document.createElement("a");
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

  // Step 4: concatenate chunks into single Uint8Array
  let chunksAll = new Uint8Array(receivedLength); // (4.1)
  let position = 0;
  for(let chunk of chunks) {
    chunksAll.set(chunk, position); // (4.2)
    position += chunk.length;
  }

  // let file = new Blob(chunks);

  // let a = document.createElement("a");
  // a.href = URL.createObjectURL(file);
  // a.download = fileName;
  // a.click();

  return chunksAll;
}

export function formatText(str) {
  return str
    .replace(/^\r*\n*|[ ]*/, "") //remove leading  empty lines and spaces
    .replace(/(?<=\n)\d+(\n\n|$)/g, "") //remove page numbers
    .replace(/(?<=\n)(?<!(\n\d.*|\:)\n)(\d.*[a-zA-Z]{2,}|Abstract|References)\n/g, "\n\n$&") //divided it according to numerical (sub)sections
    .replace(/(?<!(\n|\n((\d|•).{3,}|Abstract)))\n(?!(\[?\d\]?|•).{4,}\n)/g, " ");
}

/**
 * Promisified version of FileReader()
 * @param {File} file 
 * @returns 
 */
export function readFile(file){
  return new Promise((resolve, reject) => {
    var reader = new FileReader();  
    reader.onload = () => {
      resolve(reader.result )
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}