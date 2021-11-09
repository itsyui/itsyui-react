import React from 'react';
import './App.css';
import {
  BrowserRouter as Router,
} from "react-router-dom";
import { Main } from "./Main";
// Import all service objects and definitions
import "./data/datasource";
// Import command definitions for the app
import "./commands";
// Import override handlers for UI
import "./handlers";
// Import JSON metadata for pages, forms and grid
import "./schema";

const App: React.FC = () => {
  return (
    <Router>
      <Main />
    </Router>
  );
}

export default App;
