export async function generateSecretKey(password = "PASSPHRASE", options = {}) {
  //default options
  let {
    hash = "SHA-256",
    salt = crypto.randomUUID(),
    iterations = 999,
    keyLengthByte = 64,
  } = options;

  // Convert password to key object to use it for driving bits
  const deriveBitsKey = await crypto.subtle.importKey(
    "raw",
    str2ab(password), //to Buffer
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  // Drive bits for our derived secret key and iv (initial vector)
  const saltBuffer = str2ab(salt);
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: hash,
      salt: saltBuffer,
      iterations: iterations,
    },
    deriveBitsKey,
    keyLengthByte * 8   //Byte to bits
  );

  // Generate the secret key from derived bits and initial vectors
  const derivedKey = derivedBits.slice(0, 32);  
  const iv = derivedBits.slice(32);
  const secretKey = await crypto.subtle.importKey(
    "raw",
    derivedKey,
    { name: "AES-CBC" },
    true,    // => we can extract key later on
    ["encrypt", "decrypt"]
  );

  return {
    key: secretKey,
    iv: iv,
  };
}

export async function encrypt(text, keyObject) {
  const textEncoder = new TextEncoder("utf-8");
  const textBuffer = textEncoder.encode(text);
  const encryptedText = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv: keyObject.iv },
    keyObject.key,
    textBuffer
  );
  return encryptedText;
}

export async function decrypt(encryptedText, keyObject) {
  const textDecoder = new TextDecoder("utf-8");
  const decryptedText = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv: keyObject.iv },
    keyObject.key,
    encryptedText
  );
  return textDecoder.decode(decryptedText);
}

/**
 * Convert ArrayBuffer object to string representation given an encoding
 * @param {ArrayBuffer} arrayBuffer an ArrayBuffer object or one of its view, e.g. Uint8Array object
 * @param {'hex'|'utf-8'|'ascii'|'base64'|'..etc'} [encoding] Any valid Buffer object encoding
 * @returns
 */
export function ab2str(arrayBuffer, encoding = "hex") {
  return Buffer.from(arrayBuffer).toString(encoding);
}

/**
 * Convert string representation of data in given encoding to ArrayBuffer object
 * @param {string} string
 * @param {'hex'|'utf-8'|'ascii'|'base64'|'..etc'} [encoding] Any valid Buffer object encoding
 */
export function str2ab(string, encoding = "hex") {
  let bufferObject = Buffer.from(string, encoding);
  let arrayBuffer = new ArrayBuffer(bufferObject.length);
  let typedArray = new Uint8Array(arrayBuffer);
  for (let i = 0; i < bufferObject.length; ++i) {
    typedArray[i] = bufferObject[i];
  }
  return typedArray;

  // --- Another implementation that convert hex to ArrayBuffer
  // var hex = encryptedData
  // var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
  //   return parseInt(h, 16)
  // }))
  // return arrayBuffer = typedArray.buffer
}
