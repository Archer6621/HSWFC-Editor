import {
  zeros,
  ones,
  dotMultiply,
  apply,
  flatten,
  sum,
  min,
  sort,
  add,
  floor,
  and,
  subtract,
  or,
  clone,
  random,
  xor,
  reshape,
  sqrt,
  setCartesian,
  map,
  sign,
  round,
  matrix,
  range,
  index,
  pickRandom,
  subset,
  squeeze,
  isUndefined,
  forEach,
} from "mathjs";
import "./init";
import eig from "eigen";

import { Deque } from "@blakeembrey/deque";
import { Map, Set } from "immutable";
import { createPalette } from "hue-map";
// import { SortedArraySet } from "collections/sorted-array-set";
// import { SortedMap } from "collections/sorted-map";
// var SortedSet = require("sorted-set");
// import BTree from "sorted-btree";
// import { SoMap, SoSet } from "somap";
// import * as ProperSkipList from "proper-skip-list";
import Z from "redis-sorted-set";
const SortedSet = Z;
// class QTNode {
//   constructor(parent, xStart, xSize, yStart, ySize) {
//     this.xStart = xStart;
//     this.xSize = xSize;
//     this.yStart = yStart;
//     this.ySize = ySize;
//     this.parent = parent;
//     this.children = [];
//     this.value = Infinity; // NOTE: Could make this the average of children??
//     this.depth = (parent?.depth ?? -1) + 1;
//     this.minChild = null;
//     this.cells = [];
//   }

//   min() {
//     let n = this;
//     while (n.minChild) {
//       n = n.minChild;
//     }
//     return n.value;
//   }
// }

// class MinQuadTree {
//   constructor(w, h, initValue, targets) {
//     const depth = 3;
//     this.values = random([w, h], initValue - 0.001, initValue + 0.001);

//     this.root = new QTNode(null, 0, w, 0, h, 0);
//     this.nodeMap = new Map();
//     this.leaves = [];
//     this.log = false;
//     const q = [this.root];
//     while (q.length > 0) {
//       const next = q.pop();

//       const newSizeX = floor(next.xSize / 2);
//       const newSizeY = floor(next.ySize / 2);

//       // Split into 4
//       const nodeUL = new QTNode(
//         next,
//         next.xStart,
//         newSizeX,
//         next.yStart,
//         newSizeY
//       );
//       const nodeUR = new QTNode(
//         next,
//         next.xStart + newSizeX,
//         newSizeX,
//         next.yStart,
//         newSizeY
//       );
//       const nodeLL = new QTNode(
//         next,
//         next.xStart,
//         newSizeX,
//         next.yStart + newSizeY,
//         newSizeY
//       );
//       const nodeLR = new QTNode(
//         next,
//         next.xStart + newSizeX,
//         newSizeX,
//         next.yStart + newSizeY,
//         newSizeY
//       );
//       // console.log(next.depth);
//       if ((newSizeX > 0 || newSizeY > 0) && next.depth < depth) {
//         next.children.push(...[nodeUL, nodeUR, nodeLL, nodeLR]);
//         next.minChild = nodeUL;
//         q.push(...[nodeUL, nodeUR, nodeLL, nodeLR]);
//       } else {
//         let minVal = Infinity;
//         let minTarget = null;
//         for (const x of range(next.xStart, next.xStart + next.xSize)._data) {
//           for (const y of range(next.yStart, next.yStart + next.ySize)._data) {
//             const target = targets.get([x, y]);
//             this.nodeMap = this.nodeMap.set(target, next);
//             next.cells.push(target);
//             if (this.values[target.x][target.y] < minVal) {
//               minVal = this.values[target.x][target.y];
//               minTarget = target;
//             }
//           }
//         }
//         next.minChild = minTarget;
//         next.value = minVal;
//         this.leaves.push(next);
//         this.set(minTarget, minVal);
//       }
//     }
//     this.root.value = this.root.minChild.value;
//     this.log = true;
//   }

//   min() {
//     let t = this.root;
//     while (!(t instanceof Target)) {
//       t = t.minChild;
//     }
//     // console.log("GETTING MIN:", t);
//     return t;
//   }

//   set(target, value) {
//     // if (this.log) {
//     //   console.log(target, value);
//     // }
//     this.values[target.x][target.y] = value;
//     let node = this.nodeMap.get(target);
//     // if (this.log) {
//     //   console.log("ORIGINAL:", node.value, "NEW: ", value);
//     //   console.log(this);
//     // }
//     if (value === -Infinity) {
//       // console.log("??");
//       // NEed to do something useful here...
//       let minVal = Infinity;
//       let minTarget = null;
//       node.cells.forEach((t) => {
//         const value = this.values[t.x][t.y];
//         if (value >= 0 && value < minVal) {
//           minVal = value;
//           minTarget = t;
//         }
//       });
//       if (minTarget !== null) {
//         node.value = minVal;
//         node.minChild = minTarget;
//       }

//       // find min node
//       let minNodeVal = Infinity;
//       let minNode = null;
//       this.leaves.forEach((n) => {
//         if (n.value > 0 && n.value < minNodeVal) {
//           minNodeVal = n.value;
//           minNode = n;
//         }
//       });

//       while (minNode.parent !== null) {
//         minNode.parent.minChild = minNode;
//         minNode.parent.value = value;
//         minNode = minNode.parent;
//       }
//       // console.log("FIXX: ", minVal, minTarget);
//       return;
//     }

