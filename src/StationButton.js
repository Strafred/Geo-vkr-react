import React from 'react';
import {MapContainer, Marker, Popup, TileLayer} from "react-leaflet";
import './App.css';
import L from 'leaflet';

export class StationButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stationName: this.props.stationName,
            stationInfo: null,
        };
    }

    getAvailability(){
        const getAvailabilityURL = 'http://84.237.89.72:8080/fdsnws/availability/1/query?starttime=2021-10-01T00%3A00%3A00&endtime=2021-10-31T00%3A00%3A00&station=' + this.state.stationName;

        fetch(getAvailabilityURL)
            .then(response => response.text())
            .then(data => this.setState({stationInfo: data}));
    }

    render() {
        return(
            <button className="square" onClick={() => {
                {this.getAvailability()}
            }}>
                {this.state.stationName}
                <div className="buttonText">
                    {this.state.stationInfo}
                </div>
            </button>
        )
    }
}