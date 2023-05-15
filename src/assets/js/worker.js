import { Grid } from "./HSWFC.js";

let grid;
const batchSize = 256;
let autoStepSize = 1;
let lock = false;

self.onmessage = ({ data: { question, value } }) => {
  if (question === "init") {
    const width = value[0];
    const tileset = value[1];
    const adjacencies = value[2];
    const index = value[3];

    grid = new Grid(width, tileset, adjacencies, index, autoStepSize);

    grid.initialize().then(() => {
      self.postMessage({
        grid: grid.getState(),
        message: "doneInit",
      });
    });
  } else if (question === "update") {
    for (let i = 0; i < batchSize; i++) {
      grid.update();
    }
    self.postMessage({
      grid: {
        ...grid.getState(),
        canRedo: grid.redoStack.length > 0,
        canUndo: grid.undoStack.length > 0,
      },
      message: "doneUpdate",
    });
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
        if (i >= 0 && i < grid.gridSize && j >= 0 && j < grid.gridSize) {
          grid.manualCollapse(i, j, tileIndex);
        }
      }
    }
  } else if (question === "auto") {
    if (!lock) {
      grid.autoCollapse(autoStepSize);
    }
    self.postMessage({ grid: grid.getState(), message: "doneAuto" });
  } else if (question === "clear") {
    // console.log("Clearing");
    grid.clearQueue();
  } else if (question === "reset") {
    grid.initialize();
  } else if (question === "undo") {
    grid.undo();
  } else if (question === "redo") {
    grid.redo();
  } else if (question === "checkpoint") {
    grid.checkpoint();
  } else if (question === "step") {
    autoStepSize = value;
  } else if (question === "onestep") {
    if (value) {
      grid.autoCollapse(value);
    } else {
      grid.autoCollapse(autoStepSize);
    }
    grid.update();
    self.postMessage({ grid: grid.getState(), message: "doneStep" });
  } else if (question === "lock") {
    lock = true;
  } else if (question === "unlock") {
    lock = false;
  } else if (question === "snapshot") {
    grid.snapshot(value);
  } else if (question === "load snapshot") {
    grid.loadSnapshot(value);
  }
};
