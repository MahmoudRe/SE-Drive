export async function getKey(hash, salt, password, iterations, keyLength) {

  // Convert password to key object to drive bits
  const passwordBuffer = new TextEncoder("utf-8").encode(password);
  const deriveBitsKey = await crypto.subtle.importKey("raw", passwordBuffer, "PBKDF2", false, ["deriveBits"]);

  // Convert password to key object to drive bits
  const saltBuffer = new TextEncoder("utf-8").encode(salt);
  const derivedBits = await crypto.subtle.deriveBits({
      name: "PBKDF2", 
      hash: hash, 
      salt: saltBuffer, 
      iterations: iterations
    }, deriveBitsKey, keyLength*8);
  
  const derivedKey = derivedBits.slice(0, 32);
  const iv = derivedBits.slice(32);
  const importedEncryptionKey = await crypto.subtle.importKey('raw', derivedKey, { name: 'AES-CBC' }, false, ['encrypt', 'decrypt']);
  return {
    key: importedEncryptionKey,
    iv: iv
  }
}

export async function encrypt(text, keyObject) {
    const textEncoder = new TextEncoder("utf-8");
    const textBuffer = textEncoder.encode(text);
    const encryptedText = await crypto.subtle.encrypt({ name: 'AES-CBC', iv: keyObject.iv }, keyObject.key, textBuffer);
    return encryptedText;
}

export async function decrypt(encryptedText, keyObject) {
    const textDecoder = new TextDecoder("utf-8");
    const decryptedText = await crypto.subtle.decrypt({ name: 'AES-CBC', iv: keyObject.iv }, keyObject.key, encryptedText)
    return textDecoder.decode(decryptedText);
}

export async function encryptData(text, hash, salt, password, iteratrions, keyLength) {
	const keyObject = await getKey(hash, salt, password, iteratrions, keyLength);
	const encryptedObject = await encrypt(text, keyObject);
	return encryptedObject;
}

export async function decryptData(encryptedObject, hash, salt, password, iteratrions, keyLength) {
	const keyObject = await getKey(hash, salt, password, iteratrions, keyLength);
	const decryptedObject = await decrypt(encryptedObject, keyObject)
	return decryptedObject;
}

/**
 * Convert ArrayBuffer object to string representation given an encoding
 * @param {ArrayBuffer} arrayBuffer an ArrayBuffer object or one of its view, e.g. Uint8Array object 
 * @param {'hex'|'utf-8'|'ascii'|'base64'|'..etc'} [encoding] Any valid Buffer object encoding
 * @returns 
 */
export function ab2str(arrayBuffer, encoding = 'hex') {
  return Buffer.from(arrayBuffer).toString(encoding);
}

/**
 * Convert string representation of data in given encoding to ArrayBuffer object
 * @param {string} string 
 * @param {'hex'|'utf-8'|'ascii'|'base64'|'..etc'} [encoding] Any valid Buffer object encoding
 */
export function str2ab(string, encoding = 'hex') {
  let bufferObject = Buffer.from(string, encoding)
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