//     if (value <= node.value) {
//       node.value = value;
//       node.minChild = target;
//       while (node.parent !== null) {
//         if (node.parent.value > node.value) {
//           // if (this.log) {
//           //   console.log(
//           //     "--PARENT LARGER:",
//           //     node.parent.value,
//           //     "vs",
//           //     node.value
//           //   );
//           // }
//           node.parent.minChild = node;
//           node.parent.value = value;
//         } else {
//           break;
//         }
//         node = node.parent;
//       }
//     }
//   }
// }

class Target {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  equals(other) {
    return this.x === other.x && this.y === other.y;
  }
}

class CellEntropy {
  constructor(target, value) {
    this.target = target;
    this.value = value;
  }

  equals(other) {
    return this.target.x === other.target.x && this.target.y === other.target.y;
  }

  compare(other) {
    return this.value - other.value;
  }
}

// class SortedArraySet {
//   constructor(capacity) {
//     this.array = [];
//     this.capacity = capacity;
//   }

//   add(entry) {
//     const index = this.array.findIndex((e) => e.target === entry.target);
//     if (index >= 0) {
//       this.array[index] = entry;
//     } else {
//       this.array.push(entry);
//     }

//     this.array = this.array.filter((e) => e.value !== -Infinity);

//     this.array.sort((a, b) => a.value - b.value);
//     if (this.array.length >= this.capacity) {
//       this.array.pop();
//     }
//   }
// }

class Node {
  constructor(name, index) {
    this.name = name;
    this.index = index;
    this.incoming = new Map();
    this.outgoing = new Map();
    this.depth = 0;
  }

  root() {
    for (const parent of this.incoming.keys()) {
      return parent.root();
    }
    return this;
  }

  getDepth(d) {
    for (const parent of this.incoming.keys()) {
      return parent.getDepth(d + 1);
    }
    return d;
  }

  leaves() {
    let s = new Set();
    if (this.outgoing.size === 0) {
      s = s.add(this);
    }
    for (const child of this.outgoing.keys()) {
      for (const leaf of child.leaves()) {
        s = s.add(leaf);
      }
    }
    return s;
  }
}

class Edge {
  constructor(weight) {
    this.weight = weight;
  }
}

class GridState {
  constructor(choices, chosen, entropy, painted) {
    this.index = GridState.i++;
    this.choices = clone(choices);
    this.chosen = clone(chosen);
    this.entropy = clone(entropy);
    this.painted = clone(painted);
  }
}
GridState.i = 0;

