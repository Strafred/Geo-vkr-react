import React from "react";
import {SeismicPlot} from "./SeismicPlot";

function StationInfo({station}) {
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
export const ChosenStationWindow = ({station, setChosenStation, setClickedStation}) => {
  return (
    <div className="chosenStationWindow">
      <div className="stationName">
        <div>
        {station.stationName}
        </div>
        <img className="x" onClick={() => {
          setChosenStation(null);
          setClickedStation("");
        }} src="https://www.freeiconspng.com/uploads/close-button-png-20.png" width="25" height="20" alt="help icon" />

      </div>
      <div className="stationContent">
        <div className="network">
          {station.network}
        </div>
        <div className="activityDescription">Last event (30 minutes) activity: </div>
        <SeismicPlot stationName={station.stationName}/>
        <a className="plotRef" href="https://dataview.raspberryshake.org/#/AM/RA2A6/00/EHZ">...see activity plots</a>
        <StationInfo station={station}/>
      </div>
    </div>);
};