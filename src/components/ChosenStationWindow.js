import React, {useEffect, useState} from "react";
import {SeismicPlot} from "./ChannelsActivity";
import {InfluxDB} from '@influxdata/influxdb-client';
import {getLastTime} from "../utils/timeUtils";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import {createDregMqttClient} from "../utils/mqttClientUtils";
import {formatStationName, parseMetric} from "../utils/formatUtils";

let lastTopic = "#";
const token = "S0vfLq6KkWCrOYGYeDsJ-AD38xbBIUdjJ5tsoeZmlAf1wUOlu99zgepe8-5Bg7GGbdpswaO4wlN8dQTbXCuRgw==";
const org = "04a2af7a92291610";
const url = "http://81.26.80.192:8086";

export const ChosenStationWindow = ({station, setClickedStation, setTemperature}) => {
  const [chosenCharacteristic, setChosenCharacteristic] = useState("min");
  const [chosenTime, setChosenTime] = useState("10m");

  const [channelOneXDrawData, setChannelOneXDrawData] = useState([]);
  const [channelOneYDrawData, setChannelOneYDrawData] = useState([]);
  const [channelOnePlotRange, setChannelOnePlotRange] = useState(getLastTime(chosenTime));

  const [channelTwoXDrawData, setChannelTwoXDrawData] = useState([]);
  const [channelTwoYDrawData, setChannelTwoYDrawData] = useState([]);
  const [channelTwoPlotRange, setChannelTwoPlotRange] = useState(getLastTime(chosenTime));

  const [channelThreeXDrawData, setChannelThreeXDrawData] = useState([]);
  const [channelThreeYDrawData, setChannelThreeYDrawData] = useState([]);
  const [channelThreePlotRange, setChannelThreePlotRange] = useState(getLastTime(chosenTime));

  useEffect(() => {
      console.log("useEffect called");
      setChannelOneXDrawData([]);
      setChannelOneYDrawData([]);

      setChannelTwoXDrawData([]);
      setChannelTwoYDrawData([]);

      setChannelThreeXDrawData([]);
      setChannelThreeYDrawData([]);

      const [oldDate, currentDate] = getLastTime(chosenTime);

      setChannelOnePlotRange([oldDate, currentDate]);
      setChannelTwoPlotRange([oldDate, currentDate]);
      setChannelThreePlotRange([oldDate, currentDate]);

      const queryAPI = new InfluxDB({url, token}).getQueryApi(org);

      const firstChannelDataQuery = `from(bucket: "DREG") |> range(start: -${chosenTime}) |> filter (fn: (r) => r.topic == "DREG/{${station.stationName}}/metric/ch1_${chosenCharacteristic}") |> map (fn: (r) => ({time: r._time, value: r._value}))`;
      const secondChannelDataQuery = `from(bucket: "DREG") |> range(start: -${chosenTime}) |> filter (fn: (r) => r.topic == "DREG/{${station.stationName}}/metric/ch2_${chosenCharacteristic}") |> map (fn: (r) => ({time: r._time, value: r._value}))`;
      const thirdChannelDataQuery = `from(bucket: "DREG") |> range(start: -${chosenTime}) |> filter (fn: (r) => r.topic == "DREG/{${station.stationName}}/metric/ch3_${chosenCharacteristic}") |> map (fn: (r) => ({time: r._time, value: r._value}))`;

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
        console.log("topic: " + topic);
        if (topic === `DREG/{${station.stationName}}/metric/ch1_${chosenCharacteristic}`) {
          const [oldDate, currentDate] = getLastTime(chosenTime);

          const message = parseMetric(payload.toString());

          setChannelOneXDrawData((xDrawData) => [...xDrawData, currentDate]);
          setChannelOneYDrawData((yDrawData) => [...yDrawData, message]);
          setChannelOnePlotRange([oldDate, currentDate]);
        } else if (topic === `DREG/{${station.stationName}}/metric/ch2_${chosenCharacteristic}`) {
          const [oldDate, currentDate] = getLastTime(chosenTime);

          const message = parseMetric(payload.toString());

          setChannelTwoXDrawData((xDrawData) => [...xDrawData, currentDate]);
          setChannelTwoYDrawData((yDrawData) => [...yDrawData, message]);
          setChannelTwoPlotRange([oldDate, currentDate]);
        } else if (topic === `DREG/{${station.stationName}}/metric/ch3_${chosenCharacteristic}`) {
          const [oldDate, currentDate] = getLastTime(chosenTime);

          const message = parseMetric(payload.toString());

          setChannelThreeXDrawData((xDrawData) => [...xDrawData, currentDate]);
          setChannelThreeYDrawData((yDrawData) => [...yDrawData, message]);
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
    , [station, chosenCharacteristic, chosenTime]);

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
          <FormControl size="small" style={{marginBottom: 8}}>
            <InputLabel>Channel Option</InputLabel>
            <Select
              value={chosenCharacteristic}
              label="Channel Option"
              onChange={(e) => {
                console.log(chosenCharacteristic);
                setChosenCharacteristic(e.target.value.valueOf());
                console.log(chosenCharacteristic);
              }}
            >
              <MenuItem value="min">Min</MenuItem>
              <MenuItem value="max">Max</MenuItem>
              <MenuItem value="stddev">Std Dev</MenuItem>
            </Select>
          </FormControl>
        <FormControl size="small" style={{marginBottom: 8}}>
          <InputLabel>Time</InputLabel>
          <Select
            value={chosenTime}
            label="Time"
            onChange={(e) => {
              console.log(chosenTime);
              setChosenTime(e.target.value.valueOf());

              console.log(chosenTime);
            }}
          >
            <MenuItem value="10m">Last 10 minutes</MenuItem>
            <MenuItem value="30m">Last 30 minutes</MenuItem>
            <MenuItem value="1h">Last hour</MenuItem>
            <MenuItem value="12h">Last 12 hours</MenuItem>
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
