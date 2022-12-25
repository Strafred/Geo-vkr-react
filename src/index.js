import ReactDOM from 'react-dom/client';
import React, {useState} from 'react';
import './styles/App.css';
import {Map} from "./components/Map";
import {Availability} from "./dont need now/Availability";

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Map />
);
