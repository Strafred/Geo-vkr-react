export const getLastTime = (chosenTime) => {
  const start = new Date();
  const end = new Date(start);

  if (chosenTime === "10m") {
    start.setMinutes(start.getMinutes() - 10);
    return [start, end];
  } else if (chosenTime === "30m") {
    start.setMinutes(start.getMinutes() - 30);
    return [start, end];
  } else if (chosenTime === "1h") {
    start.setHours(start.getHours() - 1);
    return [start, end];
  } else if (chosenTime === "12h") {
    start.setHours(start.getHours() - 12);
    return [start, end];
  } else if (chosenTime === "1d") {
    start.setHours(start.getHours() - 24);
    return [start, end];
  } else if (chosenTime === "3d") {
    start.setHours(start.getHours() - 72);
    return [start, end];
  }
}
