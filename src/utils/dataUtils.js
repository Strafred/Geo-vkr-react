import {LTTB} from "downsample";

export const downsamplePlotDataSegment = (pairsArray) => {
  const chartWidth = pairsArray.length >= 100000 ? Math.round(pairsArray.length / 100) : Math.round(pairsArray.length / 10);
  return LTTB(pairsArray, chartWidth);
}