export class Grid {
  constructor(gridSize, tileset, adjacencies, invertedIndex, bufferSize) {
    this.entropyBufferSize = bufferSize;
    this.snapshots = {};
    this.undoStack = [];
    this.redoStack = [];
    this.current = null;
    this.counter = 0;
    this.collapseQueue = new Deque();
    this.gridChoices = Object.keys(tileset).length;
    this.gridSize = gridSize;
    this.tileset = tileset;
    this.ALL = range(0, this.gridChoices);
    this.COLOR = range(0, 4);
    this.entropyColors = createPalette({
      map: "autumn",
      steps: this.gridChoices,
    }).format("rgba");
    console.log(this.entropyColors);
    this.index = setCartesian(range(0, gridSize), range(0, gridSize));
    this.targets = ones(this.gridSize, this.gridSize);
    this.painted = zeros(this.gridSize, this.gridSize);
    this.index._data.forEach((ind) => {
      this.targets.set([ind[0], ind[1]], new Target(ind[0], ind[1]));
    });
    this.invIndex = reshape(range(0, this.gridSize * this.gridSize), [
      this.gridSize,
      this.gridSize,
    ]);
    this.offsets = new Map(
      Object.entries({
        D: new Target(1, 0),
        U: new Target(-1, 0),
        L: new Target(0, -1),
        R: new Target(0, 1),
      })
    );

    this.colorMap = new Array(this.gridChoices);
    this.allowed = new Array(this.gridChoices);
    this.nameIndex = new Array(this.gridChoices);
    for (const name in tileset) {
      const tile = tileset[name];
      tile.color.push(255);
      this.colorMap[invertedIndex[name]] = tile.color;
      this.allowed[invertedIndex[name]] = tile.generate;
      this.nameIndex[invertedIndex[name]] = name;
    }

    // Build the DAG
    this.nodeIndex = {};
    for (const n in tileset) {
      this.nodeIndex[n] = new Node(n, invertedIndex[n]);
    }

    for (const n in tileset) {
      const node = tileset[n];
      for (const c in node.children) {
        this.nodeIndex[n].outgoing = this.nodeIndex[n].outgoing.set(
          this.nodeIndex[c],
          new Edge(node.children[c])
        );
        this.nodeIndex[c].incoming = this.nodeIndex[c].incoming.set(
          this.nodeIndex[n],
          new Edge(node.children[n])
        ); // TODO: Maybe better to set edge to undefined, since this is technically not part of the DAG
      }
    }
    this.root = this.nodeIndex[this.nameIndex[0]].root();

    // Set the depths
    for (const n in tileset) {
      this.nodeIndex[n].depth = this.nodeIndex[n].getDepth(0);
    }

    // Precompute all paths
    // Access method: .get(leaf).get(meta)
    this.pathMap = new Map();
    for (const node of this.root.leaves()) {
      console.log("LEAF: ", this.nameIndex[node.index]);
      let tempMap = new Map();
      let q = [node];
      tempMap = tempMap.set(node.index, [[node]]);

      while (q.length > 0) {
        const n = q.pop();
        console.log("  popped", this.nameIndex[n.index]);

        if (!tempMap.has(n.index)) {
          console.log("  initializing...");
          tempMap = tempMap.set(n.index, []);
        }

        for (const c of n.outgoing.keys()) {
          if (tempMap.has(c.index)) {
            const cpaths = tempMap.get(c.index);
            for (const cpath of cpaths) {
              console.log("    pushing", [...cpath, n]);
              tempMap.get(n.index).push([...cpath, n]);
            }
          }
        }

        for (const p of n.incoming.keys()) {
          if (!q.includes(p)) {
            q.unshift(p);
          }
        }

        // Convert path to bitmask representation
        // let tempMaskMap = new Map();
        // for (const [index, path] of tempMap) {
        //   const mask = zeros(this.gridChoices);
        //   for (const vertex of path) {
        //     mask.set([vertex.index], 1);
        //   }
        //   console.log(node.index);
        //   mask.set([node.index], 1);
        //   tempMaskMap = tempMaskMap.set(index, mask);
        // }

        this.pathMap = this.pathMap.set(node.index, tempMap);
      }
    }

    // console.log(
    //   "rootpaths1:",
    //   this.pathMap.get(invertedIndex["grass"]).get(invertedIndex["root"])
    // );

    // console.log(
    //   "rootpaths2:",
    //   this.pathMap.get(invertedIndex["tree"]).get(invertedIndex["root"])
    // );

    // NOTE: If the adjacencies are bad, a giant propagation wave can be triggered right at the start, explains the lag-spike
    this.adj = new Map();
    this.adjaug = new Map();
    this.offsets.forEach((_, key) => {
      const mat = matrix(adjacencies[key]._data);
      this.adj = this.adj.set(key, mat);
      this.adjaug = this.adjaug.set(key, clone(mat));
    });

    // this.allowed = matrix([0, 1, 1, 1, 1]);

    // queue = []
    // for leaf in T.root.leaves:
    //     queue += list(leaf.archetypes.values())
    // while queue:
    //     link = queue.pop(0)
    //     archetype = link.frm
    //     subtype = link.to

    //     print(link)

    //     for atile in archetype.tile_ids:
    //         for stile in subtype.tile_ids:
    //             ADJ_AUG[o][atile, :] |= ADJ_AUG[o][stile, :]
    //             ADJ_AUG[o][:, atile] |= ADJ_AUG[o][:, stile]

    //     queue += list(archetype.archetypes.values())

    // Augment the adjacencies
    this.offsets.forEach((_, key) => {
      console.log(key);
      const q = [];
      for (const leaf of this.root.leaves().keys()) {
        for (const parent of leaf.incoming.keys()) {
          q.push([parent, leaf]);
        }
      }
      while (q.length > 0) {
        const nodes = q.pop();
        const node = nodes[0];
        const child = nodes[1];

        // const allowed = map(apply(and(cur, this.adj), 1, sum), sign);

        const augmentedH = squeeze(
          map(
            add(
              this.adjaug.get(key).subset(index(child.index, this.ALL)),
              this.adjaug.get(key).subset(index(node.index, this.ALL))
            ),
            sign
          )
        );
        const augmentedV = squeeze(
          map(
            add(
              this.adjaug.get(key).subset(index(this.ALL, child.index)),
              this.adjaug.get(key).subset(index(this.ALL, node.index))
            ),
            sign
          )
        );
        this.adjaug.get(key).subset(index(node.index, this.ALL), augmentedH);
        this.adjaug.get(key).subset(index(this.ALL, node.index), augmentedV);

        // console.log(this.adj.subset(index(child.index, this.ALL)));
        // console.log();
        // console.log(hue);

        for (const parent of node.incoming.keys()) {
          q.push([parent, node]);
        }
      }
    });

    // async () => {
    //   await eig.ready;
    //   this.adjaug = eig.Matrix(this.adjaug._data);
    //   this.adjaug.print("M");

    //   console.log("??", this.adjaug);
    // };

    (async () => {
      await eig.ready;
      this.offsets.forEach((_, key) => {
        this.adjaug = this.adjaug.set(
          key,
          new eig.Matrix(this.adjaug.get(key)._data)
        );
      });

      console.log(this.nodeIndex);

      console.log(this.indices([2, 23, 1, 2, 3, 4, 52, 2], 2));

      // Build masks
      this.SM = {};
      this.CM = {};
      this.LM = new eig.Matrix(this.gridChoices, 1, 0); //zeros(this.gridChoices);
      for (const n in tileset) {
        const node = this.nodeIndex[n];
        const children = [];
        const subMask = zeros(this.gridChoices);
        const childMask = zeros(this.gridChoices);
        children.push(...node.outgoing.keys());
        for (const c of children) {
          childMask.set([c.index], 1);
        }

        while (children.length > 0) {
          var child = children.pop();
          subMask.set([child.index], 1);
          children.push(...child.outgoing.keys());
        }
        this.SM[node.index] = subMask;
        this.CM[node.index] = childMask;
        if (node.outgoing.size == 0) {
          this.LM.set(node.index, 1);
        }
      }
    })();
    this.initialize();
  }

