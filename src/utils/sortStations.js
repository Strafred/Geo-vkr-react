export function compareStationsByName(stationA, stationB) {
  const nameA = stationA.stationName;
  const nameB = stationB.stationName;

  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0;
}
