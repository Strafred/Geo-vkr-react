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

      const fluxQuery = `from(bucket: "DREG") |> range(start: -1m) |> filter (fn: (r) => r.topic == "DREG/{23-001}/metric/ch3_max") |> map (fn: (r) => ({time: r._time, value: r._value}))`
      console.log(fluxQuery);
      const myQuery = async () => {
        for await (const {values, tableMeta} of queryAPI.iterateRows(fluxQuery)) {
          const o = tableMeta.toObject(values);
          console.log(o.time);
          console.log(o.value);
          setChannelOneXDrawData((xDrawData) => [...xDrawData, new Date(o.time)]);
          setChannelOneYDrawData((yDrawData) => [...yDrawData, o.value]);
        }
      }
      myQuery();

      const start = new Date();
      const end = new Date(start);
      start.setMinutes(start.getMinutes() - 1);

      setChannelOnePlotRange([start, end]);

      const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
      const client = mqtt.connect(`ws://81.26.80.192:8080`, {
        clientId: clientId,
        username: "dregserver2",
        password: "T#eP0wer"
      });

      client.on('connect', () => console.log("connected"));
      client.on('disconnect', () => console.log("disconnected"));
      client.unsubscribe(lastTopic);
      client.subscribe(`DREG/{${station.stationName}}/metric/ch1_mid`);
      lastTopic = `DREG/{${station.stationName}}/metric/ch1_mid`;
      client.on('message', (topic, payload, packet) => {
        console.log("message: " + payload.toString());
        let currentDate = new Date();
        let oldDate = new Date(currentDate);
        oldDate.setMinutes(oldDate.getMinutes() - 1);

        setChannelOneXDrawData((xDrawData) => [...xDrawData, currentDate]);
        setChannelOneYDrawData((yDrawData) => [...yDrawData, parseInt(payload.toString())]);
        setChannelOnePlotRange([oldDate, currentDate]);
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
        <SeismicPlot name="ch1_mid:"
                     color={"#005896"}
                     range={channelOnePlotRange}
                     xData={channelOneXDrawData} yData={channelOneYDrawData}/>
        <div className="stationInfoBlock">
          <div className="stationInfo">
            <div className="stationInfoHeader">
              <div>
                Station Info
              </div>
            </div>
            <div className="stationCharacteristics">
              <div className="stationChar"><strong>Latitude:&nbsp;</strong><div>{station.latitude}</div></div>
              <div className="stationChar"><strong>Longitude:&nbsp;</strong>{station.longitude}</div>
            </div>
          </div>
        </div>
      </div>
    </div>);
};