  // bufferEntropy(x, y, value) {
  //   // console.log("PROCESSING:", x, y, "VAL:", value);
  //   // console.log("BUFFER", this.entropyBuffer.values());
  //   // // if (value <= this.entropyBuffer.max().value) {
  //   // // console.log(value);
  //   // const ce = new CellEntropy(new Target(x, y), value);
  //   // console.log("CE INSTANCE:", ce);
  //   // console.log("HAS CE INSTANCE:", this.entropyBuffer.has(ce));
  //   // console.log("RANK:", this.entropyBuffer.rank(ce));
  //   // // console.log(this.entropyBuffer.findValue(ce));
  //   // console.log(
  //   //   "BUFF",
  //   //   this.entropyBuffer.map((c) => [
  //   //     c.x,
  //   //     c.y,
  //   //     ":",
  //   //     this.entropy.get([c.x, c.y]),
  //   //   ])
  //   // );
  //   // console.log(this.entropyBuffer);
  //   const target = this.targets.get([x, y]);
  //   // const entr = this.entropy.get([target.x, target.y]);
  //   this.entropyBuffer.add(new CellEntropy(target, value));

  //   if (this.entropyBuffer.array.length === 0) {
  //     this.leastEntropyLegacy()
  //       ._data.slice(0, this.entropyBufferSize)
  //       .forEach((e) => {
  //         this.entropyBuffer.add(
  //           new CellEntropy(
  //             this.targets.get([e[0], e[1]]),
  //             this.entropy.get([e[0], e[1]])
  //           )
  //         );
  //       });
  //   }
  // console.log(this.entropyBuffer.array);

  // if (entr === Infinity) {
  //   this.entropyBuffer.delete(target);
  // }

  // if (this.entropyBuffer.has(target)) {
  //   this.entropyBuffer.delete(target);
  // }

  // // console.log("HAS CE INSTANCE AFTER:", this.entropyBuffer.has(ce));
  // // console.log("RANK AFTER:", this.entropyBuffer.rank(ce));
  // if (this.entropy.get([target.x, target.y]) < Infinity) {
  // } else {
  //   this.entropyBuffer.delete(target);
  // }

  // }

  // if (this.entropyBuffer.length >= this.entropyBufferSize) {
  //   // console.log("T:", this.entropyBuffer._first(-1000));
  //   // console.log(
  //   //   "BUFF AFT",
  //   //   this.entropyBuffer.map((c) => [
  //   //     c.x,
  //   //     c.y,
  //   //     ":",
  //   //     this.entropy.get([c.x, c.y]),
  //   //   ])
  //   // );
  //   const q = this.entropyBuffer.shift();

  //   // console.log("SHIFTED:", q, this.entropy.get([q.x, q.y]));
  // }
  // }

  getState() {
    return {
      image: this.image,
      entropyImage: this.entropyImage,
      nameIndex: this.nameIndex,
      choices: this.choices,
      entropy: this.entropy,
    };
  }

  initialize() {
    this.choices = ones(this.gridSize, this.gridSize, this.gridChoices);
    this.chosen = dotMultiply(
      ones(this.gridSize, this.gridSize),
      this.root.index
    );
    this.image = dotMultiply(
      ones(this.gridSize, this.gridSize, 4),
      this.colorMap[this.root.index]
    );
    this.entropyImage = dotMultiply(
      ones(this.gridSize, this.gridSize, 4),
      this.entropyColors[this.gridChoices - 1]
    );
    this.entropy = dotMultiply(
      ones(this.gridSize, this.gridSize),
      this.gridChoices
    );
    // this.index._data.forEach((i) => {
    //   this.entropy._data[i[0]][i[1]] = this.getCellEntropy(i[0], i[1]);
    // });
    // this.entropy.map(e => )

    const rX = floor(random(this.gridSize));
    const rY = floor(random(this.gridSize));

    // this.minEntropy = new CellEntropy(
    //   this.targets.get([rX, rY]),
    //   this.gridChoices
    // );

    // this.minEntropy = new BTree([], (a, b) => {
    //   if (a === b) {
    //     return 0;
    //   }

    //   return this.entropy._data[a.x][a.y] - this.entropy._data[b.x][b.y];
    // });

    // this.minEntropy = new SoMap([], (a, b) => {
    //   return this.entropy._data[a.x][a.y] - this.entropy._data[b.x][b.y];
    // });
    // this.minEntropy.set(this.targets.get([rX, rY]), this.entropy.get([rX, rY]));
    // console.log(this.minEntropy.min());

    // this.minEntropy = new ProperSkipList();
    // this.minEntropy.upsert(
    //   this.targets.get([rX, rY]),
    //   this.entropy.get([rX, rY])
    // );

    this.minEntropy = new SortedSet();
    this.minEntropy.add(
      this.invIndex._data[rX][rY],
      this.applyEntropyModifiers(this.entropy.get([rX, rY]))
    );
    // console.log(SortedArraySet);
    // this.entropyBuffer = new SortedSet();

    // this.entropyBuffer = new MinPriorityQueue((ce) => ce.value);
    // this.entropyBuffer.add(
    //   new CellEntropy(this.targets.get([0, 0]), this.entropy._data[0][0])
    // );

    // this.entropyBuffer = new SortedArraySet(
    //   [this.targets.get([0, 0])],
    //   null,
    //   (a, b) => this.entropy.get([a.x, a.y]) - this.entropy.get([b.x, b.y])
    // );

    // this.entropyBuffer = new SortedSet({
    //   compare: (a, b) =>
    //     this.entropy.get([a.x, a.y]) - this.entropy.get([b.x, b.y]),
    // });
    // this.entropyBuffer.add(this.targets.get([0, 0]));
    // this.entropyBuffer = new SortedArraySet(16 * this.entropyBufferSize);
    // this.bufferEntropy(0, 0, this.entropy._data[0][0]);

    // this.entropyQT = new MinQuadTree(
    //   this.gridSize,
    //   this.gridSize,
    //   this.gridChoices,
    //   this.targets
    // );

    // console.log(this.entropyQT);

    this.clearQueue();
  }

