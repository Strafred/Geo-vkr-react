import React, {useEffect, useRef, useState} from 'react';
import '../styles/App.css';
import '../styles/Button.css';
import '../styles/Availability.css';
import '../components/NetworkButton';
import Plot from '../../node_modules/react-plotly.js/react-plotly';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { formatNumber } from "../utils/formatUtils";

ChartJS.register(ArcElement, Tooltip, Legend);

function merge(intervals) {
  intervals.sort((a, b) => new Date(a[0]) - new Date(b[0]));
  let prev = intervals[0];
  let res = [prev];

  for (let curr of intervals) {
    if (new Date(curr[0]) <= new Date(prev[1])) {
      if (new Date(curr[1]) >= new Date(prev[1])) {
        prev[1] = curr[1]
      }
    } else {
      res.push(curr)
      prev = curr
    }
  }
  return res;
}

export const Availability = ({station, start, end}) => {
  const [stationsData, setStationsData] = useState([]);
  const [isDataAvailable, setIsDataAvailable] = useState(true);
  const [workingPercent, setWorkingPercent] = useState(null);
  const [range, setRange] = useState([]);
  let stationRef = useRef(station);

  useEffect(() => {
    console.log(station);
    stationRef.current = station;

    setStationsData([]);
    let stationsData = [];

    let getAvailabilityURL;
    if (!start || !end) {
      getAvailabilityURL = `http://84.237.89.72:8080/fdsnws/availability/1/query?starttime=2022-10-01T00%3A00%3A00&endtime=2022-10-31T00%3A00%3A00&station=${station}`;
    } else {
      let startSegment = start.toLocaleDateString().split(".");
      console.log(startSegment);
      let endSegment = end.toLocaleDateString().split(".");
      console.log(endSegment);
      getAvailabilityURL = `http://84.237.89.72:8080/fdsnws/availability/1/query?starttime=${startSegment[2]}-${startSegment[1]}-${startSegment[0]}T00%3A00%3A00&endtime=${endSegment[2]}-${endSegment[1]}-${endSegment[0]}T00%3A00%3A00&station=${station}`;
    }
    console.log(getAvailabilityURL);
    fetch(getAvailabilityURL)
      .then(response => response.text())
      .then(data => {
        const lines = data.split("\n");
        const numLines = lines.length;
        let allData = [];

        let allIntervals = [];
        for (let i = 1; i < numLines - 1; i++) {
          const line = lines[i];
          const availabilityString = line.split(" ")
          const from = availabilityString[18];
          const to = availabilityString[20];

          const fromDate = Date.parse(from) ? new Date(from) : null;
          const toDate = Date.parse(to) ? new Date(to) : null;
          const fromToInterval = [fromDate.toISOString(), toDate.toISOString()];
          allIntervals.push(fromToInterval);
        }

        if (allIntervals.length === 0) {
          setStationsData([]);
          setIsDataAvailable(false);
          return;
        }
        setIsDataAvailable(true);

        console.log(allIntervals);
        let mergedIntervals = merge(allIntervals);

        let workingTime = mergedIntervals.reduce((acc, interval) => {
          console.log(interval);
          acc += (new Date(interval[1]) - new Date(interval[0])) / 1000;
          return acc;
        }, 0);
        let totalTime;
        if (start && end && ((new Date(mergedIntervals[mergedIntervals.length - 1][1]) - new Date(mergedIntervals[0][0])) < (new Date(end) - new Date(start)))) {
          setRange([start, end]);
          totalTime = (new Date(end) - new Date(start)) / 1000;
        } else {
          setRange([mergedIntervals[0][0], mergedIntervals[mergedIntervals.length - 1][1]]);
          totalTime = (new Date(mergedIntervals[mergedIntervals.length - 1][1]) - new Date(mergedIntervals[0][0])) / 1000;
        }
        setWorkingPercent(workingTime / totalTime);

        mergedIntervals.forEach((interval) => {
          let dataPiece = {
            x: [interval[0], interval[1]],
            y: [1, 1],
            fill: 'tozeroy',
            marker: {
              color: 'rgb(51, 91, 184)', // set color with 50% opacity
              size: 2, // set opacity to 50%
              line: {
                width: 0.5,
              }
            },
            type: 'scatter',
            line: {color: '#3c6cdb'},
            showlegend: false,
            hoverinfo: 'x',
            fillcolor: 'rgba(51, 91, 184, 0.5)',
            fillopacity: 0.5,
          };

          allData.push(dataPiece);
        });

        setStationsData(allData);
      });
  }, [station, start, end]);

  if (!isDataAvailable) {
    return (
      <div className="noDataWarning">NO DATA
      </div>
    )
  }

  if (station !== stationRef.current || stationsData.length === 0) {
    return (
      <div className="lds-dual-ring-availability">
      </div>
    )
  }

  return (
    <>
      <div className="availabilityComponent">
        <Plot data={stationsData}
              layout={{
                width: 280,
                height: 130,
                xaxis: {
                  tickfont: {
                    family: 'Arial, sans-serif',
                    size: 10,
                    color: '#333',
                  },
                  constrain: 'domain',
                  range: range,
                },
                yaxis: {fixedrange: true, range: [0, 1.1]},
                margin: {
                  l: 30,
                  r: 0,
                  b: 20,
                  t: 10,
                  pad: 4,
                },
                hovermode: 'x closest',
                hoverdistance: 1000,
              }}
              config={{
                modeBarButtonsToRemove: ['toImage', 'zoom2d', 'pan2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d'],
                displaylogo: false,
              }}
        />
      </div>
      <Doughnut data={{
        labels: ['Data available', 'Not available'],
        datasets: [{
          data: [workingPercent, 1 - workingPercent],
          backgroundColor: [
            '#3c6cdb',
            '#fd5050',
          ],
          borderColor: [
            '#333',
            '#333',
          ],
          borderWidth: [
            2, 2
          ]
        }]
      }} options={{
        layout: {
          padding: {
            top: 15
          }
        },
      }} plugins={[
        {
          id: "textCenter",
          afterDatasetsDraw(chart) {
            const {ctx, data} = chart;
            const meta = chart.getDatasetMeta(0);

            ctx.font = "bold 35px sans-serif";
            ctx.fillStyle = "#333"
            ctx.textAlign = "center";

            ctx.fillText(`${formatNumber(data.datasets[0].data[0]) * 100}%`, meta.data[0].x, meta.data[0].y);
          }
        }
      ]}/>
    </>
  );
}
