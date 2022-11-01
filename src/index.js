import ReactDOM from 'react-dom/client';
import React from 'react';
import {Map} from "./Map";
import './App.css';
import {Availability} from "./Availability";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <div>
    <Map/>
    <Availability/>
  </div>
);
