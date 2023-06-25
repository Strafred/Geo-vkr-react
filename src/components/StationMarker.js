import React, {useEffect, useState} from "react";
import {markerIcon, markerIconClicked, markerIconHovered} from "../constants/stationMarkers";
import {Marker} from "react-leaflet";

export const StationMarker = ({station, clickedStation, setClickedStation, setTemperature}) => {
  const [mIcon, setMIcon] = useState(markerIcon);
  const [isClicked, setIsClicked] = useState(false);

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
                setMIcon(markerIconHovered);
              },
              mouseout: () => {
                if (isClicked) {
                  setMIcon(markerIconClicked);
                } else {
                  setMIcon(markerIcon);
                }
              },
              click: () => {
                if (clickedStation !== station.stationName) {
                  setClickedStation(station.stationName);
                  setTemperature(null);

                  setIsClicked(true);
                  setMIcon(markerIconClicked);
                  // map.flyTo([station.latitude, station.longitude], map.getZoom()); // buggy
                } else {
                  setClickedStation("");
                  setTemperature(null);

                  setIsClicked(false);
                  setMIcon(markerIcon);
                }
              }
            }}>
    </Marker>
  );
};
