export function formatNumber(num) {
  if (Number.isInteger(num)) {
    return num.toLocaleString(); // Formats integers with commas
  } else if (num.toFixed(3) % 1 === 0) {
    return num.toFixed(0); // Formats numbers with 3 or fewer decimals without trailing zeros
  } else {
    return num.toFixed(3).replace(/(\d)(?=(\d{3})+\.)/g, '$1,').slice(0, -1); // Formats numbers with more than 3 decimals
  }
}