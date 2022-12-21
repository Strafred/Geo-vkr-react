import Plot from "react-plotly.js";
import {filter, miniseed} from "seisplotjs";
import React, {useEffect, useState} from "react";

function SeisPlot(props) {
  const range = props.range;

  const layout = {
    xaxis: {range: range, showline: false, mirror: 'allticks', showticklabels: false},
    yaxis: {zeroline: false, visible: false, showgrid: false, showline: false, showticklabels: false},
    hovermode: 'closest',
    showlegend: false,
    width: 190,
    height: 50,
    // yaxis: {domain: [0, 0.33], fixedrange: true,},
    // yaxis2: {domain: [0.33, 0.66], fixedrange: true,},
    // yaxis3: {domain: [0.66, 1], fixedrange: true,},
    margin: {l: 0, r: 0, b: 0, t: 1},
    pad: {l: 4}
  }

  const data = props.seis.map(trace => {
    return {
      name: trace.channelCode,
      x: props.dates,
      y: trace?.y,
      line: {
        width: 0.5,
        color: 'rgb(74,110,164)',
      },
      showlegend: false,
      hoverinfo: 'none',
    }
  })
  data[1].yaxis = 'y2';
  data[2].yaxis = 'y3';

  return (
    <Plot
      data={data}
      layout={layout}
      config={{
        modeBarButtonsToRemove: ['toImage', 'zoom2d', 'pan2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', "resetScale"],
        displaylogo: false,
      }}
    />
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
  const start = new Date('2022-03-31T18:00:00.000Z'); // TODO: now - 30 minutes;
  const end = new Date('2022-03-31T18:30:00.000Z'); // TODO: now;
  const station = stationName;
  const [seismograms, setSeismograms] = useState([]);

  console.log("rerender...")

  useEffect(() => {
    setSeismograms([]);
    getDataFromStation(station, start, end).then(
      (seismos) => {
        setSeismograms(seismos);
      }
    );
  }, [station]);

  console.log(seismograms);

  return seismograms.length > 0 ? <SeisPlot range={[start, end]} seis={seismograms}/> : <div></div>;
}