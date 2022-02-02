import React from 'react';
import ConnectionPage from './pages/ConnectionPage';
import RegistrationPage from './pages/RegistrationPage';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="header">
        <h1> Searchable <span className="--color-primary-txt"> Encryption </span> Chaincode </h1>
      </header>
      {/* <ConnectionPage /> */}
      <RegistrationPage />
    </div>
  );
}

export default App;
