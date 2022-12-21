import React, {useEffect, useState} from "react";
import {markerIcon, markerIconClicked, markerIconHovered} from "../constants/stationMarkers";
import {Marker, useMap} from "react-leaflet";

export const StationMarker = ({station, chooseStation, clickedStation, setClickedStation}) => {
  const [mIcon, setMIcon] = useState(markerIcon);
  const [isClicked, setIsClicked] = useState(false);
  const map = useMap();

  useEffect(() => {
      if (clickedStation !== station.stationName) {
        setIsClicked(false);
        setMIcon(markerIcon);
      }
    }, [clickedStation]);

  return (
    <Marker className="stationMarker"
            position={[station.latitude, station.longitude]}
            icon={mIcon}
            title={"Network: " + station.network + ", station: " + station.stationName}
            eventHandlers={{
              mouseover: () => {
                if (!isClicked) {
                  setMIcon(markerIconHovered);
                }
              },
              mouseout: () => {
                if (!isClicked) {
                  setMIcon(markerIcon);
                }
              },
              click: () => {
                if (clickedStation !== station.stationName) {
                  setClickedStation(station.stationName);
                  setIsClicked(true);
                  setMIcon(markerIconClicked);
                  chooseStation(station);
                  // map.flyTo([station.latitude, station.longitude], map.getZoom());
                } else {
                  setClickedStation("");
                  setIsClicked(false);
                  setMIcon(markerIcon);
                }
              }
            }}>
    </Marker>
  );
};
