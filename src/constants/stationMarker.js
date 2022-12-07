import L from "leaflet";

export const markerIcon = L.icon({
  iconUrl: 'triangle-gfz.svg',
  popupAnchor: [12, -4]
});

export const markerIconHovered = L.icon({
  iconUrl: './triangle-gfz-hovered.svg',
  popupAnchor: [12, -4]
});

export const markerIconClicked = L.icon({
  iconUrl: 'triangle-gfz-clicked.svg',
  popupAnchor: [12, -4]
})