  // Undo system
  checkpoint() {
    this.undoStack.push(
      new GridState(this.choices, this.chosen, this.entropy, this.painted)
    );
    this.redoStack = [];
    this.current = null;
    console.log("Undo Checkpoint! Stack size: ", this.undoStack.length);
  }

  snapshot(index) {
    this.snapshots[index] = new GridState(
      this.choices,
      this.chosen,
      this.entropy,
      this.painted
    );
  }

  loadSnapshot(index) {
    this.loadGridState(this.snapshots[index]);
  }

  redo() {
    if (this.redoStack.length > 0) {
      const state = this.redoStack.pop();
      this.undoStack.push(this.current);

      this.loadGridState(state);
    }
  }

  undo() {
    // Lazily assign current state; we only need re-do if we've done at least one undo
    if (this.current === null) {
      this.current = new GridState(
        this.choices,
        this.chosen,
        this.entropy,
        this.painted
      );
    }
    if (this.undoStack.length > 0) {
      const state = this.undoStack.pop();
      this.redoStack.push(this.current);
      this.loadGridState(state);
    }
  }

  loadGridState(gridState) {
    console.log("Loaded gridstate: ", gridState);
    this.current = gridState;
    this.clearQueue();
    this.choices = clone(gridState.choices);
    this.chosen = clone(gridState.chosen);
    this.entropy = clone(gridState.entropy);
    this.painted = clone(gridState.painted);

    // We have to re-add what we had done so far
    this.minEntropy = new SortedSet();
    this.leastEntropyLegacy()._data.forEach((le) => {
      const lX = le[0];
      const lY = le[1];
      const entropyValue = this.entropy.get([lX, lY]);

      if (entropyValue > 1 && entropyValue < this.gridChoices - 0.1) {
        this.minEntropy.add(
          this.invIndex._data[lX][lY],
          this.applyEntropyModifiers(entropyValue, {
            painted: this.painted._data[lX][lY],
          })
        );
      }
    });

    if (this.minEntropy.length === 0) {
      // Choose random point
      const rX = floor(random(this.gridSize));
      const rY = floor(random(this.gridSize));

      this.minEntropy.add(
        this.invIndex._data[rX][rY],
        this.applyEntropyModifiers(this.entropy._data[rX][rY], {
          painted: this.painted._data[rX][rY],
        })
      );
    }

    this.refreshImages();
  }

  // Might be better to just store the image... no?
  refreshImages() {
    this.image = this.image.map((v, i, m) => {
      const p = [i[0], i[1]];
      return this.colorMap[this.chosen.get(p)][i[2]];
    });
    this.entropyImage = this.entropyImage.map((v, i, m) => {
      const p = [i[0], i[1]];
      const entropyValue = floor(this.entropy.get(p));
      const color =
        entropyValue <= this.entropyColors.length && entropyValue >= 0
          ? this.entropyColors[floor(entropyValue - 1)]
          : [0, 0, 0, 255];

      return color[i[2]];
    });
  }

  // Entropy Metrics
  // TODO: Implement nicely
  chosenTileDepth(x, y) {
    const chosen = this.chosen.subset(index(x, y));
    if (this.LM.get([chosen])) {
      return -Infinity;
    }
    return this.nodeIndex[this.nameIndex[chosen]].depth;
  }

  bitmaskSum(x, y) {
    const choices = this.choices.subset(index(x, y, this.ALL));
    const s = sum(choices);
    if (s <= 1) {
      return -Infinity;
    }
    return s;
  }

  getCellEntropy(x, y) {
    const bm = this.bitmaskSum(x, y);
    return bm;
  }

  // leastEntropy() {
  //   return this.entropyBuffer.array.map((ce) => [ce.target.x, ce.target.y]);
  //   // const s = flatten(this.entropy);
  //   // const r = range(0, s.size()[0]);
  //   // const idx = sort(r, (a, b) => s._data[a] - s._data[b]);
  //   // return this.index.subset(index(idx, range(0, 2)));
  //   // return matrix([
  //   //   [floor(this.counter / this.gridSize), this.counter++ % this.gridSize],
  //   //   [floor(this.counter / this.gridSize), this.counter++ % this.gridSize],
  //   //   [floor(this.counter / this.gridSize), this.counter++ % this.gridSize],
  //   //   [floor(this.counter / this.gridSize), this.counter++ % this.gridSize],
  //   //   [floor(this.counter / this.gridSize), this.counter++ % this.gridSize],
  //   //   [floor(this.counter / this.gridSize), this.counter++ % this.gridSize],
  //   //   [floor(this.counter / this.gridSize), this.counter++ % this.gridSize],
  //   //   [floor(this.counter / this.gridSize), this.counter++ % this.gridSize],
  //   //   [floor(this.counter / this.gridSize), this.counter++ % this.gridSize],
  //   //   [floor(this.counter / this.gridSize), this.counter++ % this.gridSize],
  //   //   [floor(this.counter / this.gridSize), this.counter++ % this.gridSize],
  //   //   [floor(this.counter / this.gridSize), this.counter++ % this.gridSize],
  //   //   [floor(this.counter / this.gridSize), this.counter++ % this.gridSize],
  //   //   [floor(this.counter / this.gridSize), this.counter++ % this.gridSize],
  //   //   [floor(this.counter / this.gridSize), this.counter++ % this.gridSize],
  //   //   [floor(this.counter / this.gridSize), this.counter++ % this.gridSize],
  //   // ]);
  // }

