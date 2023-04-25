import React from "react";
import {Availability} from "../dont need now/Availability";
import 'react-day-picker/dist/style.css';
import { DatePicker } from 'rsuite';

export const StationActivity = ({station, setClickedStation}) => {
  const [startDate, setStartDate] = React.useState(new Date());

  return <><div className="stationActivityWindow">
    <div className="stationName">
      <div style={{margin: "auto"}}>
        {station.stationName} availability
      </div>
      <img className="x" onClick={() => {
        setClickedStation("");
      }} src="https://www.freeiconspng.com/uploads/close-button-png-20.png" width="25" height="20"
           alt="close station window"/>
    </div>
    <Availability station={station.stationName}/>
  </div>
    <div className="datepicker">
    </div>
  </>
}