import Plot from "react-plotly.js";
import {filter, miniseed, seismogram} from "seisplotjs";
import React, {useEffect, useRef, useState} from "react";
import '../styles/Map.css'
import {downsamplePlotDataSegment} from "../utils/dataUtils";

export function SeismicPlot(props) {
  const [layout, setLayout] = useState({
    xaxis: {
      range: [props.range[0].getTime(), props.range[1].getTime()],
      tickangle: 0,
      tickfont: {
        family: 'Arial, sans-serif',
        size: 9,
        color: '#005896',
      },
      constrain: 'domain',
    },
    yaxis: {
      range: [props.yData[0], props.yData[props.yData.length - 1]],
    },
    hovermode: 'closest',
    width: 190,
    height: 300,
    margin: {l: 0, r: 0, b: 11, t: 0},
    pad: {l: 4},
  });
  const [allData, setAllData] = useState([]);

  useEffect(() => {
    setLayout(({
      ...layout,
      xaxis: {
        ...layout.xaxis,
        range: [props.range[0].getTime(), props.range[1].getTime()],
      }
    }));
  }, [props.range[0], props.range[1]]);

  useEffect(() => {
    let data = [];
    for (let i = 0; i < props.xData.length; i++) {
      data.push({
        x: props.xData[i],
        y: props.yData[i],
        type: 'scatter',
        mode: 'lines',
        line: {
          color: '#005896',
          width: 10,
        },
        hoverinfo: 'none',
      });
    }
    setAllData(data);
    setLayout(({
      ...layout,
      yaxis: {
        ...layout.yaxis,
        range: [props.yData[0], props.yData[props.yData.length - 1]],
      }
    }));
  }, [props.xData, props.yData]);

  if (props.xData.length === 0 || props.yData.length === 0) {
    return <div className="lds-dual-ring">
    </div>
    // return <div className="noDataWarning">NO DATA
    // </div>
  }

  // console.log(props.xData.length);
  // console.log(props.yData.length);
  // console.log(props.range[0]);
  // console.log(props.range[1]);

  const channel = props.name ? <div>{props.name}</div> : <div/>;

  console.log(allData);
  console.log(layout);
  return (
    <>
      {channel}
      <Plot
        className="seisplot"
        data={[
          {
            x: props.xData,
            y: props.yData,
            type: 'scatter',
            mode: 'lines+markers',
            marker: {color: '#005896', size: 3},
            line: {
              color: '#005896',
              width: 1,
            },
            hoverinfo: 'closest',
          },
        ]}
        layout={ {
          width: 190,
          height: 60,
          xaxis: {
            range: [props.range[0].getTime(), props.range[1].getTime()],
            tickangle: 0,
            tickfont: {
              family: 'Arial, sans-serif',
              size: 9,
              color: '#005896',
            },
            constrain: 'domain',
          },
          margin: {l: 0, r: 0, b: 11, t: 0},
          pad: {l: 4},
          hovermode: 'closest',
          }
        }
        config={{
          modeBarButtonsToRemove: [
          'toImage',
          'sendDataToCloud',
          'autoScale2d',
          'resetScale2d',
          'zoom2d',
          'pan2d',
          'select2d',
          'lasso2d',
          'zoomIn2d',
          'zoomOut2d',
          'hoverClosestCartesian',
          'hoverCompareCartesian',
          'toggleSpikelines',
          'resetViews',
          'toggleHover',
          'resetViewMapbox',
          ],
          displaylogo: false,
        }}
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

export function ChannelsActivity({stationName, setClickedStation}) {
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

  return showGraphics ? <><SeismicPlot name={seismograms[0] ? seismograms[0]._segmentArray[0].channelCode : ""}
                                       color={"#fd5050"}
                                       range={xFirstData.length > 0 ? [xFirstData[0][0], xFirstData[xFirstData.length - 1][xFirstData[xFirstData.length - 1].length - 1]] : [start, end]}
                                       xData={xFirstData} yData={yFirstData}/>
      <SeismicPlot name={seismograms[1] ? seismograms[1]._segmentArray[0].channelCode : ""}
                   color={"#00ff00"}
                   range={xSecondData.length > 0 ? [xSecondData[0][0], xSecondData[xSecondData.length - 1][xSecondData[xSecondData.length - 1].length - 1]] : [start, end]}
                   xData={xSecondData} yData={ySecondData}/>
      <SeismicPlot name={seismograms[2] ? seismograms[2]._segmentArray[0].channelCode : ""}
                   color={"#005896"}
                   range={xThirdData.length > 0 ? [xThirdData[0][0], xThirdData[xThirdData.length - 1][xThirdData[xThirdData.length - 1].length - 1]] : [start, end]}
                   xData={xThirdData} yData={yThirdData}/></> :
    <div className="lds-dual-ring">
    </div>
}