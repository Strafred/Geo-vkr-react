import React, {useEffect, useState} from "react";
import {SeismicPlot} from "./ChannelsActivity";
import {InfluxDB} from '@influxdata/influxdb-client';
import {getLastMinute} from "../utils/timeUtils";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import {createDregMqttClient} from "../utils/mqttClientUtils";
import {formatStationName} from "../utils/formatUtils";

let lastTopic = "#";
const token = "S0vfLq6KkWCrOYGYeDsJ-AD38xbBIUdjJ5tsoeZmlAf1wUOlu99zgepe8-5Bg7GGbdpswaO4wlN8dQTbXCuRgw==";
const org = "04a2af7a92291610";
const url = "http://81.26.80.192:8086";

export const ChosenStationWindow = ({station, setClickedStation, setTemperature}) => {
  const [chosenCharacteristic, setChosenCharacteristic] = useState("mid");

  const [channelOneXDrawData, setChannelOneXDrawData] = useState([]);
  const [channelOneYDrawData, setChannelOneYDrawData] = useState([]);
  const [channelOnePlotRange, setChannelOnePlotRange] = useState(getLastMinute());

  const [channelTwoXDrawData, setChannelTwoXDrawData] = useState([]);
  const [channelTwoYDrawData, setChannelTwoYDrawData] = useState([]);
  const [channelTwoPlotRange, setChannelTwoPlotRange] = useState(getLastMinute());

  const [channelThreeXDrawData, setChannelThreeXDrawData] = useState([]);
  const [channelThreeYDrawData, setChannelThreeYDrawData] = useState([]);
  const [channelThreePlotRange, setChannelThreePlotRange] = useState(getLastMinute());

  useEffect(() => {
      console.log("useEffect called");
      setChannelOneXDrawData([]);
      setChannelOneYDrawData([]);

      setChannelTwoXDrawData([]);
      setChannelTwoYDrawData([]);

      setChannelThreeXDrawData([]);
      setChannelThreeYDrawData([]);

      const queryAPI = new InfluxDB({url, token}).getQueryApi(org);

      const firstChannelDataQuery = `from(bucket: "DREG") |> range(start: -90s) |> filter (fn: (r) => r.topic == "DREG/{${station.stationName}}/metric/ch1_${chosenCharacteristic}") |> map (fn: (r) => ({time: r._time, value: r._value}))`;
      const secondChannelDataQuery = `from(bucket: "DREG") |> range(start: -90s) |> filter (fn: (r) => r.topic == "DREG/{${station.stationName}}/metric/ch2_${chosenCharacteristic}") |> map (fn: (r) => ({time: r._time, value: r._value}))`;
      const thirdChannelDataQuery = `from(bucket: "DREG") |> range(start: -90s) |> filter (fn: (r) => r.topic == "DREG/{${station.stationName}}/metric/ch3_${chosenCharacteristic}") |> map (fn: (r) => ({time: r._time, value: r._value}))`;

      const dataQuery = async (query, setXDrawData, setYDrawData) => {
        for await (const {values, tableMeta} of queryAPI.iterateRows(query)) {
          const o = tableMeta.toObject(values);
          console.log(o.time);
          setXDrawData((xDrawData) => [...xDrawData, new Date(o.time)]);
          setYDrawData((yDrawData) => [...yDrawData, o.value]);
        }
      }

      dataQuery(firstChannelDataQuery, setChannelOneXDrawData, setChannelOneYDrawData)
        .then(() => {
          console.log("setting range to: ")
          console.log([channelOneXDrawData[0], channelOneXDrawData[channelOneXDrawData.length - 1]])
          // setChannelOnePlotRange(getLastMinute());
          // setChannelOnePlotRange([channelOneXDrawData[0], channelOneXDrawData[channelOneXDrawData.length - 1]]);
        });
      dataQuery(secondChannelDataQuery, setChannelTwoXDrawData, setChannelTwoYDrawData)
        .then(() => {
          console.log("setting range to: ")
          console.log([channelTwoXDrawData[0], channelTwoXDrawData[channelTwoXDrawData.length - 1]])
          // setChannelTwoPlotRange(getLastMinute());
          // setChannelTwoPlotRange([channelTwoXDrawData[0], channelTwoXDrawData[channelTwoXDrawData.length - 1]]);
        });
      dataQuery(thirdChannelDataQuery, setChannelThreeXDrawData, setChannelThreeYDrawData)
        .then(() => {
          console.log("setting range to: ")
          console.log([channelThreeXDrawData[0], channelThreeXDrawData[channelThreeXDrawData.length - 1]])
          // setChannelThreePlotRange(getLastMinute());
          // setChannelThreePlotRange([channelThreeXDrawData[0], channelThreeXDrawData[channelThreeXDrawData.length - 1]]);
        });

      const client = createDregMqttClient();
      client.unsubscribe(lastTopic);
      client.subscribe(`DREG/{${station.stationName}}/metric/#`);
      lastTopic = `DREG/{${station.stationName}}/metric/#`;

      client.on('message', (topic, payload) => {
        console.log("message: " + payload.toString());
        if (topic === `DREG/{${station.stationName}}/metric/ch1_${chosenCharacteristic}`) {
          const [oldDate, currentDate] = getLastMinute();

          setChannelOneXDrawData((xDrawData) => [...xDrawData, currentDate]);
          setChannelOneYDrawData((yDrawData) => [...yDrawData, parseInt(payload.toString())]);
          setChannelOnePlotRange([oldDate, currentDate]);
        } else if (topic === `DREG/{${station.stationName}}/metric/ch2_${chosenCharacteristic}`) {
          const [oldDate, currentDate] = getLastMinute();

          setChannelTwoXDrawData((xDrawData) => [...xDrawData, currentDate]);
          setChannelTwoYDrawData((yDrawData) => [...yDrawData, parseInt(payload.toString())]);
          setChannelTwoPlotRange([oldDate, currentDate]);
        } else if (topic === `DREG/{${station.stationName}}/metric/ch3_${chosenCharacteristic}`) {
          const [oldDate, currentDate] = getLastMinute();

          setChannelThreeXDrawData((xDrawData) => [...xDrawData, currentDate]);
          setChannelThreeYDrawData((yDrawData) => [...yDrawData, parseInt(payload.toString())]);
          setChannelThreePlotRange([oldDate, currentDate]);
        } else if (topic === `DREG/{${station.stationName}}/metric/temperature`) {
          setTemperature(parseFloat(payload.toString()));
        }
      });

      return (() => {
        client.unsubscribe(lastTopic);
        client.end();
      });
    }
    , [station, chosenCharacteristic]);

  return (
    <div className="chosenStationWindow">
      <div className="stationName">
        <div style={{marginLeft: 53}}>
          {formatStationName(station.stationName)}
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
          <FormControl size="small" style={{marginBottom: 5}}>
            <InputLabel id="demo-simple-select-label">Channel Option</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={chosenCharacteristic}
              label="Channel Option"
              onChange={(e) => {
                console.log(chosenCharacteristic);
                setChosenCharacteristic(e.target.value.valueOf());
                console.log(chosenCharacteristic);
              }}
            >
              <MenuItem value="mid">Mid</MenuItem>
              <MenuItem value="min">Min</MenuItem>
              <MenuItem value="max">Max</MenuItem>
            </Select>
          </FormControl>
        <SeismicPlot name="CH 1:"
                     color={"#fd5050"}
                     range={channelOnePlotRange}
                     xData={channelOneXDrawData} yData={channelOneYDrawData}/>
        <SeismicPlot name="CH 2:"
                     color={"#56ee56"}
                     range={channelTwoPlotRange}
                     xData={channelTwoXDrawData} yData={channelTwoYDrawData}/>
        <SeismicPlot name="CH 3:"
                     color={"#005896"}
                     range={channelThreePlotRange}
                     xData={channelThreeXDrawData} yData={channelThreeYDrawData}/>
        <div className="stationInfoBlock">
          <div className="stationInfo">
            <div className="stationInfoHeader">
              <div>
                Station Info
              </div>
            </div>
            <div className="stationCharacteristics">
              <div className="stationChar"><strong>Latitude:&nbsp;</strong>
                <div>{station.latitude}</div>
              </div>
              <div className="stationChar"><strong>Longitude:&nbsp;</strong>{station.longitude}</div>
            </div>
          </div>
        </div>
      </div>
    </div>);
};
