import React, {useEffect, useState} from 'react';
import {MapContainer, TileLayer} from "react-leaflet";
import '../styles/App.css';
import '../styles/Map.css';
import '../styles/StationWindow.css';
import './NetworkButton';
import {StationMarker} from "./StationMarker";
import {ChosenStationWindow} from "./ChosenStationWindow";
import {createDregMqttClient} from "../utils/mqttClientUtils";
import {Temperature} from "./Temperature";

export const Map = () => {
  const [chosenStation, setChosenStation] = useState(null);
  const [clickedStation, setClickedStation] = useState("");
  const [temperature, setTemperature] = useState(null);
  const [loadedStations, setLoadedStations] = useState([]);
  console.log("temperature", temperature);

  useEffect(() => {
    const client = createDregMqttClient();
    client.subscribe(`DREG/+/gnss/loc`);

    const stationLocMessageHandler = (topic, payload) => {
      console.log("message: " + payload.toString());
      console.log("topic: " + topic);

      const stationName = topic.split("/")[1];
      const [lat, long] = payload.toString().split(",");

      setLoadedStations((prevLoadedStations) => {
        console.log("prevLoadedStations", prevLoadedStations);
        if (prevLoadedStations.filter(station => station.stationName === stationName).length === 0) {
          return [...prevLoadedStations, {
            stationName: stationName,
            network: "DREG",
            latitude: lat,
            longitude: long,
          }];
        } else {
          return prevLoadedStations;
        }
      });
    };

    client.on('message', stationLocMessageHandler);

    setTimeout(() => {
      console.log("unsubscribing");
      client.end();
    }, 15000);
  }, []);

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
            setTemperature={setTemperature}
          />
          <Temperature
            station={chosenStation}
            setClickedStation={setClickedStation}
            temperature={temperature}
            />
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
