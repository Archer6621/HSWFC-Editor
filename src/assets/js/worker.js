import { Grid } from "./HSWFC.js";

let grid;
let autoStepSize = 1;

self.onmessage = ({ data: { question, value, cells } }) => {
  if (question === "init") {
    const width = value[0];
    const height = value[1];
    const tileset = value[2];
    const adjacencies = value[3];
    const index = value[4];

    grid = new Grid(width, height, tileset, adjacencies, index, autoStepSize);

    grid.initialize().then(() => {
      self.postMessage({
        grid: grid.getState(),
        message: "doneInit",
      });
    });
  } else if (question === "update") {
    const modifiedCells = grid.update();
    self.postMessage({
      grid: {
        ...grid.getState(),
        canRedo: grid.redoStack.length > 0,
        canUndo: grid.undoStack.length > 0,
        modifiedCells: modifiedCells,
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
    grid.initialize().then(() => {
      self.postMessage({
        grid: grid.getState(),
        message: "redraw",
      });
    });
  } else if (question === "undo") {
    grid.undo();
    self.postMessage({
      grid: grid.getState(),
      message: "redraw",
    });
  } else if (question === "redo") {
    grid.redo();
    self.postMessage({
      grid: grid.getState(),
      message: "redraw",
    });
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

    self.postMessage({ grid: grid.getState(), message: "doneStep" });
  } else if (question === "lock") {
    grid.lock = true;
  } else if (question === "unlock") {
    grid.lock = false;
  } else if (question === "snapshot") {
    grid.snapshot(value);
  } else if (question === "load snapshot") {
    grid.loadSnapshot(value);
  } else if (question === "collapse path regen") {
    const tileIndex = value[0];

    cells = grid.collapsePathEnqueue(tileIndex);
    self.postMessage({
      grid: grid.getState(),
      message: "process",
      other: cells,
    });
  } else if (question === "prob mod") {
    const edgeIndex = value[0];

    const modifier = value[1];
    grid.setMod(edgeIndex, modifier);
  }
};
