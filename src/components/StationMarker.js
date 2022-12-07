import React, {useState} from "react";
import {markerIcon, markerIconClicked, markerIconHovered} from "../constants/stationMarker";
import {Marker, useMap} from "react-leaflet";
import {StationPopup} from "./StationPopup";

export const StationMarker = ({station, chooseStation}) => {
  const [mIcon, setMIcon] = useState(markerIcon);

  const map = useMap();

  return (
    <Marker className="stationMarker"
            position={[station.latitude, station.longitude]}
            icon={mIcon}
            title={"Network: " + station.network + ", station: " + station.stationName}
            eventHandlers={{
              mouseover: () => {
                setMIcon(markerIconHovered);
              },
              mouseout: () => {
                setMIcon(markerIcon);
              },
              click: () => {
                setMIcon(markerIconClicked);
                chooseStation(station);
                map.flyTo([station.latitude, station.longitude], map.getZoom());
              }
            }}>
      {/*<StationPopup station={station}/>*/}
    </Marker>
  );
};