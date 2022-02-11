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
  let { contentSize = 0, callbackProgress = () => {} } = options;
  let response = await fetch(url);

  if (response.redirected)
    return downloadFromURL(response.url, options);

  const reader = response.body.getReader();
  contentSize = contentSize || response.headers.get("Content-Length");

  let receivedLength = 0; // received that many bytes at the moment
  let chunks = []; // array of received binary chunks (comprises the body)
  
  for (;;) {
    const { done, value } = await reader.read();

    if (done) break;

    chunks.push(value);
    receivedLength += value.length;

    let progress = Math.floor((receivedLength / contentSize) * 100)
    callbackProgress(progress <= 100 ? progress : 100);
  }

  let buffer = new Uint8Array(receivedLength);
  let position = 0;
  for(let chunk of chunks) {
    buffer.set(chunk, position);
    position += chunk.length;
  }

  return buffer;
}

export function formatText(str) {
  return str
    .trim()
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
      resolve(reader.result)
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}