  leastEntropyQT() {
    const k = this.minEntropy.range(-1);
    // console.log(k);
    const vals = this.index._data[k[0]];
    // console.log("HHH", k);
    // const k = this.minEntropy.minKey();
    // this.minEntropy.delete(k);
    return new Target(vals[0], vals[1]);
  }

  leastEntropyLegacy() {
    const s = flatten(this.entropy);
    const r = range(0, s.size()[0]);
    const idx = sort(r, (a, b) => s._data[a] - s._data[b]);
    return this.index.subset(index(idx, range(0, 2)));
  }

  indices(arr, val = 1) {
    return arr.map((v, u) => (v === val ? u : -1)).filter((v) => v !== -1);
  }

  isEnqueued(collapseTarget) {
    for (const e of this.collapseQueue.entries()) {
      if (
        e[0] === collapseTarget[0] &&
        e[1] === collapseTarget[1] &&
        e[2] === collapseTarget[2]
      ) {
        return true;
      }
    }
    return false;
  }

  autoCollapse(amount = 1) {
    this.collapseQueue.extendLeft(new Array(amount).fill([-1, -1, -1]));
  }

  update() {
    // TODO: Investigate whether it is OK for responsiveness to go from an "if" to a "while"
    while (this.collapseQueue.size > 0) {
      const entry = this.collapseQueue.popLeft();
      let target = entry;
      // Automated collapse; we only fetch the entropy on popping the queue
      if (entry[2] === -1) {
        if (this.minEntropy.length > 0) {
          const le = this.leastEntropyQT();
          if (le !== undefined) {
            target[0] = le.x;
            target[1] = le.y;
            this.collapse(le.x, le.y, -1);
          }
        }
      } else {
        this.collapse(target[0], target[1], target[2]);
      }
    }
  }

  // TODO: add relevant params
  applyEntropyModifiers(entropy, params = {}) {
    if (params?.painted) {
      entropy = sqrt(entropy);
    }
    // Adjust for sorted set and add randomness
    return -entropy + random(0.0001);
  }

  clearQueue() {
    this.collapseQueue.clear();
  }

  manualCollapse(x, y, tile_index) {
    if (!this.isEnqueued([x, y, tile_index])) {
      this.collapseQueue.pushLeft([x, y, tile_index]);
    }
  }

  collapse(x, y, tile_index = -1) {
    // const choices = squeeze(this.choices.subset(index(x, y, this.ALL)));
    const choices = this.choices._data[x][y];

    // const currentTile = this.chosen.subset(index(x, y));
    const currentTile = this.chosen._data[x][y];

    const childMask = this.CM[currentTile];

    // Apply weights
    for (const cidx of this.indices(childMask._data)) {
      const edge = this.nodeIndex[this.nameIndex[currentTile]].outgoing.get(
        this.nodeIndex[this.nameIndex[cidx]]
      );
      childMask._data[cidx] = edge.weight; //.set([cidx], edge.weight);
    }

    let choice = pickRandom(this.ALL, dotMultiply(choices, childMask));
    if (isUndefined(choice)) {
      // console.log("Warning, uncollapsable cell:", x, y, choices);
      return false;
    }

    if (tile_index >= 0) {
      if (choices[tile_index]) {
        choice = tile_index;
      } else {
        return false;
      }
    }

    const newChoices = dotMultiply(this.SM[choice], choices);
    newChoices._data[choice] = 1; //.set([choice], 1);
    this.choices.subset(index(x, y, this.ALL), newChoices);
    // this.chosen.subset(index(x, y), choice);
    this.chosen._data[x][y] = choice;

    // this.entropy.subset(index(x, y), this.getCellEntropy(x, y));
    if (tile_index >= 0) {
      this.painted._data[x][y] = 1;
    }
    const entropyValue = this.getCellEntropy(x, y);
    this.entropy._data[x][y] = entropyValue;
    // console.log("BUFFERIGN FROM COLLAPSE AT", x, y);
    // this.bufferEntropy(x, y, entropyValue);
    // this.entropyQT.set(this.targets.get([x, y]), entropyValue);
    // if (entropyValue > 1 && entropyValue < this.minEntropy.value) {
    //   this.minEntropy = new CellEntropy(this.targets.get([x, y]), entropyValue);
    // }
    // console.log(this.minEntropy);
    if (entropyValue > 1) {
      // console.log("ADD:", x, y, "|", entropyValue);
      this.minEntropy.add(
        this.invIndex._data[x][y],
        this.applyEntropyModifiers(entropyValue, {
          painted: this.painted._data[x][y],
        })
      );
    } else {
      // console.log("DEL:", x, y, "|", entropyValue);
      this.painted._data[x][y] = 0;
      const s = this.minEntropy.del(this.invIndex._data[x][y]);
      // console.log(s, this.minEntropy.min());
    }
    // console.log(this.minEntropy);
    // console.log("STATE:", this.entropyBuffer.toArray());
    // this.image.subset(index(x, y, this.COLOR), this.colorMap[choice]);
    this.image._data[x][y][0] = this.colorMap[choice][0];
    this.image._data[x][y][1] = this.colorMap[choice][1];
    this.image._data[x][y][2] = this.colorMap[choice][2];

    // For debugging purposes
    // const entr = this.entropy.get([x, y]);
    this.entropyImage.subset(
      index(x, y, this.COLOR),
      entropyValue <= this.entropyColors.length && entropyValue >= 0
        ? this.entropyColors[floor(entropyValue - 1)]
        : [0, 0, 0, 255]
    );

    this.propagate(x, y, tile_index >= 0);

    return true;
  }

