import React from 'react';
import './App.css';
import './NetworkButton';
import {NetworkButton} from "./NetworkButton";
import Plot from 'react-plotly.js';
import {getNetworks, requestStationsXML} from "./utils/requestUtils";

export class Availability extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadedNetworks: [],
      availability: null,
      stationsData: [],
      dataPiece: null,
      plotName: '',
    };
  }

  componentDidMount() {
    let networks = getNetworks();

    let loadedNetworksTemp = [];
    for (let i = 0; i < networks.length; i++) {
      let networkName = networks[i].getElementsByTagName("Description")[0].firstChild; //get network

      let loadedStationsTemp = [];
      let stations = networks[i].getElementsByTagName("Station"); // get all network stations
      for (let j = 0; j < stations.length; j++) {
        let stationName = stations[j].getElementsByTagName("Site")[0].getElementsByTagName("Name")[0];
        loadedStationsTemp.push(stationName.firstChild.nodeValue);
      }

      let networkInfo = {};
      networkInfo['networkName'] = networkName;
      networkInfo['networkStations'] = loadedStationsTemp;
      loadedNetworksTemp.push(networkInfo);
    }

    this.setState({
      loadedNetworks: loadedNetworksTemp,
    })
  }

  async getAvailability(stations) {
    console.log(stations);
    let stationsData = [];
    stations.map((station) => {
      const getAvailabilityURL = 'http://84.237.89.72:8080/fdsnws/availability/1/query?starttime=2021-10-01T00%3A00%3A00&merge=overlap&mergegaps=1800&endtime=2021-10-31T00%3A00%3A00&station=' + station;

      fetch(getAvailabilityURL)
        .then(response => response.text())
        .then(data => {
          const lines = data.split("\n");
          const numLines = lines.length;
          let allData = [];

          for (let i = 1; i < numLines - 1; i++) {
            let line = lines[i];
            let availabilityString = line.split(" ")
            let from = availabilityString[18];
            let to = availabilityString[20];

            from = from.replaceAll("T", " ");
            from = from.substring(0, from.indexOf("."));
            to = to.replaceAll("T", " ");
            to = to.substring(0, to.indexOf("."));

            let dataPiece = {
              x: [from, to],
              y: [1, 1],
              fill: 'tozeroy',
              type: 'scatter',
              line: {color: '#1f77b4'},
              showlegend: false,
            }

            allData.push(dataPiece);
          }

          let stationInfo = {};
          stationInfo['stationName'] = station;
          stationInfo['allData'] = allData;

          stationsData.push(stationInfo);
          this.setState({
            stationsData: stationsData,
          });
        });
    });
  }

  render() {
    return (
      <div>
        <div>
          {this.state.loadedNetworks.map((network) => (
            <div onClick={() => {
              this.getAvailability(network.networkStations);
            }}>
              <NetworkButton networkName={network.networkName.nodeValue}/>
            </div>
          ))}
        </div>
        {this.state.stationsData.map((station) => (
          <Plot className="graphic"
                data={station.allData}
                layout={{
                  width: 1500,
                  height: 350,
                  yaxis: {fixedrange: true, range: [0, 1.05]},
                  title: station.stationName
                }}
          />
        ))}
      </div>
    )
  }
}
