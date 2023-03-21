import { GridState } from "./HSWFC.js";

let gridState;
const batchSize = 256;
const autoStepSize = 16;

self.onmessage = ({ data: { question, value } }) => {
  if (question === "init") {
    const width = value[0];
    const tileset = value[1];
    const adjacencies = value[2];
    const index = value[3];

    gridState = new GridState(width, tileset, adjacencies, index);
    self.postMessage({
      gridState: gridState,
      message: "doneInit",
    });
  } else if (question === "update") {
    for (let i = 0; i < batchSize; i++) {
      gridState.update();
    }
    self.postMessage({ gridState: gridState, message: "doneUpdate" });
  } else if (question === "manual") {
    const x = value[1];
    const y = value[0];
    const tileIndex = value[2];
    const markerSize = value[3];

    for (
      let i = Math.floor(x - markerSize / 2) + 1;
      i < Math.floor(x + markerSize / 2) + 1;
      i++
    ) {
      for (
        let j = Math.floor(y - markerSize / 2) + 1;
        j < Math.floor(y + markerSize / 2) + 1;
        j++
      ) {
        if (
          i >= 0 &&
          i < gridState.gridSize &&
          j >= 0 &&
          j < gridState.gridSize
        ) {
          gridState.manualCollapse(i, j, tileIndex);
        }
      }
    }
  } else if (question === "auto") {
    gridState.autoCollapse(autoStepSize);
    self.postMessage({ gridState: gridState, message: "doneAuto" });
  } else if (question === "clear") {
    // console.log("Clearing");
    gridState.clearQueue();
  }
};