  // TODO: add function to set tile, that combines all the different things happening

  propagate(cx, cy, painted) {
    const q = new Deque();
    q.pushLeft(new Target(cx, cy));
    while (q.size > 0) {
      const p = q.pop();

      this.offsets.forEach((o, k) => {
        const nx = p.x + o.x;
        const ny = p.y + o.y;
        if (nx >= 0 && nx < this.gridSize && ny >= 0 && ny < this.gridSize) {
          const pre = new eig.Matrix(
            squeeze(this.choices.subset(index(nx, ny, this.ALL)))._data
          );
          const cur = new eig.Matrix(
            squeeze(this.choices.subset(index(p.x, p.y, this.ALL)))._data
          );

          // If the neighbouring tile is not at a leaf yet (1 choice), or is not contradicting (0 choices)
          // TODO: refine this definition, 1 choice can also mean meta-tile that is unable to collapse downwards
          if (pre.sum() > 1) {
            // console.log();
            // const curChosen = this.chosen.get([p.x, p.y]);
            // cur.set([curChosen], this.LM.get([curChosen]));
            // const allowed = map(apply(and(cur, this.adjaug), 1, sum), sign);
            let allowedAdjacencies = eig.Matrix.constant(
              1,
              this.gridChoices,
              0
            );
            // console.log(cur._data);
            //
            for (let idx = 0; idx < this.gridChoices; idx++) {
              // if (
              //   idx == this.chosen.subset(index(p.x, p.y)) &&
              //   !this.LM.get([idx])
              // ) {
              //   continue;
              // }

              // // Path Check
              // let skip = false;
              // if (!this.LM.get([idx])) {
              //   // TODO: precompute leaves per node
              //   // const possibleLeaves = [];
              //   let c = 0;
              //   const leaves = this.nodeIndex[this.nameIndex[idx]]
              //     .leaves()
              //     .map((l) => l.index);
              //   for (const leafidx of leaves) {
              //     if (this.pathMap.get(leafidx).has(idx)) {
              //       const path = this.pathMap.get(leafidx).get(idx);
              //       if (sum(and(path, cur)) <= sum(path)) {
              //         // possibleLeaves.push(leafidx);

              //         // Ironically this works, because all meta-tile adjacencies are composed of the adjacencies of their children...
              //         skip = true;
              //         c += 1;
              //         // adjacencies.set([leafidx]);
              //       }
              //     }
              //   }
              //   if (c == 0) {
              //     skip = true;
              //   }

              //   //   // Rebuild adjacencies -- Slowwwww
              //   //   // let newadj = zeros(this.gridChoices);
              //   //   // for (const leafidx of possibleLeaves) {
              //   //   //   const path = this.pathMap.get(leafidx).get(idx);
              //   //   //   newadj = add(
              //   //   //     newadj,
              //   //   //     map(apply(and(path, this.adj), 1, sum), sign)
              //   //   //   );
              //   //   // }
              //   //   // adjacencies = newadj;
              // }

              // if (skip) {
              //   continue;
              // }

              // allowedAdjacencies = add(allowedAdjacencies, adjacencies);
              if (this.LM.get(idx) > 0 && cur.get(idx) > 0) {
                const v1 = this.adjaug
                  .get(k)
                  .block(idx, 0, 1, this.gridChoices);
                allowedAdjacencies.matSubSelf(v1);
                // allowedAdjacencies.print("DISALLOWED POST: ");

                // let adjacencies = squeeze(
                //   this.adjaug.get(k).subset(index(idx, this.ALL))
                // );
                // allowedAdjacencies = add(allowedAdjacencies, adjacencies);
              }
            }
            // console.log(allowed, allowedAdjacencies);
            // Path check (can be faster)
            // const asum = sum(allowed);
            // const prunedAllowed = clone(allowed);
            // const leafCounters = {};
            // for (const allowedIndex of this.indices(allowed._data, 1)) {
            //   // if (leafIndices.has(allowedIndex)) {
            //   //   continue;
            //   // }
            //   leafCounters[allowedIndex] =
            //     this.nodeIndex[this.nameIndex[allowedIndex]].leaves().size;
            //   for (const leafIndex of leafIndices) {
            //     const paths = this.pathMap.get(leafIndex);
            //     let count = 0;
            //     for (const [index, path] of paths) {
            //       if (sum(and(path, allowed)) == sum(path)) {
            //         count += 1;
            //       }
            //     }

            //     // console.log(
            //     //   allowedIndex,
            //     //   leafIndex,
            //     //   path,
            //     //   allowed,
            //     //   sum(and(path, allowed)),
            //     //   sum(path)
            //     // );

            //     // console.log(count, paths.size);
            //     if (count == 0) {
            //       // Here we know there is no available path from this metatile to the leaf of leafIndex
            //       leafCounters[allowedIndex] -= 1;
            //     }
            //   }
            //   // console.log(leafCount);
            //   if (leafCounters[allowedIndex] <= 0) {
            //     // console.log(leafCount);
            //     prunedAllowed.set([allowedIndex], false);

            //     // console.log(
            //     //   "?",
            //     //   leafCounters[allowedIndex],
            //     //   this.nameIndex[allowedIndex]
            //     // );
            //   }
            // }

            // Path check second attempt...

            // const currentTileIndices = this.indices(cur._data, 1);
            // let accCur = zeros(this.gridChoices);
            // for (const index of currentTileIndices) {
            //   accCur = add(
            //     accCur,
            //     apply(and(this.SM[index], this.adj), 1, sum)
            //   );
            // }

            // const preTileIndices = this.indices(pre._data, 1);
            // let accPre = zeros(this.gridChoices);
            // for (const index of preTileIndices) {
            //   accPre = add(
            //     accPre,
            //     apply(and(this.SM[index], this.adj), 1, sum)
            //   );
            // }
            // console.log(map(add(accCur, allowed), sign));
            // console.log(map(add(accPre, pre), sign));
            // console.log("sep");

            // const post = and(pre, allowedAdjacencies);
            // console.log(pre.print("?"));
            const postinter = pre.matSub(
              allowedAdjacencies
                .clamp(-1, 0)
                .transpose()
                .matAdd(new eig.Matrix.ones(this.gridChoices, 1))
            );
            let post = postinter.block(0, 0, this.gridChoices, 1);
            post = post.clamp(0, 1);
            // post.print("urmom");
            // pre.print("PRE");
            allowedAdjacencies = allowedAdjacencies.clamp(0, 1); //.print("ADJ");

            // postinter.print("orig");
            // post.clampSelf(0, 1);

            // TODO: Fix this as well, and then eigen should be done.
            // for (const idx of this.indices(post._data, true)) {
            //   if (!this.LM.get([idx]) && sum(and(this.CM[idx], post)) === 0) {
            //     post.set([idx], false);
            //   }
            // }
            // Algo
            // 1.) get the indices of the currently allowed tiles
            // 2.) get all their submasks; these indicate which tiles are all in their subtree
            // 3.) for each of these we would like to select the associated adjacencies

            // TODO: Remove childless metatiles after determining which ones are allowed
            // TODO: Think of a better way to handle this?
            // console.lo g("SUMXOR:", sum(xor(pre, post)));
            // pre.print("PRE");
            // post.print("POST");
            const diff = pre.matSubSelf(post).sum();
            // console.log(diff);
            if (diff !== 0) {
              const newChoices = [];
              for (let i = 0; i < this.gridChoices; i++) {
                newChoices[i] = post.get(i, 0);
              }
              // console.log("NEW", newChoices);
              // const newChoices = map(post, sign);
              this.choices.subset(index(nx, ny, this.ALL), newChoices);
              if (painted) {
                this.painted._data[nx][ny] = 1;
              }
              const entropyValue = this.getCellEntropy(nx, ny);
              this.entropy._data[nx][ny] = entropyValue;
              if (entropyValue > 1) {
                // console.log("P-ADD:", nx, ny, "|", entropyValue);

                this.minEntropy.add(
                  this.invIndex._data[nx][ny],
                  this.applyEntropyModifiers(entropyValue, {
                    painted: this.painted._data[nx][ny],
                  })
                );
              } else {
                // console.log("P-DEL:", nx, ny, "|", entropyValue);
                this.painted._data[nx][ny] = 0;
                this.minEntropy.del(this.invIndex._data[nx][ny]);
              }
              // if (entropyValue > 1 && entropyValue < this.minEntropy.value) {
              //   this.minEntropy = new CellEntropy(
              //     this.targets.get([nx, ny]),
              //     entropyValue
              //   );
              // }
              // console.log(
              //   "BUFFERING FROM PROPAGATION AT:",
              //   nx,
              //   ny,
              //   "FROM",
              //   p.x,
              //   p.y
              // );
              // this.bufferEntropy(nx, ny, entropyValue);
              // this.entropyQT.set(this.targets.get([nx, ny]), entropyValue);
              q.push(new Target(nx, ny));
              try {
                this.entropyImage.subset(
                  index(nx, ny, this.COLOR),
                  entropyValue <= this.entropyColors.length
                    ? this.entropyColors[round(entropyValue) - 1]
                    : [0, 0, 0, 255]
                );
              } catch {
                this.entropyImage.subset(
                  index(nx, ny, this.COLOR),
                  [255, 0, 0, 255]
                );
              }

              // this.entropyImage.subset(
              //   index(nx, ny, this.COLOR),
              //   dotMultiply(this.entropyColors[this.entropy.get([nx, ny])], 255)
              // );
              const count = sum(post);
              if (count == 1) {
                const choice = post._data.indexOf(true);

                this.image.subset(index(nx, ny, this.COLOR), [
                  this.colorMap[choice],
                ]);
                this.chosen.subset(index(nx, ny), choice);
              }

              if (count == 0) {
                this.image.subset(index(nx, ny, this.COLOR), [
                  [255, 0, 0, 255], //TODO: Would be nice to keep these special colors in a list
                ]);
              }
            }
          }
        }
      });
    }
  }
}
