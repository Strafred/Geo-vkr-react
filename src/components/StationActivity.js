import React, {useState} from "react";
import {Availability} from "./Availability";
import 'react-day-picker/dist/style.css';
import {DayPicker} from "react-day-picker";
import '../styles/StationWindow.css';

export const StationActivity = ({station, setClickedStation}) => {
  const [isStartDateChoosing, setIsStartDateChoosing] = useState(false);
  const [isEndDateChoosing, setIsEndDateChoosing] = useState(false);
  const [startDateSelected, setStartDateSelected] = useState(null);
  const [endDateSelected, setEndDateSelected] = useState(null);

  const [isDatesChosen, setIsDatesChosen] = useState(false);

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
        <div className={isStartDateChoosing ? "square squareFocus" : "square"} onClick={() => {
          setIsDatesChosen(false);
          setIsStartDateChoosing(!isStartDateChoosing);
          setIsEndDateChoosing(false);
        }}>{startDateSelected ? startDateSelected.toLocaleDateString() : <div>Start Date</div>}</div>
        <div className={isEndDateChoosing ? "square squareFocus" : "square"} onClick={() => {
          setIsDatesChosen(false);
          setIsEndDateChoosing(!isEndDateChoosing);
          setIsStartDateChoosing(false);
        }}>{endDateSelected ? endDateSelected.toLocaleDateString() : <div>End Date</div>}</div>
        <div className={"square"} style={isDatesChosen ? {width: 25, backgroundColor: "#00ff00"}: {width: 25}} onClick={() => {
          setIsDatesChosen(!isDatesChosen);
          console.log("DATES ARE CHOSEN!");
        }}>ok
        </div>
      </div>
      <Availability station={station.stationName} start={startDateSelected} end={endDateSelected}/>
    </div>
  </>
}