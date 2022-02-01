/**
 * Generate a symmetric secret key for AES-CBC encryption algorithm,
 * with initial vector (iv), based on given secret (password) and salt.
 * This algorithm is deterministic, given the same secret and salt. If salt isn
 * @param {string} [secret="PASSPHRASE"]  textual based to derive the password from, e.g. password.
 * @param {object} options
 * @param {string} [options.hash="SHA-256"] the hashing algorithm for deriving bits used by `PBKDF2` algorithm, e.g. 'SHA-256'.
 *    Please refer to `PBKDF2` specification for supported hashing algorithms.
 * @param {string|ArrayBuffer} [options.salt] default value is a secure random value is used.
 *    For deterministic key generation, please provide the same salt.
 * @param {number} [options.iterations=999] the number of iteration performed by `PBKDF2` algorithm.
 * @param {number} [options.keyLengthByte=48] the length of the generated key in byte;
 *    however, only the first 32 byte (256-bit) are used for AES and last 16 byte (128-bit) for the initial vector, hence the default value 48.
 * @returns
 */
export async function generateSecretKey(secret = "PASSPHRASE", options = {}) {
  //default options
  let {
    hash = "SHA-256",
    salt = crypto.getRandomValues(new Uint8Array(512)), //get secure random value
    iterations = 999,
    keyLengthByte = 48,
  } = options;

  // Convert password to key object to use it for driving bits
  const deriveBitsKey = await crypto.subtle.importKey(
    "raw",
    str2ab(secret), //to Buffer
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  // Drive bits for our derived secret key and iv (initial vector)
  const saltBuffer = typeof salt === "string" ? str2ab(salt) : salt;
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: hash,
      salt: saltBuffer,
      iterations: iterations,
    },
    deriveBitsKey,
    keyLengthByte * 8 //Byte to bits
  );

  // Generate the secret key from derived bits and initial vectors
  const derivedKey = derivedBits.slice(0, 32); //32 byte = 256 bit (maximum key length allowed by AES)
  const iv = derivedBits.slice(-16); // 16 byte = 128 bit (maximum allowed length for initial vector by AES)
  const secretKey = await crypto.subtle.importKey(
    "raw",
    derivedKey,
    { name: "AES-CBC" },
    true, // => we can extract key later on
    ["encrypt", "decrypt"]
  );

  return {
    key: secretKey,
    iv: iv,
  };
}

/**
 * Encrypt textual based data using the AES-CBC encryption algorithm.
 * @param {string} text string text to be encrypted.
 * @param {*} keyObject
 * @param {'hex'|'utf-8'|'ascii'|'base64'|'..etc'} [encoding='hex'] the encoding of the encrypted text; default: 'hex'.
 * @returns textual representation of the encrypted data
 */
export async function encrypt(text, keyObject, encoding) {
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv: keyObject.iv },
    keyObject.key,
    str2ab(text, 'utf-8')
  );
  return ab2str(encryptedBuffer, encoding);
}

/**
 * Decrypt textual representation of encrypted data using the AES-CBC encryption algorithm.
 * @param {string} encryptedText textual representation of the encrypted data.
 * @param {*} keyObject
 * @param {'hex'|'utf-8'|'ascii'|'base64'|'..etc'} [encoding='hex'] the encoding of the encrypted text; default: 'hex'.
 * @returns
 */
export async function decrypt(encryptedData, keyObject, encoding) {
  const dataBuffer = typeof encryptedData === 'string' ? str2ab(encryptedData, encoding) : encryptedData;
  const decryptedText = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv: keyObject.iv },
    keyObject.key,
    dataBuffer
  );
  return ab2str(decryptedText, 'utf-8');
}

/**
 * Digest (hash) String or ArrayBuffer data.
 * Optionally with salt.
 * @param {string|ArrayBuffer} data 
 * @param {"SHA-1"|"SHA-256"|"SHA-384"|"SHA-512"} [option.hash] the algorithm to be used for hashing; default is SHA-256.
 * @param {string|ArrayBuffer} option.salt the salt is used for difusing the text before hashing.
 * @returns textual representation default 'hex' of the hash. 
 */
export async function digest(data, options = {}) {
  let {
    hash = "SHA-256",
    salt = "DEFAULT-SALT",
  } = options;
  const saltBuffer = typeof salt === "string" ? str2ab(salt, 'utf-8') : salt;
  const dataBuffer = typeof data === 'string' ? str2ab(data, 'utf-8') : data;
  const hashBuffer = await crypto.subtle.digest(hash, abConcat(dataBuffer, saltBuffer));
  return ab2str(hashBuffer);
}

/**
 * Concat two or multiple ArrayBuffer passed as arguments.
 * @param  {...ArrayBuffer} buffers buffers passed as multiple arguments.
 * @returns ArrayBuffer resulted by concatenating the given buffers.
 */
function abConcat(...buffers){
	const result = new Uint8Array(buffers.reduce((totalSize, buf)=>totalSize+buf.byteLength, 0));
	buffers.reduce( (offset, buffer) => {
		result.set(buffer,offset)
		return offset + buffer.byteLength
	}, 0)
	return result
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
}
