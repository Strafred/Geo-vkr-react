import Plot from "react-plotly.js";
import {filter, miniseed, d3, seismogram} from "seisplotjs";
import React, {useEffect, useState} from "react";
import '../styles/Map.css'

function SeisPlot(props) {
  if (props.xData.length === 0 || props.yData.length === 0) {
    return <div className="noDataWarning">NO DATA
    </div>
  }

  console.log(props.xData.length);
  console.log(props.yData.length);
  console.log(props.range[0]);
  console.log(props.range[1]);

  const layout = {
    xaxis: {
      autorange: true,
      tickangle: 0,
      tickfont: {
        family: 'Arial, sans-serif',
        size: 9,
        color: '#000000',
      },
    },
    yaxis: {
      autorange: true,
      fixedrange: true,
      visible: false
    },
    hovermode: 'closest',
    width: 190,
    height: 60,
    margin: {l: 0, r: 0, b: 12.5, t: 3},
    pad: {l: 4}
  }

  return (
    <Plot className="seisplot"
          data={[
            {
              x: props.xData,
              y: props.yData,
              type: 'scatter',
              line: {
                width: 1,
                color: '#005896',
              },
              showlegend: false,
              hoverinfo: 'none',
            }
          ]}
          layout={layout}
          config={{
            modeBarButtonsToRemove: ['toImage', 'zoom2d', 'pan2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', "resetScale"],
            displaylogo: false,
          }}
    />
  )
}

async function getDataFromStation(station, start, end) {
  const chebyshevFilter = filter.createChebyshevI(4, 0.5, filter.LOW_PASS, 0, 1, 0.005);

  let url = 'http://84.237.89.72:8080/fdsnws/dataselect/1/query';
  let query = `?start=${start.toISOString()}&end=${end.toISOString()}&station=${station}`;
  let request = url + query;
  const response = await fetch(request);

  const records = miniseed.parseDataRecords(await response.arrayBuffer());
  let seismograms = miniseed.seismogramPerChannel(records);

  seismograms = seismograms.map(seismogram => filter.applyFilter(chebyshevFilter, seismogram));
  return seismograms;
}

export function SeismicPlot({stationName}) {
  const start = new Date();
  // start.setHours(start.getHours() - 6);
  start.setHours(start.getHours() - 1);
  console.log(start.toISOString());

  const end = new Date();
  // end.setHours(end.getHours() - 5);
  console.log(end.toISOString());

  const station = stationName;

  const [seismograms, setSeismograms] = useState([]);
  const [yData, setYData] = useState([]);
  const [xData, setXData] = useState([]);
  const [showGraphics, setShowGraphics] = useState(false);

  useEffect(() => {
    if (seismograms[0]) {
      console.log(seismograms[0]);

      let seisData = seismogram.SeismogramDisplayData.fromSeismogram(seismograms[0]);
      console.log(seisData);

      let ms = seisData.timeWindow._duration._milliseconds;
      let segmentFloatArrays = seismograms[0]._segmentArray.flatMap(segment => segment._y);
      const flattenedArray = []
        .concat(...segmentFloatArrays
          .map(segmentFloatArray => Array.from(segmentFloatArray)));

      console.log(flattenedArray);

      let yArrayLength = flattenedArray.length;
      let msPerStep = ms / yArrayLength;
      let xArray = [];
      let yArray = [];

      // console.log(ms)
      // console.log(seismograms[0]?.y);

      for (let i = 0; i < yArrayLength; i++) {
        xArray[i] = new Date(start.getTime() + msPerStep * i);
        yArray[i] = flattenedArray[i];
      }

      const percentToRemove = 1;
      const numToRemove = Math.round((percentToRemove / 100) * xArray.length);
      console.log(numToRemove);
      xArray.splice(0, numToRemove);
      yArray.splice(0, numToRemove);

      setXData(xArray);
      setYData(yArray);
      setShowGraphics(true);

      console.log(xArray);
      console.log(yArray);
    }
  }, [seismograms]);

  useEffect(() => {
    setSeismograms([]);
    setXData([]);
    setYData([]);
    setShowGraphics(false);
    getDataFromStation(station, start, end).then(
      (seismos) => {
        setSeismograms(seismos);
        if (!seismos[0]) {
          setShowGraphics(true);
        }
      }
    );
  }, [station]);

  // console.log(seismograms);
  console.log(xData);
  console.log(yData);

  return showGraphics ? <SeisPlot range={[start, end]} xData={xData} yData={yData} seis={seismograms}/> :
    <div className="lds-dual-ring">
    </div>
}