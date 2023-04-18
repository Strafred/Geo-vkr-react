import React from 'react';
import '../styles/App.css';
import '../styles/Button.css';
import '../styles/Availability.css';
import '../components/NetworkButton';
import {NetworkButton} from "../components/NetworkButton";
import Plot from '../../node_modules/react-plotly.js/react-plotly';
import {getNetworks} from "../utils/requestUtils";
import {compareStationsByName} from "../utils/sortStations";

function merge(ranges) {
  var result = [], last;

  ranges.forEach(function (r) {
    if (!last || r[0] > last[1])
      result.push(last = r);
    else if (r[1] > last[1])
      last[1] = r[1];
  });

  return result;
}

export class Availability extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadedNetworks: [],
      stationsData: [],
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
      const getAvailabilityURL = 'http://84.237.89.72:8080/fdsnws/availability/1/query?starttime=2021-10-01T00%3A00%3A00&endtime=2021-10-31T00%3A00%3A00&station=' + station;

      fetch(getAvailabilityURL)
        .then(response => response.text())
        .then(data => {
          const lines = data.split("\n");
          const numLines = lines.length;
          let allData = [];

          let allIntervals = [];
          for (let i = 1; i < numLines - 1; i++) {
            let line = lines[i];
            let availabilityString = line.split(" ")
            let from = availabilityString[18];
            let to = availabilityString[20];

            from = from.replaceAll("T", " ").substring(0, from.indexOf("."));
            to = to.replaceAll("T", " ").substring(0, to.indexOf("."));

            console.log(from, to);

            allIntervals.push([from, to]);
          }

          let mergedIntervals = merge(allIntervals);

          mergedIntervals.forEach((interval) => {
            let dataPiece = {
              x: [interval[0], interval[1]],
              y: [1, 1],
              fill: 'tozeroy',
              type: 'scatter',
              line: {color: '#3c6cdb'},
              showlegend: false,
              hoverinfo: 'x',
              fillcolor: '#bbcaef',
              fillopacity: 0.5,
            }

            allData.push(dataPiece);
          });

          // for (let i = 1; i < numLines - 1; i++) {
            // let line = lines[i];
            // let availabilityString = line.split(" ")
            // let from = availabilityString[18];
            // let to = availabilityString[20];
            //
            // from = from.replaceAll("T", " ").substring(0, from.indexOf("."));
            // to = to.replaceAll("T", " ").substring(0, to.indexOf("."));

            // let dataPiece = {
            //   x: [from, to],
            //   y: [1, 1],
            //   fill: 'tozeroy',
            //   type: 'scatter',
            //   line: {color: '#496f86'},
            //   showlegend: false,
            //   hoverinfo: 'x',
            //   fillcolor: '#6ea5c9',
            // }
            //
            // allData.push(dataPiece);
          // }

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
      <div className="availabilityComponent">
        <div>
          {this.state.loadedNetworks.map((network) => (
            <div onClick={() => {
              this.getAvailability(network.networkStations);
            }}>
              <NetworkButton networkName={network.networkName.nodeValue}/>
            </div>
          ))}
        </div>
        {this.state.stationsData.sort(compareStationsByName).filter(station => station.allData.length > 0).map((station) => (
          <Plot className="graphic"
                data={station.allData}
                layout={{
                  width: 1500,
                  height: 200,
                  yaxis: {fixedrange: true, range: [0, 1.1]},
                  title: station.stationName,
                  margin: {
                    l: 30,
                    r: 5,
                    b: 20,
                    t: 40,
                    pad: 4,
                  },
                  hovermode: 'x closest',
                  hoverdistance: 1000,
                  fillopacity: 0.5,
                }}
                config={{
                  modeBarButtonsToRemove: ['toImage', 'zoom2d', 'pan2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', "resetScale"],
                  displaylogo: false,
                }}
          />
        ))}
      </div>
    )
  }
}
