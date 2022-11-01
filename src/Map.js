import React from 'react';
import {MapContainer, Marker, Popup, TileLayer} from "react-leaflet";
import './App.css';
import L from 'leaflet';
import './StationButton';

export class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadedStations: [],
      markerIcon: L.icon({
        iconUrl: 'https://geofon.gfz-potsdam.de/img/triangle-gfz.svg',
        popupAnchor: [12, -4]
      }),
      showingAvailability: "null",
    };
  }

  componentDidMount() {
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
        let startDate = channels[i].getAttribute("startDate");

        let latitude = channels[i].getElementsByTagName("Latitude")[0];
        let longitude = channels[i].getElementsByTagName("Longitude")[0];
        let elevation = channels[i].getElementsByTagName("Elevation")[0];
        let depth = channels[i].getElementsByTagName("Depth")[0];
        let azimuth = channels[i].getElementsByTagName("Azimuth")[0];
        let dip = channels[i].getElementsByTagName("Dip")[0];
        let sampleRate = channels[i].getElementsByTagName("SampleRate")[0];

        let count = i + 1;

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

    let xmlHttp;
    if (window.XMLHttpRequest) {
      xmlHttp = new XMLHttpRequest();
    } else {
      xmlHttp = new window.ActiveXObject("Microsoft.XMLHTTP");
    }

    const stationsRequestURL = "http://84.237.89.72:8080/fdsnws/station/1/query?level=station&format=xml";
    xmlHttp.open("GET", stationsRequestURL, false);
    xmlHttp.send()

    let xmlDocResponse = xmlHttp.responseXML;

    let fdsn = xmlDocResponse.getElementsByTagName('FDSNStationXML')[0]; // fdsn
    let networks = fdsn.getElementsByTagName('Network'); // all networks

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

        this.state.loadedStations.push(stationInfo);
      }
    }
  }

  render() {
    this.componentDidMount(); // not asynchronous now..
    return (
      <div>
        <MapContainer className="mapContainer" center={[60, 85]} zoom={2} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {this.state.loadedStations.map((station) => (
            <Marker position={[station.latitude, station.longitude]}
                    icon={this.state.markerIcon}
                    title={"Network: " + station.network + ", station: " + station.stationName}>
              <Popup>
                <div id="div_top_hypers">
                  <ul id="div_top_hypers" className="popupList"><strong>Channel, Latitude, Longitude,
                    Elevation, Depth,
                    Azimuth, Dip, SampleRate:</strong>
                    {station.channels.map((channel) => (
                      <li
                        class="a_top_hypers">{channel.currentChannelName} | {channel.latitude} | {channel.longitude} |
                        {channel.elevation} | {channel.depth} | {channel.azimuth} | {channel.dip} |
                        {channel.sampleRate}
                        + </li>
                    ))}
                  </ul>
                </div>
              </Popup>
            </Marker>
          ))}
        </ MapContainer>
      </div>
    );
  }
}
