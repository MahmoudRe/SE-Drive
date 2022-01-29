export async function getDerivation(hash, salt, password, iterations, keyLength) {
  const textEncoder = new TextEncoder("utf-8");
  const passwordBuffer = textEncoder.encode(password);
  const importedKey = await crypto.subtle.importKey("raw", passwordBuffer, "PBKDF2", false, ["deriveBits"]);

  const saltBuffer = textEncoder.encode(salt);
  const params = {name: "PBKDF2", hash: hash, salt: saltBuffer, iterations: iterations};
  const derivation = await crypto.subtle.deriveBits(params, importedKey, keyLength*8);
  return derivation;
}

export async function getKey(derivation) {
  const ivlen = 16;
  const keylen = 32;
  const derivedKey = derivation.slice(0, keylen);
  const iv = derivation.slice(keylen);
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
    const decryptedText = await crypto.subtle.decrypt({ name: 'AES-CBC', iv: keyObject.iv }, keyObject.key, encryptedText);
    return textDecoder.decode(decryptedText);
}

function readFile(file){
    return new Promise((resolve, reject) => {
      var fr = new FileReader();  
      fr.onload = () => {
        resolve(fr.result )
      };
      fr.onerror = reject;
      fr.readAsText(file.blob);
    });
  }

export async function encryptData(text, hash, salt, password, iteratrions, keyLength) {
	const derivation = await getDerivation(hash, salt, password, iteratrions, keyLength);
	const keyObject = await getKey(derivation);
	const encryptedObject = await encrypt(JSON.stringify(text), keyObject);
	return ab2str(encryptedObject);
}

export async function decryptData(encryptedObject, hash, salt, password, iteratrions, keyLength) {
	const derivation = await getDerivation(hash, salt, password, iteratrions, keyLength);
	const keyObject = await getKey(derivation);
	const decryptedObject = await decrypt(encryptedObject, keyObject);
	return decryptedObject;
}

export function ab2str(buffer) {
    var blob = new Blob([buffer],{type:'text/plain'});
    
    return new Promise((resolve, reject) => {
        var reader = new FileReader(); 
        reader.onload = (evt) => {
            resolve(evt.target.result)
        };
        reader.onerror = reject;
        reader.readAsText(blob, 'UTF-8');
    });
}

export function str2ab(str) {
    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }