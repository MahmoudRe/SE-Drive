import React from 'react';
import ConnectionPage from './pages/ConnectionPage';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="header">
        <h1> Searchable <span className="--color-primary-txt"> Encryption </span> App </h1>
      </header>
      <ConnectionPage />
    </div>
  );
}

export default App;
