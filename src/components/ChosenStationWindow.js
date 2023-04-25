import React from "react";
import {SeismicPlot} from "./SeismicPlot";

function StationInfo({station}) {
  console.log(station);
  return (
    <div className="stationInfoBlock">
      <div className="stationInfo">
        <div className="stationInfoHeader">
          <div>
            Station Info
          </div>
        </div>
        <div className="stationCharacteristics">
          <div className="stationChar"><strong>Latitude:&nbsp;</strong>{station.latitude}</div>
          <div className="stationChar"><strong>Longitude:&nbsp;</strong>{station.longitude}</div>
          <div className="stationChar"><strong>Elevation:&nbsp;</strong>{station.elevation}</div>
        </div>
      </div>
    </div>
  );
}

StationInfo.propTypes = {};
export const ChosenStationWindow = ({station, setClickedStation}) => {
  const start = new Date();
  const end = new Date(start);
  start.setHours(start.getHours() - 6);
  start.setMinutes(start.getMinutes() - 30);
  end.setHours(end.getHours() - 6);

  return (
    <div className="chosenStationWindow">
      <div className="stationName">
        <div style={{marginLeft: 50}}>
          {station.stationName}
        </div>
        <img className="x" onClick={() => {
          setClickedStation("");
        }} src="https://www.freeiconspng.com/uploads/close-button-png-20.png" width="25" height="20"
             alt="close station window"/>
      </div>
      <div className="stationContent">
        <div className="stationNetwork">
          {station.network}
        </div>
        <div className="activityDescription">Last event<br></br>{start.toLocaleString()} - <br></br>{end.toLocaleString()}:</div>
        <SeismicPlot stationName={station.stationName} setClickedStation={setClickedStation}/>
        {/*<a className="plotRef">...see activity plots</a>*/}
        <StationInfo station={station}/>
      </div>
    </div>);
}
