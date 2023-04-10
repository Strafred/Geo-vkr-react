import Plot from "react-plotly.js";
import {filter, miniseed, seismographconfig, d3, seismogram, seismograph} from "seisplotjs";
import React, {useEffect, useState} from "react";
import '../styles/Map.css'

function SeisPlot(props) {
  console.log(props.xData);
  console.log(props.yData);
  console.log(props.range[0]);
  console.log(props.range[1]);

  const range = props.range;

  // const layout = {
  //   xaxis: {range: range, showline: false, mirror: 'allticks', showticklabels: false},
  //   yaxis: {zeroline: false, visible: false, showgrid: false, showline: false, showticklabels: false},
  //   hovermode: 'closest',
  //   showlegend: false,
  //   width: 190,
  //   height: 50,
  //   // yaxis: {domain: [0, 0.33], fixedrange: true,},
  //   // yaxis2: {domain: [0.33, 0.66], fixedrange: true,},
  //   // yaxis3: {domain: [0.66, 1], fixedrange: true,},
  //   // margin: {l: 0, r: 0, b: 0, t: 1},
  //   // pad: {l: 4}
  // }

  const pukaut = {
    xaxis: {autorange: true},
    yaxis: {autorange: true},
    hovermode: 'closest',
    width: 200,
    height: 100,
    margin: {l: 0, r: 0, b: 0, t: 1},
    pad: {l: 4}
  }

  // data[1].yaxis = 'y2';
  // data[2].yaxis = 'y3';

  return (
    // <Plot className="seisplot"
    //   data={[
    //     {
    //       x: props.xData,
    //       y: props.yData,
    //       type: 'scatter',
    //       mode: 'lines+markers',
    //       marker: {color: 'red'},
    //       // line: {
    //       //   width: 1,
    //       //   color: 'rgb(26,32,49)',
    //       // },
    //       // showlegend: false,
    //       // hoverinfo: 'none',
    //     }
    //   ]}
    //   layout={pukaut}
    //   // config={{
    //   //   modeBarButtonsToRemove: ['toImage', 'zoom2d', 'pan2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', "resetScale"],
    //   //   displaylogo: false,
    //   // }}
    // />
    <div></div>
  )
}

async function getDataFromStation(station, start, end) {
  const chebykin = filter.createChebyshevI(4, 0.5, filter.LOW_PASS, 0, 1, 0.005);

  let url = 'http://84.237.89.72:8080/fdsnws/dataselect/1/query';
  let query = `?start=${start.toISOString()}&end=${end.toISOString()}&station=${station}`;
  let request = url + query;
  const response = await fetch(request);
  const records = miniseed.parseDataRecords(await response.arrayBuffer());
  let seismograms = miniseed.seismogramPerChannel(records);

  seismograms = seismograms.map(seismogram => filter.applyFilter(chebykin, seismogram));
  return seismograms;
}

export function SeismicPlot({stationName}) {
  const start = new Date('2022-10-05T05:12:00.000Z'); // TODO: now - 30 minutes;
  console.log(start.toISOString());

  const end = new Date('2022-10-05T06:13:01.000Z'); // TODO: now;
  console.log(end.toISOString());

  const station = stationName;

  const [seismograms, setSeismograms] = useState([]);
  const [yData, setYData] = useState([]);
  const [xData, setXData] = useState([]);
  const [msGlobal, setMsGlobal] = useState(null);

  useEffect(() => {
    if (seismograms[0]) {
      // console.log(123);
      console.log(seismograms[0]);
      // console.log(123);

      let div = d3.select('div#daun');
      let seisData = seismogram.SeismogramDisplayData.fromSeismogram(seismograms[0]);

      let ms = seisData.timeWindow._duration._milliseconds;
      let yArrayLength = seismograms[0]?.y.length;
      let msPerStep = ms / yArrayLength;
      setMsGlobal(msPerStep);
      let xArray = [];
      let yArray = [];


      // console.log(ms)
      // console.log(seismograms[0]?.y);

      for (let i = 0; i < seismograms[0]?.y.length; i++) {
        xArray[i] = new Date(start.getTime() + msPerStep * i);
        yArray[i] = seismograms[0]?.y[i]
      }

      setXData(xArray);
      setYData(yArray);
    }
  }, [seismograms]);

  useEffect(() => {
    setSeismograms([]);
    getDataFromStation(station, start, end).then(
      (seismos) => {
        setSeismograms(seismos);
      }
    );
  }, [station]);

  // console.log(seismograms);
  // console.log(xData);
  // console.log(yData);

  return xData && yData ? <SeisPlot range={[start, end]} xData={xData} yData={yData} seis={seismograms}/> : <div></div>;
  // return <div id="daun"></div>
}