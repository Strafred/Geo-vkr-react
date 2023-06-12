export const getLastMinute = () => {
  const start = new Date();
  const end = new Date(start);
  start.setMinutes(start.getMinutes() - 1);
  return [start, end];
}