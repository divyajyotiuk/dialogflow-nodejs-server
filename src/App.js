/**
 * Refered the below article
 * https://medium.com/google-cloud/building-your-own-conversational-voice-ai-with-dialogflow-speech-to-text-in-web-apps-part-i-b92770bd8b47
 */

import React, {useEffect, useState} from 'react';
import {automaticRecord, clientData} from './services/record';
import './App.css';
import Waveform from './components/Waveform';

function App() {
  const [temp, updateText] = useState({});
  automaticRecord();
  
  useEffect(() => {
    setInterval(()=>{
      updateText(clientData);
      console.log("LOG App :: ", clientData);
    }, 4000);  
  }, []);
 
  return (
    <div className="App">
      <header className="App-header">
        <h3> Say out the below commands out loud </h3>
        <List data = {temp} />
      </header>
    </div>
  );
}

const List = (props) => {
  const { data } = props;
  return(
    <div>
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
    <div className="response-text">
      <ol>
        <li>Query: {data.queryText}</li>
        <li>Intent: {data.intent}</li>
      </ol>
    </div>
    <div className="waveform">
      <Waveform />
    </div>
  </div>
  );
}

export default App;



//./google-cloud-sdk/bin/gcloud init    for instantiating gcloud
