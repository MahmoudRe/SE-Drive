import React, { useState } from 'react';
import logo from './logo.svg';
import { generateSecretKey, encrypt, decrypt, ab2str, str2ab } from './crypto';
import './App.css';

function hashStr(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash; // Convert to 32bit integer
  }
  return new Uint32Array([hash])[0].toString(36);
}

function divideSemgents(str) {
  return str.split('\n\n')
}

function buildIndexes(segments) {
  let res = {};
  for(let i = 0; i < segments.length; i++) {
    let tokens = segments[i].split(' ');

    let hash = hashStr(segments[i])

    for(let token of tokens) {
      res[token] = res[token] || [];
      res[token] = [...res[token], hash]
    }
  }

  return res;
}

function App() {
  const [secret, setSecret] = useState("")
  const [plainText, setPlainText] = useState("")
  const [cipherText, setCipherText] = useState("")
  const [search, setSearch] = useState("")

  const [secretKey, setSecretKey] = useState(null);

  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <p>
          Welcome Electron App for Fabric's Chaincode Searchable Encryption (FCSE)
        </p>
        <div className="form-item">
          <label htmlFor="secret">Secret passphrase</label>
          <input type="text" id="secret" value={secret} onChange={e => setSecret(e.target.value)}/>
        </div>
        <button type="button" onClick={async e => {
          const key = await generateSecretKey(secret)
          setSecretKey(key)
        }} style={{background: secretKey? 'green' : undefined}}> { secretKey? "Key is successfully created" : "Create key!"} </button>
        <div className="form-item">
          <label htmlFor="plaintext">Plain Text</label>
          <textarea type="text" id="plaintext" value={plainText} onChange={e => setPlainText(e.target.value)}/>
        </div>
        <div className="form-item">
          <label htmlFor="ciphertext">Result: Cipher Text</label>
          <textarea type="text" id="ciphertext" value={cipherText} onChange={e => setCipherText(e.target.value)}/>
        </div>
        <button type="button" onClick={async e => { 
          const { ipcRenderer } = window.require('electron');
          const data = {};

          const segments = divideSemgents(plainText);
          const indices = buildIndexes(segments);
          
          segments.forEach(async e => {
            let key = hashStr(e)
            let value = await encrypt(e, secretKey)
            value = ab2str(value);
            ipcRenderer.invoke('submit-transaction', ['storeEncryptedSegment', key, value])
          });
          
          data.indices = Object.entries(indices).map(([key, value]) => ({hash: key, pointers: value}))
          ipcRenderer.invoke('submit-transaction', ['addIndicesJSON', JSON.stringify(data.indices)])
          
          // let res = await ipcRenderer.invoke('submit-transaction', ['createJSON', JSON.stringify(data.segments), JSON.stringify(data.indices)])          
        }}> Encrypt</button>

        <div className="form-item">
          <label htmlFor="search">Search</label>
          <input type="text" id="search" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <button type="button" onClick={async e => { 
          const { ipcRenderer } = window.require('electron');
          let pointers = await ipcRenderer.invoke('evaluate-transaction', ['search', search])
          pointers = JSON.parse(new TextDecoder('utf-8').decode(pointers))
        
          let result = pointers.map(async pointer => {
            const encryptedSegment = await ipcRenderer.invoke('evaluate-transaction', ['read', pointer]) // ArrayBuffer object
            const decodedSegment = new TextDecoder('utf-8').decode(encryptedSegment)
            const arrayBuffer = str2ab(decodedSegment)
            return decrypt(arrayBuffer, secretKey)
          })

          Promise.all(result).then(e => setCipherText(e.reduce((prev, curr) => prev + " - " + curr)))

          // setCipherText(res);
        }}> Search</button>
      </header>
    </div>
  );
}

export default App;
