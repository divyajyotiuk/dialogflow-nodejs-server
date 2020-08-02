import React from 'react';
import Record from './services/record';
import './App.css';

function App() {
  Record();
  return (
    <div className="App">
      <header className="App-header">
        <h3> Say out the below commands out loud </h3>
        <List />
      </header>
    </div>
  );
}

const List = () => {
  return(
    <div>
      <ul className="text">
        <li>Hey Lucy, turn OFF video</li>
        <li>Hey Lucy, turn ON video</li>
        <li>Hey Lucy, turn OFF Music</li>
        <li>Hey Lucy, turn ON Music</li>
        <li>Hey Lucy, change to Hip Hop</li>
        <li>Hey Lucy, change to Tempo</li>
        <li>Hey Lucy, start class</li>
        <li>Hey Lucy, exit class</li>
      </ul>
  </div>
  );
}

export default App;


//./google-cloud-sdk/bin/gcloud init    for instantiating gcloud
