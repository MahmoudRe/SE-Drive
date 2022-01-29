import React, { useState } from 'react';
import logo from './logo.svg';
import { encryptData, decryptData, ab2str } from './crypto';
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

  const hash = "SHA-256";
  const salt = "SALT";
  const iteratrions = 1000;
  const keyLength = 48;

  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <p>
          Welcome to Fabric's Chaincode Searchable Encryption (FCSE)
        </p>
        <div className="form-item">
          <label htmlFor="secret">Secret passphrase</label>
          <input type="text" id="secret" value={secret} onChange={e => setSecret(e.target.value)}/>
        </div>
        <div className="form-item">
          <label htmlFor="plaintext">Plain Text</label>
          <textarea type="text" id="plaintext" value={plainText} onChange={e => setPlainText(e.target.value)}/>
        </div>
        <div className="form-item">
          <label htmlFor="ciphertext">Result: Cipher Text</label>
          <textarea type="text" id="ciphertext" value={cipherText} onChange={e => setCipherText(e.target.value)}/>
        </div>
        <button type="button" onClick={async e => { 
          const data = {};

          const segments = divideSemgents(plainText);
          const indices = buildIndexes(segments);
          
          data.segments = segments.map(async e => ({key: hashStr(e), value: await encryptData(e, hash, salt, secret, iteratrions, keyLength)}));
          
          data.indices = Object.entries(indices).map(([key, value]) => ({hash: key, pointers: JSON.stringify(value)}))

          let encData = await encryptData(plainText, hash, salt, secret, iteratrions, keyLength)

          setCipherText(encData)

          await Promise.all(data.segments).then(segs => { data.segments = segs });

          fetch('http://localhost:6060/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(data)
          })

        }}> Encrypt</button>

        <div className="form-item">
          <label htmlFor="secret">Search</label>
          <input type="text" id="secret" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <button type="button" onClick={async e => { 

          fetch('http://localhost:6060/search/'+search, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          }).then((res) => res.json()).then(res => setCipherText(res))

        }}> Search</button>
      </header>
    </div>
  );
}

export default App;
