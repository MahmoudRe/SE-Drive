# Searchable Encrypted Drive

SE Drive is an open-source platform that allows its users to store
their notes, files, photos securely and privately on public/private blockchains,
untrusted cloud services, or even on a local disk drive.
State-of-the-art index-based searchable encryption technique is utilized to
ensure every bit of users' data is encrypted the moment it's uploaded, then only the
key-owners can search through this encrypted data without any compromises on security ,privacy, or efficiency. The system is designed such that
any party, involved in the data storage, knows NOTHING about the actual data or the search queries, e.g. peers on a blockchain network, those who
execute the smart contract of the search queries, or cloud service providers.

The current version of the application is build using React with Electron, and optimized to work with Hyperledger Fabric through [this smart contract](https://github.com/MahmoudRe/sse-chaincode) (Chaincode). However, the source-code can be adjusted easily to adopt different blockchain solutions or conventional cloud server.

## Getting started!

To start the electron app with react server, run `npm start`. If something doesn't work well, make sure the two line with `[DEV]` comment in `public/electron.js` are uncommented as follow:

```js
function createWindow(...) {
  ...

  // and load the index.html of the app.
  // win.loadFile("index.html");
  win.loadURL(
      'http://localhost:3000' // [DEV]
      // `file://${path.join(__dirname, '../build/index.html')}`
      + queryString
  );
  
  // [DEV]
  win.webContents.openDevTools({ mode: 'detach' });
}
```

## Make your build!
To build the electron desktop application, the previously mentioned two lines with `[DEV]` comment in `public/electron.js` should be commented, and line under `localhost:3000` should be uncommented as follow:
```js
function createWindow(...) {
  ...

  // and load the index.html of the app.
  // win.loadFile("index.html");
  win.loadURL(
      // 'http://localhost:3000' // [DEV]
      `file://${path.join(__dirname, '../build/index.html')}`
      + queryString
  );
  
  // [DEV]
  // win.webContents.openDevTools({ mode: 'detach' });
}
```

Then run `npm run electron-pack`. For more information about the configuration of the build, please refer to [the documentation of electron-builder](https://www.electron.build/configuration/configuration).

## Features and Demo
Please refer to [this video](https://youtu.be/G5cf7AmIuX4) for quick demo and go through all features of the application.

### Features
1. Encrypting all data before uploading to the network, hence no information leaks!
1. Smart indexing for the uploaded notes, where text run through multiple filters to ignore irrelevant information and enhance searching, e.g. ignore punctuation marks.
1. Industry standard UI/UX.
1. Generate symmetric key and initial vector from weak passphrase using PBKDF2 algorithm.
1. Export the generated key, combined with initial vector and secret salt to `key.json` file for sharing with authorized users.
1. Import the secret key from previously exported `key.json` file.
1. Easy drag and drop functionality for any file input.
1. Dropping a text file into `Notes` textarea will extract the text from the file, formatted (slightly) and fill it automatically.
1. Dropping a text file into `Notes` button from the home page will open the `Notes` page and has the same effect as previous point.
1. Dropped text file can be a simple `.txt`, but also other types like: `.pdf`, `.docx` ... etc. 
1. Pop-up tooltips in main pages for quick instruction for the user.
1. Generate automated keywords for uploaded files based on the title.
1. Option to add more keywords for specific file before upload to ease finding this file in the search.
1. Files uploading to IPFS, and using public gateway to find uploaded files.
1. Searching is fuzzy keywords search.
1. Searching support advance search operators, namely: the pipe-char `|` as an OR operator, and the quotes-char `"..."` as a strict operator.
1. Setting page to adjust quick configuration, like IPFS gateway or change the symmetric key.
1. [To Be Done] AI-based searching for the encrypted images in the gallery.
1. High modular application that can serve a based for future researchs in the field of searchable encryption.

## Screenshots
![splash](screenshots/1.png)
![splash](screenshots/2.png)
![splash](screenshots/3.png)
![splash](screenshots/4.png)
![splash](screenshots/5.png)
![splash](screenshots/6.png)
![splash](screenshots/7.png)
![splash](screenshots/8.png)
![splash](screenshots/9.png)
![splash](screenshots/10.png)
