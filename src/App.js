import React, { useState } from 'react';
import logo from './logo.svg';
import { genSecretKey, encrypt, decrypt, buildIndex, trapdoor } from 'searchable-encryption';
import './App.css';

function App() {
  const [secret, setSecret] = useState("")
  const [plainText, setPlainText] = useState("")
  const [cipherText, setCipherText] = useState("")
  const [search, setSearch] = useState("")

  const [secretKey, setSecretKey] = useState(null);

  const store = async () => {
    const { ipcRenderer } = window.require('electron');
    const data = {};

    //split textual contents to paragraphs (segments)
    let segments = plainText.split('\n\n');
    data.segments = segments.map(e => ({ pointer: crypto.randomUUID(), data: e }))

    //build index and encrypt segments
    data.indexTable = buildIndex(segments, secretKey.key);
    data.segments = data.segments.map(async ({pointer, data}) => ({pointer: pointer, data: await encrypt(data, secretKey)}))
    data.segments = await Promise.all(data.segments);
    data.indexTable = await data.indexTable;
    data.indexTable = Object.entries(data.indexTable).map(([key, value]) => ({ hash: key, pointers: value }))
    
    await ipcRenderer.invoke('submit-transaction', ['storeJSON', JSON.stringify(data.segments), JSON.stringify(data.indexTable)])
  }

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
          const key = await genSecretKey(secret)
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
        <button type="button" onClick={store}> Store </button>

        <div className="form-item">
          <label htmlFor="search">Search</label>
          <input type="text" id="search" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <button type="button" onClick={async e => { 
          const { ipcRenderer } = window.require('electron');
          let pointers = await ipcRenderer.invoke('evaluate-transaction', ['search', await trapdoor(search, secretKey.key)])
          pointers = JSON.parse(new TextDecoder('utf-8').decode(pointers))
        
          let result = pointers.map(async pointer => {
            const encryptedSegment = await ipcRenderer.invoke('evaluate-transaction', ['read', pointer]) // ArrayBuffer object
            const decodedSegment = new TextDecoder('utf-8').decode(encryptedSegment)
            return decrypt(decodedSegment, secretKey)
          })

          Promise.all(result).then(e => setCipherText(e.reduce((prev, curr) => prev + " - " + curr)))
        }}> Search</button>
      </header>
    </div>
  );
}

export default App;
