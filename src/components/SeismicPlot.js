import Plot from "react-plotly.js";
import {filter, miniseed, seismogram} from "seisplotjs";
import React, {useEffect, useRef, useState} from "react";
import '../styles/Map.css'
import {downsamplePlotDataSegment} from "../utils/dataUtils";

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
      fixedrange: true,
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
        color: props.color,
      },
      showlegend: false,
      hoverinfo: 'none',
    })
  }

  const channel = props.name ? <div>{props.name} channel:</div> : <div/>;

  return (
    <>
      {channel}
      <Plot className="seisplot"
            data={allData}
            layout={layout}
            config={{
              modeBarButtonsToRemove: ['toImage', 'zoom2d', 'pan2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d'],
              displaylogo: false,
            }}
            onRelayout={handleLayoutChange}
      />
    </>
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
  const start = new Date();
  const end = new Date(start);
  start.setHours(start.getHours() - 6);
  start.setMinutes(start.getMinutes() - 30);
  end.setHours(end.getHours() - 6);

  const [seismograms, setSeismograms] = useState([]);

  const [xFirstData, setXFirstData] = useState([]);
  const [yFirstData, setYFirstData] = useState([]);
  const [xSecondData, setXSecondData] = useState([]);
  const [ySecondData, setYSecondData] = useState([]);
  const [xThirdData, setXThirdData] = useState([]);
  const [yThirdData, setYThirdData] = useState([]);

  const [showGraphics, setShowGraphics] = useState(false);
  let stationRef = useRef(stationName);

  const initChannelData = async (seismo, setXData, setYData) => {
    let startingInitDate = new Date();
    console.log(startingInitDate);

    let seismoData = seismogram.SeismogramDisplayData.fromSeismogram(seismo);
    let ms = seismoData.timeWindow._duration._milliseconds;

    let segmentsArray = seismo._segmentArray.flatMap(segment => segment._y);
    let yArrayLength = segmentsArray.reduce((totalLength, segment) => totalLength + segment.length, 0);

    let msPerStep = ms / yArrayLength;

    let xDatesArrays = [];
    let stepNumber = 0;

    let yValuesArrays = segmentsArray.map(ySegment => {
      let xDatesArray = [];
      for (let i = 0; i < ySegment.length; i++) {
        xDatesArray[i] = new Date(start.getTime() + msPerStep * stepNumber);
        stepNumber++;
      }

      const pairsArray = xDatesArray.map((x, index) => [x, ySegment[index]]);
      const downsampledPairsArray = downsamplePlotDataSegment(pairsArray);

      const xPoints = downsampledPairsArray.map(pair => pair[0]);
      const yPoints = downsampledPairsArray.map(pair => pair[1]);

      xDatesArrays.push(xPoints);
      return yPoints;
    });

    let xArray = xDatesArrays;
    let yArray = yValuesArrays;

    const percentToRemove = 3;

    if (xArray.length <= 100) {
      const numToRemove = Math.round(xArray[0].length / (1 / xArray.length * 100 / percentToRemove))
      xArray[0].splice(0, numToRemove);
      yArray[0].splice(0, numToRemove);
    } else {
      const numToRemove = Math.round((percentToRemove / 100) * xArray.length);
      xArray.splice(0, numToRemove);
      yArray.splice(0, numToRemove);
    }

    // console.log(xArray);
    // console.log(yArray);

    let endingInitDate = new Date();
    console.log(endingInitDate);

    setXData(xArray);
    setYData(yArray);
    setShowGraphics(true);
  };

  useEffect(() => {
    if (seismograms[0]) {
      initChannelData(seismograms[0], setXFirstData, setYFirstData)
        .catch(error => console.log(error));
    }
    if (seismograms[1]) {
      initChannelData(seismograms[1], setXSecondData, setYSecondData)
        .catch(error => console.log(error));
    }
    if (seismograms[2]) {
      initChannelData(seismograms[2], setXThirdData, setYThirdData)
        .catch(error => console.log(error));
    }
  }, [seismograms]);

  useEffect(() => {
    setClickedStation(stationName);
    stationRef.current = stationName;
    setSeismograms([]);
    setXFirstData([]);
    setYFirstData([]);
    setXSecondData([]);
    setYSecondData([]);
    setXThirdData([]);
    setYThirdData([]);
    setShowGraphics(false);

    let seismos = [];

    const getData = async () => {
      seismos = await getDataFromStation(stationName, start, end);
    };

    getData()
      .then(() => {
        if (seismos.length === 0) {
          setShowGraphics(true);
        } else if (seismos.filter(seismo => seismo.stationCode !== stationRef.current).length > 0) {
          setShowGraphics(false);
        } else {
          setSeismograms(seismos);
        }
      });
  }, [stationName]);

  // console.log(seismograms);
  // console.log(xFirstData);
  // console.log(yFirstData);

  return showGraphics ? <><SeisPlot name={seismograms[0] ? seismograms[0]._segmentArray[0].channelCode : ""}
                                    color={"#fd5050"}
                                    range={xFirstData.length > 0 ? [xFirstData[0][0], xFirstData[xFirstData.length - 1][xFirstData[xFirstData.length - 1].length - 1]] : [start, end]}
                                    xData={xFirstData} yData={yFirstData}/>
      <SeisPlot name={seismograms[1] ? seismograms[1]._segmentArray[0].channelCode : ""}
                color={"#00ff00"}
                range={xSecondData.length > 0 ? [xSecondData[0][0], xSecondData[xSecondData.length - 1][xSecondData[xSecondData.length - 1].length - 1]] : [start, end]}
                xData={xSecondData} yData={ySecondData}/>
      <SeisPlot name={seismograms[2] ? seismograms[2]._segmentArray[0].channelCode : ""}
                color={"#005896"}
                range={xThirdData.length > 0 ? [xThirdData[0][0], xThirdData[xThirdData.length - 1][xThirdData[xThirdData.length - 1].length - 1]] : [start, end]}
                xData={xThirdData} yData={yThirdData}/></> :
    <div className="lds-dual-ring">
    </div>
}