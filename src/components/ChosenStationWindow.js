import React, {useEffect, useState} from "react";
import {SeismicPlot} from "./ChannelsActivity";
import mqtt from "precompiled-mqtt";
import {InfluxDB} from '@influxdata/influxdb-client';
import {getLastMinute} from "../utils/timeUtils";

let lastTopic = "#";
const token = "S0vfLq6KkWCrOYGYeDsJ-AD38xbBIUdjJ5tsoeZmlAf1wUOlu99zgepe8-5Bg7GGbdpswaO4wlN8dQTbXCuRgw==";
const org = "04a2af7a92291610";
const url = "http://81.26.80.192:8086";

export const ChosenStationWindow = ({station, setClickedStation}) => {
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
      setChannelOneXDrawData([]);
      setChannelOneYDrawData([]);

      setChannelTwoXDrawData([]);
      setChannelTwoYDrawData([]);

      setChannelThreeXDrawData([]);
      setChannelThreeYDrawData([]);

      const queryAPI = new InfluxDB({url, token}).getQueryApi(org);

      const firstChannelDataQuery = `from(bucket: "DREG") |> range(start: -1m) |> filter (fn: (r) => r.topic == "DREG/{${station.stationName}}/metric/ch1_mid") |> map (fn: (r) => ({time: r._time, value: r._value}))`;
      const secondChannelDataQuery = `from(bucket: "DREG") |> range(start: -1m) |> filter (fn: (r) => r.topic == "DREG/{${station.stationName}}/metric/ch2_mid") |> map (fn: (r) => ({time: r._time, value: r._value}))`;
      const thirdChannelDataQuery = `from(bucket: "DREG") |> range(start: -1m) |> filter (fn: (r) => r.topic == "DREG/{${station.stationName}}/metric/ch3_mid") |> map (fn: (r) => ({time: r._time, value: r._value}))`;

      const dataQuery = async (query, setXDrawData, setYDrawData) => {
        for await (const {values, tableMeta} of queryAPI.iterateRows(query)) {
          const o = tableMeta.toObject(values);
          setXDrawData((xDrawData) => [...xDrawData, new Date(o.time)]);
          setYDrawData((yDrawData) => [...yDrawData, o.value]);
        }
      }
      dataQuery(firstChannelDataQuery, setChannelOneXDrawData, setChannelOneYDrawData);
      dataQuery(secondChannelDataQuery, setChannelTwoXDrawData, setChannelTwoYDrawData);
      dataQuery(thirdChannelDataQuery, setChannelThreeXDrawData, setChannelThreeYDrawData);

      setChannelOnePlotRange(getLastMinute());
      setChannelTwoPlotRange(getLastMinute());
      setChannelThreePlotRange(getLastMinute());

      const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
      const client = mqtt.connect(`ws://81.26.80.192:8080`, {
        clientId: clientId,
        username: "dregserver2",
        password: "T#eP0wer"
      });

      client.on('connect', () => console.log("connected"));
      client.on('disconnect', () => console.log("disconnected"));
      client.unsubscribe(lastTopic);
      client.subscribe(`DREG/{${station.stationName}}/metric/#`);
      lastTopic = `DREG/{${station.stationName}}/metric/#`;

      client.on('message', (topic, payload, packet) => {
        console.log("message: " + payload.toString());
        if (topic === `DREG/{${station.stationName}}/metric/ch1_mid`) {
          const [oldDate, currentDate] = getLastMinute();

          setChannelOneXDrawData((xDrawData) => [...xDrawData, currentDate]);
          setChannelOneYDrawData((yDrawData) => [...yDrawData, parseInt(payload.toString())]);
          setChannelOnePlotRange([oldDate, currentDate]);
        } else if (topic === `DREG/{${station.stationName}}/metric/ch2_mid`) {
          const [oldDate, currentDate] = getLastMinute();

          setChannelTwoXDrawData((xDrawData) => [...xDrawData, currentDate]);
          setChannelTwoYDrawData((yDrawData) => [...yDrawData, parseInt(payload.toString())]);
          setChannelTwoPlotRange([oldDate, currentDate]);
        } else if (topic === `DREG/{${station.stationName}}/metric/ch3_mid`) {
          const [oldDate, currentDate] = getLastMinute();

          setChannelThreeXDrawData((xDrawData) => [...xDrawData, currentDate]);
          setChannelThreeYDrawData((yDrawData) => [...yDrawData, parseInt(payload.toString())]);
          setChannelThreePlotRange([oldDate, currentDate]);
        }
      });

      return (() => {
        client.unsubscribe(lastTopic);
        client.end();
      });
    }
    , [station]);

  return (
    <div className="chosenStationWindow">
      <div className="stationName">
        <div style={{margin: "auto"}}>
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
        <SeismicPlot name="Channel 1 mid:"
                     color={"#fd5050"}
                     range={channelOnePlotRange}
                     xData={channelOneXDrawData} yData={channelOneYDrawData}/>
        <SeismicPlot name="Channel 2 mid:"
                     color={"#00ff00"}
                     range={channelTwoPlotRange}
                     xData={channelTwoXDrawData} yData={channelTwoYDrawData}/>
        <SeismicPlot name="Channel 3 mid:"
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
