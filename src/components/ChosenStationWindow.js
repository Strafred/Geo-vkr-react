import React, {useEffect, useState} from "react";
import {io} from "socket.io-client";
import {SeismicPlot} from "./ChannelsActivity";

export const ChosenStationWindow = ({station, setClickedStation}) => {
  const [memoryAvailable, setMemoryAvailable] = useState(null);
  const [packetsCount, setPacketsCount] = useState(null);
  const [xDrawData, setXDrawData] = useState([]);
  const [yDrawData, setYDrawData] = useState([]);

  const start = new Date();
  const end = new Date(start);
  start.setMinutes(start.getMinutes() - 1);
  const [plotRange, setPlotRange] = useState([start, end]);

  // console.log("plotRange: ", plotRange);
  // console.log(xDrawData);
  // console.log(yDrawData);

  useEffect(() => {
      setXDrawData([]);
      setYDrawData([]);

      const start = new Date();
      const end = new Date(start);
      start.setMinutes(start.getMinutes() - 1);

      setPlotRange([start, end]);

      let socket = io.connect("http://localhost:3333");
      socket.on("connect", () => {
        console.log("connected");
      });
      socket.on("disconnect", () => {
        console.log("disconnected");
      });
      socket.on("message", (data) => {
        // console.log(data);
        if (data.topic === `DREG/{${station.stationName}}/debug/lwip_stats/mem_avail`) {
          // console.log("memory available: ", data.message);
          setMemoryAvailable(data.message);
        }
        if (data.topic === `DREG/{${station.stationName}}/gps/pps/count`) {
          // console.log("packets count: ", data.message);
          let currentDate = new Date();
          let oldDate = new Date(currentDate);
          oldDate.setMinutes(oldDate.getMinutes() - 1);

          setXDrawData((xDrawData) => [...xDrawData, currentDate.getTime()]);
          setYDrawData((yDrawData) => [...yDrawData, parseInt(data.message)]);
          setPacketsCount(data.message);
          setPlotRange([oldDate, currentDate]);
        }
      });

      socket.emit("chooseStation", station.stationName);
      return () => {
        socket.disconnect();
      };
    }
  , [station]);

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
          {station.network} network
        </div>
        <div className="activityDescription">Last event:</div>
        <SeismicPlot name="Packets count:"
                     color={"#005896"}
                     range={plotRange}
                     xData={xDrawData} yData={yDrawData}/>
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
              <div className="stationChar"><strong>Memory available:&nbsp;</strong>{memoryAvailable}</div>
              <div className="stationChar"><strong>Packets:&nbsp;</strong>{packetsCount}</div>
            </div>
          </div>
        </div>
      </div>
    </div>);
};
