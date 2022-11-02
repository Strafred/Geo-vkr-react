import React from 'react';
import './App.css';
import './StationButton';
import {StationButton} from "./StationButton";
import Plot from 'react-plotly.js';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


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
    let stationsDataTemp = [];

    const requests = stations.map((station) => {
      const getAvailabilityURL = 'http://84.237.89.72:8080/fdsnws/availability/1/query?starttime=2021-10-01T00%3A00%3A00&merge=overlap&mergegaps=1800&endtime=2021-10-31T00%3A00%3A00&station=' + station;

      fetch(getAvailabilityURL)
        .then(response => response.text())
        .then(data => {
          var lines = data.split("\n");
          var numLines = lines.length;
          var currentSection;
          var sections = [];
          var phrases = [];

          var i;
          var allDataTemp = [];

          for (i = 1; i < numLines - 1; i++) {
            var line = lines[i];
            var puk = line.split(" ")
            var from = puk[18];
            var to = puk[20];

            from = from.replaceAll("T", " ");
            var iend = from.indexOf(".");
            from = from.substring(0, iend);
            // console.log(from);

            to = to.replaceAll("T", " ");
            var iend = to.indexOf(".");
            to = to.substring(0, iend);
            // console.log(to);

            var dataPiece = {
              x: [from, to],
              y: [1, 1],
              fill: 'tozeroy',
              type: 'scatter',
              line: {color: '#1f77b4'},
              showlegend: false,
            }
            allDataTemp.push(dataPiece);
          }
          // var allDataJSON = {allDataTemp}
          // console.log(allDataJSON);

          let stationInfo = {};
          stationInfo['stationName'] = station;
          stationInfo['allData'] = allDataTemp;

          stationsDataTemp.push(stationInfo);
          this.setState({
            stationsData: stationsDataTemp,
          });
        });
    });
    //
    // await sleep(5000);
    //
    //   Promise.all(requests).then(() => {
    //   console.log(stationsDataTemp);
    //   this.setState({
    //     stationsData: stationsDataTemp,
    //   });
    // });
  }

  render() {
    return (
      <div>
        <div className="availability">
        <div>
          {this.state.loadedNetworks.map((network) => (
            <div onClick={() => {
              this.getAvailability(network.networkStations);
              // this.setState({plotName: station.stationName});
            }}>
              <StationButton stationName={network.networkName.nodeValue}/>
            </div>
          ))}
        </div>
        </div>
        {this.state.stationsData.map((station) => (
          <Plot className="graphic"
                data={station.allData}
                layout={ {width: 1500, height: 350, yaxis: {fixedrange: true, range:[0, 1.05]}, title: station.stationName} }
          />
        ))}
      </div>
    )
  }
}
