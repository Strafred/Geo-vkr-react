import React from 'react';
import './App.css';

export class StationButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stationName: this.props.stationName,
    };
  }

  render() {
    return (
      <button className="square">
        {this.state.stationName}
      </button>
    )
  }
}
