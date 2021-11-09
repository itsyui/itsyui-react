import React from 'react';
import './App.css';
import { ItsyProvider } from "@itsy-ui/app";
import { ItsyLabel } from "@itsy-ui/common";

function App() {
  const labelSchema = {
    "title": "Hello World!!",
    "alignText": "center",
    "headerTag": "h2"
  };
  return (
    <ItsyProvider>
      <div className="App">
        <ItsyLabel schema={labelSchema} />
      </div>
    </ItsyProvider>
  );
}

export default App;
