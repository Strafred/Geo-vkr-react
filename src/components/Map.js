import React, {useEffect, useState} from 'react';
import {MapContainer, TileLayer} from "react-leaflet";
import '../styles/App.css';
import '../styles/Map.css';
import '../styles/StationWindow.css';
import './NetworkButton';
import {StationMarker} from "./StationMarker";
import {ChosenStationWindow} from "./ChosenStationWindow";

export const Map = () => {
  const [chosenStation, setChosenStation] = useState(null);
  const [clickedStation, setClickedStation] = useState("");

  let counter = 0;
  const stations = ["23-004", "23-005", "23-006", "23-013", "23-015", "23-018"];

  const loadedStations = stations.map((station) => {
    counter += 0.3;
    return {
      stationName: station,
      network: "DREG",
      latitude: 65 + counter,
      longitude: 90 + counter,
    };
  });

  useEffect(() => {
    if (clickedStation !== "") {
      let station = loadedStations.find(station => station.stationName === clickedStation);
      setChosenStation(station);
    } else {
      setChosenStation(null);
    }
  }, [clickedStation]);

  return (
    <div>
      <MapContainer className="mapContainer" center={[65, 90]} zoom={3} scrollWheelZoom={true}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
        {loadedStations.map((station, index) => (
          <StationMarker
            key={index}
            station={station}
            clickedStation={clickedStation}
            setClickedStation={setClickedStation}
          />
        ))}
      </ MapContainer>
      {chosenStation &&
        <>
          <ChosenStationWindow
            station={chosenStation}
            setClickedStation={setClickedStation}
          />
          {/*<StationActivity*/}
          {/*  station={chosenStation}*/}
          {/*  setClickedStation={setClickedStation}*/}
          {/*/>*/}
        </>}
      <div className="leafletCredits">
        <img className="russianFlag" src="https://upload.wikimedia.org/wikipedia/commons/d/d4/Flag_of_Russia.png"
             width="14" height="12" alt="russian flag"/>
        <div className="leafletRussia">
          Leaflet Russia
        </div>
      </div>
    </div>
  );
};
