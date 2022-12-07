function StationInfo({station}) {
  return (
    <div className="stationInfo">
    <div className="stationInfoHeader">
      <div>
      Station Info
      </div>
      {/*<div className="questionMark">*/}
      {/*  <img src="https://www.freeiconspng.com/uploads/help-icon-9.png" width="20" height="20" alt="help icon" />*/}
      {/*</div>*/}
    </div>
    <div className="stationCharacteristics">
      <div className="stationChar"><strong>Latitude:</strong> {station.latitude}</div>
      <div className="stationChar"><strong>Longitude:</strong> {station.longitude}</div>
      <div className="stationChar"><strong>Elevation:</strong> {station.elevation}</div>
    </div>
    </div>
  );
}

StationInfo.propTypes = {};
export const ChosenStationWindow = ({station, setChosenStation}) => {
  return (
    <div className="chosenStationWindow">
      <div className="stationName">
        <div>
        {station.stationName}
        </div>
        <img className="x" onClick={() => setChosenStation(null)} src="https://www.freeiconspng.com/uploads/close-button-png-20.png" width="24" height="20" alt="help icon" />
      </div>
      <div className="stationContent">
        <div className="network">
          {station.network}
        </div>
        <a className="plotRef" href="https://dataview.raspberryshake.org/#/AM/RA2A6/00/EHZ">See 24-hr Plot</a>
        <StationInfo station={station}/>
      </div>
    </div>);
};