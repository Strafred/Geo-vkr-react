import React from 'react';
import './styles/App.css';

export class NetworkButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      networkName: this.props.networkName,
    };
  }

  render() {
    return (
      <button className="square">
        {this.state.networkName}
      </button>
    )
  }
}
