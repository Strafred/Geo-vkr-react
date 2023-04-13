import React, {useEffect, useState} from "react";
import {markerIcon, markerIconClicked, markerIconHovered} from "../constants/stationMarkers";
import {Marker} from "react-leaflet";

export const StationMarker = ({station, clickedStation, setClickedStation}) => {
  const [mIcon, setMIcon] = useState(markerIcon);
  const [isClicked, setIsClicked] = useState(false);
  // const map = useMap(); // for flyTo

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

                  setIsClicked(true);
                  setMIcon(markerIconClicked);
                  // map.flyTo([station.latitude, station.longitude], map.getZoom()); // buggy
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
