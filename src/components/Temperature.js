import React from "react";
import {Doughnut} from "react-chartjs-2";
import {ArcElement, Chart as ChartJS, Legend, Tooltip} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export function Temperature({station, setClickedStation, temperature}) {
  return <div className="stationActivityWindow">
    <div className="stationName">
      <div style={{margin: "auto"}}>
        {station.stationName} temperature
      </div>
      <img className="x" onClick={() => {
        setClickedStation("");
      }} src="https://www.freeiconspng.com/uploads/close-button-png-20.png" width="25" height="20"
           alt="close station window"/>
    </div>
    <div style={{marginTop: -65, marginBottom: -70}}>
      <Doughnut
        data={{
          labels: ["Red", "Orange", "Green"],
          datasets: [{
            data: [temperature, 60 - temperature],
            backgroundColor: [
              '#005896',
              'rgba(46, 204, 113, 1)'
            ],
            borderColor: [
              'rgba(255, 255, 255 ,1)',
              'rgba(255, 255, 255 ,1)',
            ],
            borderWidth: 5,
          }],
        }} options={{
        rotation: -90,
        circumference: 180,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false,
          },
        },
        layout: {
          padding: {
            top: 0,
            bottom: 0,
          },
        },
      }} plugins={[
        {
          id: "textCenter",
          afterDatasetsDraw(chart) {
            const {ctx, data} = chart;
            const meta = chart.getDatasetMeta(0);

            console.log("meta", meta);
            console.log("data", data);
            console.log(data.datasets[0].data[0]);
            ctx.font = "bold 40px sans-serif";
            ctx.fillStyle = "#333"
            ctx.textAlign = "center";

            ctx.fillText(`${(data.datasets[0].data[0])}°`, meta.data[0].x, meta.data[0].y);
          }
        }
      ]}/>
    </div>
  </div>
}
