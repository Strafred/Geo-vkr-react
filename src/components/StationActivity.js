import React from "react";
import {Availability} from "./Availability";
import 'react-day-picker/dist/style.css';
import {DayPicker} from "react-day-picker";
import '../styles/StationWindow.css';

export const StationActivity = ({station, setClickedStation}) => {
  const [isStartDateChoosing, setIsStartDateChoosing] = React.useState(false);
  const [isEndDateChoosing, setIsEndDateChoosing] = React.useState(false);
  const [startDateSelected, setStartDateSelected] = React.useState(null);
  const [endDateSelected, setEndDateSelected] = React.useState(null);

  const selectStartDate = (time) => {
    setIsStartDateChoosing(false);
    setStartDateSelected(time);
  }

  const selectEndDate = (time) => {
    setIsEndDateChoosing(false);
    setEndDateSelected(time);
  }

  console.log(isStartDateChoosing);
  console.log(isEndDateChoosing);
  console.log(startDateSelected);
  console.log(endDateSelected);

  return <>
    {isStartDateChoosing && <div className="calendar">
      <DayPicker
        mode="single"
        selected={startDateSelected}
        onSelect={selectStartDate}
      />
    </div>}
    {isEndDateChoosing && <div className="calendar">
      <DayPicker
      mode="single"
      selected={endDateSelected}
      onSelect={selectEndDate}
    />
    </div>}
    <div className="stationActivityWindow">
    <div className="stationName">
      <div style={{margin: "auto"}}>
        {station.stationName} availability
      </div>
      <img className="x" onClick={() => {
        setClickedStation("");
      }} src="https://www.freeiconspng.com/uploads/close-button-png-20.png" width="25" height="20"
           alt="close station window"/>
    </div>
      <div className="datepicker">
        <button type={"button"} onClick={() => {setIsStartDateChoosing(!isStartDateChoosing)}}>{startDateSelected ? startDateSelected.toLocaleDateString() : <div>Start Date</div>}</button>
        <button type={"button"} onClick={() => {setIsEndDateChoosing(!isEndDateChoosing)}}>{endDateSelected ? endDateSelected.toLocaleDateString() : <div>End Date</div>}</button>
      </div>
    <Availability station={station.stationName} start={startDateSelected} end={endDateSelected}/>
  </div>
  </>
}