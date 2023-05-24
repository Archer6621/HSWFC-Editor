import { Grid } from "./HSWFC.js";

let grid;
let autoStepSize = 1;

self.onmessage = ({ data: { question, value, cells } }) => {
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
    grid.update();
    self.postMessage({
      grid: {
        ...grid.getState(),
        canRedo: grid.redoStack.length > 0,
        canUndo: grid.undoStack.length > 0,
      },
      message: "doneUpdate",
    });
  } else if (question === "paint") {
    const tileIndex = value[0];
    const coordinates = cells.flatMap((_, i, a) =>
      i % 2 ? [] : [a.slice(i, i + 2)]
    );
    grid.paintEnqueue(coordinates, tileIndex);

    // grid.manualCollapse(x, y, markerSize, tileIndex);
  } else if (question === "auto") {
    if (!grid.lock) {
      grid.autoEnqueue(autoStepSize);
    }
    self.postMessage({ grid: grid.getState(), message: "doneAuto" });
  } else if (question === "clear") {
    // console.log("Clearing");
    // grid.clearQueue();
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
      grid.autoEnqueue(value);
    } else {
      grid.autoEnqueue(autoStepSize * autoStepSize);
    }
    grid.update();
    self.postMessage({ grid: grid.getState(), message: "doneStep" });
  } else if (question === "lock") {
    grid.lock = true;
  } else if (question === "unlock") {
    grid.lock = false;
  } else if (question === "snapshot") {
    grid.snapshot(value);
  } else if (question === "load snapshot") {
    grid.loadSnapshot(value);
  }
};
