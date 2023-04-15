import Plot from "react-plotly.js";
import {filter, miniseed, seismogram} from "seisplotjs";
import React, {useEffect, useRef, useState} from "react";
import '../styles/Map.css'

function SeisPlot(props) {
  const originalRange = props.range;
  const [range, setRange] = useState(props.range);
  const [layout, setLayout] = useState({
    xaxis: {
      range: [range[0], range[1]],
      tickangle: 0,
      tickfont: {
        family: 'Arial, sans-serif',
        size: 9,
        color: '#005896',
      },
      constrain: 'domain',
    },
    yaxis: {
      autorange: true,
      visible: false
    },
    hovermode: 'closest',
    width: 190,
    height: 60,
    margin: {l: 0, r: 0, b: 11, t: 0},
    pad: {l: 4},
  });

  const handleLayoutChange = (data) => {
    let newRange = [data['xaxis.range[0]'], data['xaxis.range[1]']];
    let newDateRange = [new Date(newRange[0]), new Date(newRange[1])];
    if (newDateRange[1] <= originalRange[1] && newDateRange[0] >= originalRange[0]) {
      setRange(newDateRange);
    } else {
      let diffMilliseconds = newDateRange[1] - newDateRange[0];
      if (diffMilliseconds > (originalRange[1] - originalRange[0])) {
        setRange([...originalRange]);
        setLayout({
          ...layout,
          xaxis: {
            ...layout.xaxis,
            range: [...originalRange],
          }
        });
        return;
      }

      if (newDateRange[0] < originalRange[0]) {
        let newRangeEnd = new Date(originalRange[0]);
        newRangeEnd.setMilliseconds(newRangeEnd.getMilliseconds() + diffMilliseconds);

        setRange([originalRange[0], newRangeEnd]);
        setLayout({
          ...layout,
          xaxis: {
            ...layout.xaxis,
            range: [originalRange[0], newRangeEnd],
          }
        });
      } else if (newDateRange[1] > originalRange[1]) {
        let newRangeStart = new Date(originalRange[1]);
        newRangeStart.setMilliseconds(newRangeStart.getMilliseconds() - diffMilliseconds);

        setRange([newRangeStart, originalRange[1]]);
        setLayout({
          ...layout,
          xaxis: {
            ...layout.xaxis,
            range: [newRangeStart, originalRange[1]],
          }
        });
      } else {
        setLayout({
          ...layout,
          xaxis: {
            ...layout.xaxis,
            range: [...range],
          }
        });
      }
    }
  };

  if (props.xData.length === 0 || props.yData.length === 0) {
    return <div className="noDataWarning">NO DATA
    </div>
  }

  // console.log(props.xData.length);
  // console.log(props.yData.length);
  // console.log(props.range[0]);
  // console.log(props.range[1]);

  let allData = [];
  for (let i = 0; i < props.xData.length; i++) {
    allData.push({
      x: props.xData[i],
      y: props.yData[i],
      type: 'scatter',
      line: {
        width: 0.75,
        color: '#005896',
      },
      showlegend: false,
      hoverinfo: 'none',
    })
  }

  return (
    <Plot className="seisplot"
          data={allData}
          layout={layout}
          config={{
            modeBarButtonsToRemove: ['toImage', 'zoom2d', 'pan2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d'],
            displaylogo: false,
          }}
          onRelayout={handleLayoutChange}
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

export function SeismicPlot({stationName, setClickedStation}) {
  const start = new Date('2022-11-24T06:00:00.000Z');
  // start.setHours(start.getHours() - 6); // delay?
  // start.setHours(start.getHours() - 1);
  console.log(start.toISOString());

  const end = new Date('2022-11-24T06:30:00.000Z');
  // end.setHours(end.getHours() - 5); // delay?
  console.log(end.toISOString());

  const [seismograms, setSeismograms] = useState([]);
  const [xData, setXData] = useState([]);
  const [yData, setYData] = useState([]);
  const [showGraphics, setShowGraphics] = useState(false);
  let stationRef = useRef(stationName);

  useEffect(() => {
    if (seismograms[0]) {
      console.log(seismograms[0]);

      let seisData = seismogram.SeismogramDisplayData.fromSeismogram(seismograms[0]);
      let ms = seisData.timeWindow._duration._milliseconds;

      let segmentsFloatArrays = seismograms[0]._segmentArray.flatMap(segment => segment._y);
      const flattenedArray = []
        .concat(...segmentsFloatArrays
          .map(segmentFloatArray => Array.from(segmentFloatArray)));

      console.log(flattenedArray);

      let yArrayLength = flattenedArray.length;
      let msPerStep = ms / yArrayLength;

      let xDatesArrays = [];
      let stepNumber = 0;

      let ySegmentsArray = segmentsFloatArrays.map(floatSegment => {
        let xDatesArray = [];
        for (let i = 0; i < floatSegment.length; i++) {
          xDatesArray[i] = new Date(start.getTime() + msPerStep * stepNumber);
          stepNumber++;
        }
        xDatesArrays.push(xDatesArray);

        return Array.from(floatSegment);
      });

      let xArray = xDatesArrays;
      let yArray = ySegmentsArray;

      // for (let i = 0; i < yArrayLength; i++) {
      //   xArray[i] = new Date(start.getTime() + msPerStep * i);
      //   yArray[i] = flattenedArray[i];
      // }

      const percentToRemove = 2;

      if (xArray.length <= 100) {
        const numToRemove = Math.round(xArray[0].length / (1 / xArray.length * 100 / percentToRemove))
        // const numToRemove = Math.round((percentToRemove / 100) * xArray[0].length);
        xArray[0].splice(0, numToRemove);
        yArray[0].splice(0, numToRemove);
      } else {
        const numToRemove = Math.round((percentToRemove / 100) * xArray.length);
        xArray.splice(0, numToRemove);
        yArray.splice(0, numToRemove);
      }

      console.log(xArray);
      console.log(yArray);

      setXData(xArray);
      setYData(yArray);
      setShowGraphics(true);
    }
  }, [seismograms]);

  useEffect(() => {
    setClickedStation(stationName);
    stationRef.current = stationName;
    setSeismograms([]);
    setXData([]);
    setYData([]);
    setShowGraphics(false);

    console.log(stationName);
    console.log("DAUN");

    let seismos = [];

    const getData = async () => {
      seismos = await getDataFromStation(stationName, start, end);
    };

    getData()
      .then(() => {
        // console.log("пришло is: " + seismos[0].stationCode);
        // console.log("на самом деле is: " + stationRef.current);

        if (!seismos[0]) {
          setShowGraphics(true);
          console.log("NETU NIHERA");
        } else if (seismos[0].stationCode === stationRef.current) {
          setSeismograms(seismos);
        }
      });

  }, [stationName]);

  console.log(seismograms);
  console.log(stationName);
  // console.log(xData);
  // console.log(yData);

  return showGraphics ? <SeisPlot range={[xData[0][0], end]} xData={xData} yData={yData} seis={seismograms}/> :
    <div className="lds-dual-ring">
    </div>
}