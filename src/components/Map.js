import React, {useEffect, useState} from 'react';
import {MapContainer, TileLayer} from "react-leaflet";
import '../styles/App.css';
import '../styles/Map.css';
import '../styles/StationWindow.css';
import './NetworkButton';
import {getNetworks} from "../utils/requestUtils";
import {StationMarker} from "./StationMarker";
import {ChosenStationWindow} from "./ChosenStationWindow";

export const Map = () => {
  const [loadedStations, setLoadedStations] = useState([]);
  const [chosenStation, setChosenStation] = useState(null);
  const [clickedStation, setClickedStation] = useState("");

  useEffect(() => {
    function loadStationChannels(stationTextName) {
      let xmlHttp;

      if (window.XMLHttpRequest) {
        xmlHttp = new XMLHttpRequest();
      } else {
        xmlHttp = new window.ActiveXObject("Microsoft.XMLHTTP");
      }

      const channelsRequestURL = 'http://84.237.89.72:8080/fdsnws/station/1/query?station=' + stationTextName
        + '&level=channel&format=xml';
      xmlHttp.open("GET", channelsRequestURL, false);
      xmlHttp.send()

      let xmlDocResponse = xmlHttp.responseXML;

      let fdsn = xmlDocResponse.getElementsByTagName('FDSNStationXML')[0];
      let network = fdsn.getElementsByTagName('Network')[0];
      let station = network.getElementsByTagName('Station')[0];
      let channels = station.getElementsByTagName('Channel');

      let channelsList = [];
      for (let i = 0; i < channels.length; i++) {
        let currentChannelName = channels[i].getAttribute("code");

        let latitude = channels[i].getElementsByTagName("Latitude")[0];
        let longitude = channels[i].getElementsByTagName("Longitude")[0];
        let elevation = channels[i].getElementsByTagName("Elevation")[0];
        let depth = channels[i].getElementsByTagName("Depth")[0];
        let azimuth = channels[i].getElementsByTagName("Azimuth")[0];
        let dip = channels[i].getElementsByTagName("Dip")[0];
        let channel = {};

        channel["currentChannelName"] = currentChannelName;
        channel["latitude"] = latitude.firstChild.nodeValue;
        channel["longitude"] = longitude.firstChild.nodeValue;
        channel["elevation"] = elevation.firstChild.nodeValue;
        channel["depth"] = depth.firstChild.nodeValue;
        channel["azimuth"] = azimuth.firstChild.nodeValue;
        channel["dip"] = dip.firstChild.nodeValue;
        channel["sampleRate"] = elevation.firstChild.nodeValue;

        channelsList.push(channel)
      }
      return channelsList;
    }

    let networks = getNetworks();

    for (let i = 0; i < networks.length; i++) {
      let currentNetworkDescription = networks[i].getElementsByTagName("Description")[0]; //get network
      let stations = networks[i].getElementsByTagName("Station"); // get all network stations

      for (let j = 0; j < stations.length; j++) {
        let latitude = stations[j].getElementsByTagName("Latitude")[0];
        let longitude = stations[j].getElementsByTagName("Longitude")[0];
        let elevation = stations[j].getElementsByTagName("Elevation")[0];
        let stationName = stations[j].getElementsByTagName("Site")[0].getElementsByTagName("Name")[0];

        let channels = loadStationChannels(stationName.firstChild.nodeValue); // get all station channels

        let stationInfo = {};

        stationInfo["stationName"] = stationName.firstChild.nodeValue;
        stationInfo["network"] = currentNetworkDescription.firstChild.nodeValue;
        stationInfo["latitude"] = latitude.firstChild.nodeValue;
        stationInfo["longitude"] = longitude.firstChild.nodeValue;
        stationInfo["elevation"] = elevation.firstChild.nodeValue;
        stationInfo["channels"] = channels;

        setLoadedStations(prevStations => [...prevStations, stationInfo]);
      }
    }
  }, []);

  return (
    <div>
      <MapContainer className="mapContainer" center={[65, 90]} zoom={3} scrollWheelZoom={true}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
        {loadedStations.map((station, index) => (
          <StationMarker
            key={index}
            station={station}
            chooseStation={setChosenStation}
            clickedStation={clickedStation}
            setClickedStation={setClickedStation}
          />
        ))}
      </ MapContainer>
      {chosenStation &&
        <ChosenStationWindow
          station={chosenStation}
          setChosenStation={setChosenStation}
          setClickedStation={setClickedStation}
        />}
      <div className="daun">
        <img className="russiaFlag"  src="https://upload.wikimedia.org/wikipedia/commons/d/d4/Flag_of_Russia.png" width="14" height="12" alt="help icon" />
        <div className="leafletRussia">
          Leaflet Russia
        </div>
      </div>
    </div>
  );
};
