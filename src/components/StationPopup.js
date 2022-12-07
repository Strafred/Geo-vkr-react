import {Popup} from "react-leaflet";
import React from "react";

export const StationPopup = ({station}) => {
  return (
    <Popup>
      <ul className="popupList">
        <strong>Channel, Latitude, Longitude,
          Elevation, Depth,
          Azimuth, Dip, SampleRate:</strong>
        {station.channels.map((channel) => (
          <li key={channel.currentChannelName}>{channel.currentChannelName} | {channel.latitude} | {channel.longitude} |
            {channel.elevation} | {channel.depth} | {channel.azimuth} | {channel.dip} |
            {channel.sampleRate}</li>
        ))}
      </ul>
    </Popup>
  );
};