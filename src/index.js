import ReactDOM from 'react-dom/client';
import React from 'react';
import './styles/App.css';
import 'react-day-picker/dist/style.css';
import {Map} from "./components/Map";

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Map/>
);
