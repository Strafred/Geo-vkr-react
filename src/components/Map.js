import React, {useEffect, useState} from 'react';
import {MapContainer, TileLayer} from "react-leaflet";
import '../styles/App.css';
import '../styles/Map.css';
import '../styles/StationWindow.css';
import './NetworkButton';
import {StationMarker} from "./StationMarker";
import {ChosenStationWindow} from "./ChosenStationWindow";
import {Doughnut} from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function Temperature({station, setClickedStation, temperature}) {
  return <div className="stationActivityWindow">
    <div className="stationName">
      <div style={{margin: "auto"}}>
        {station.stationName} temperature
      </div>
      <img className="x" onClick={() => {
        setClickedStation("");
      }} src="https://www.freeiconspng.com/uploads/close-button-png-20.png" width="25" height="20"
           alt="close station window"/>
    </div>
    <div style={{marginTop: -65, marginBottom: -70}}>
    <Doughnut
      data={{
      labels: ["Red", "Orange", "Green"],
      datasets: [{
        data: [temperature, 60 - temperature],
        backgroundColor: [
          '#005896',
          'rgba(46, 204, 113, 1)'
        ],
        borderColor: [
          'rgba(255, 255, 255 ,1)',
          'rgba(255, 255, 255 ,1)',
        ],
        borderWidth: 5,
      }],
    }} options={{
      rotation: -90,
      circumference: 180,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
      },
      layout: {
        padding: {
          top: 0,
          bottom: 0,
        },
      },
    }} plugins={[
      {
        id: "textCenter",
        afterDatasetsDraw(chart) {
          const {ctx, data} = chart;
          const meta = chart.getDatasetMeta(0);

          console.log("meta", meta);
          console.log("data", data);
          console.log(data.datasets[0].data[0]);
          ctx.font = "bold 40px sans-serif";
          ctx.fillStyle = "#333"
          ctx.textAlign = "center";

          ctx.fillText(`${(data.datasets[0].data[0])}°`, meta.data[0].x, meta.data[0].y);
        }
      }
    ]}/>
    </div>
  </div>
}

export const Map = () => {
  const [chosenStation, setChosenStation] = useState(null);
  const [clickedStation, setClickedStation] = useState("");
  const [temperature, setTemperature] = useState(null);
  console.log("temperature", temperature);

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
            setTemperature={setTemperature}
          />
          <Temperature
            station={chosenStation}
            setClickedStation={setClickedStation}
            temperature={temperature}
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
