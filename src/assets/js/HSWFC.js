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
  setCartesian,
  map,
  sign,
  matrix,
  range,
  index,
  pickRandom,
  subset,
  squeeze,
  isUndefined,
  forEach,
} from "mathjs";

import { Deque } from "@blakeembrey/deque";
import { Map, Set } from "immutable";
import { createPalette } from "hue-map";

class Target {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

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

  // def leaves(self):
  // S = set()
  // if not self.subtypes:
  //     S.add(self)
  // for subtype_link in self.subtypes.values():
  //     S.update(subtype_link.to.leaves)
  // return S
}

class Edge {
  constructor(weight) {
    this.weight = weight;
  }
}

export class GridState {
  constructor(gridSize, tileset, adjacencies, invertedIndex) {
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
    this.offsets = [
      new Target(1, 0),
      new Target(-1, 0),
      new Target(0, 1),
      new Target(0, -1),
    ];

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

    console.log(
      "rootpaths1:",
      this.pathMap.get(invertedIndex["grass"]).get(invertedIndex["root"])
    );

    console.log(
      "rootpaths2:",
      this.pathMap.get(invertedIndex["tree"]).get(invertedIndex["root"])
    );

    // NOTE: If the adjacencies are bad, a giant propagation wave can be triggered right at the start, explains the lag-spike
    // TODO: Directional adjacencies
    this.adj = matrix(adjacencies.U._data);
    this.adjaug = clone(this.adj);

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
      const augmented = squeeze(
        map(
          add(
            this.adjaug.subset(index(child.index, this.ALL)),
            this.adjaug.subset(index(node.index, this.ALL))
          ),
          sign
        )
      );
      this.adjaug.subset(index(node.index, this.ALL), augmented);
      this.adjaug.subset(index(this.ALL, node.index), augmented);

      // console.log(this.adj.subset(index(child.index, this.ALL)));
      // console.log();
      // console.log(hue);

      for (const parent of node.incoming.keys()) {
        q.push([parent, node]);
      }
    }
    console.log(this.nodeIndex);
    console.log(this.adjaug);

    console.log(this.indices([2, 23, 1, 2, 3, 4, 52, 2], 2));

    // Build masks
    this.SM = {};
    this.CM = {};
    this.LM = zeros(this.gridChoices);
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
        this.LM.set([node.index], 1);
      }
    }
    console.log(this.LM);

    this.initialize();
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
    this.clearQueue();
  }

  // Entropy Metrics
  // TODO: Implement nicely
  chosenTileDepth(x, y) {
    const chosen = this.chosen.subset(index(x, y));
    if (this.LM.get([chosen])) {
      return 10000;
    }
    return this.nodeIndex[this.nameIndex[chosen]].depth;
  }

  bitmaskSum(x, y) {
    const choices = this.choices.subset(index(x, y, this.ALL));
    const s = sum(choices);
    if (s <= 1) {
      return 10000;
    }
    return s;
  }

  getCellEntropy(x, y) {
    return this.bitmaskSum(x, y);
  }

  // TODO: potentially this one is bullshit right now
  leastEntropy() {
    const s = flatten(this.entropy);
    const r = range(0, s.size()[0]);
    const idx = sort(r, (a, b) => s._data[a] - s._data[b]);
    return this.index.subset(index(idx, range(0, 2)));
  }

  indices(arr, val = 1) {
    return arr.map((v, u) => (v === val ? u : -1)).filter((v) => v !== -1);
  }

  getImageDataArray() {
    return Uint8ClampedArray.from(flatten(this.gridState.image)._data);
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
    const targets = this.leastEntropy().subset(
      index(range(0, amount), range(0, 2))
    );
    targets._data.forEach((le) => {
      if (!this.isEnqueued(le)) {
        this.collapseQueue.pushLeft([le[0], le[1], -1]);
      }
    });
  }

  update() {
    if (this.collapseQueue.size > 0) {
      const target = this.collapseQueue.popLeft();
      this.collapse(target[0], target[1], target[2]);
    }
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
    const choices = squeeze(this.choices.subset(index(x, y, this.ALL)));
    const currentTile = this.chosen.subset(index(x, y));
    const childMask = this.CM[currentTile];

    // Apply weights
    for (const cidx of this.indices(childMask._data)) {
      const edge = this.nodeIndex[this.nameIndex[currentTile]].outgoing.get(
        this.nodeIndex[this.nameIndex[cidx]]
      );
      childMask.set([cidx], edge.weight);
    }

    let choice = pickRandom(this.ALL, dotMultiply(choices, childMask));
    if (isUndefined(choice)) {
      // console.log("Warning, uncollapsable cell:", x, y, choices);
      return false;
    }

    if (tile_index >= 0) {
      if (choices._data[tile_index]) {
        choice = tile_index;
      } else {
        return false;
      }
    }

    const newChoices = dotMultiply(this.SM[choice], choices);
    newChoices.set([choice], 1);
    this.choices.subset(index(x, y, this.ALL), newChoices);
    this.chosen.subset(index(x, y), choice);

    this.entropy.subset(index(x, y), this.getCellEntropy(x, y));
    this.image.subset(index(x, y, this.COLOR), this.colorMap[choice]);

    // For debugging purposes
    const entr = this.entropy.get([x, y]);
    this.entropyImage.subset(
      index(x, y, this.COLOR),
      entr <= this.entropyColors.length
        ? this.entropyColors[entr - 1]
        : [0, 0, 0, 255]
    );

    this.propagate(x, y);

    return true;
  }

  // TODO: add function to set tile, that combines all the different things happening

  propagate(cx, cy) {
    const q = new Deque();
    q.pushLeft(new Target(cx, cy));
    while (q.size > 0) {
      const p = q.pop();

      this.offsets.forEach((o) => {
        const nx = p.x + o.x;
        const ny = p.y + o.y;
        if (nx >= 0 && nx < this.gridSize && ny >= 0 && ny < this.gridSize) {
          const pre = squeeze(this.choices.subset(index(nx, ny, this.ALL)));
          const cur = squeeze(this.choices.subset(index(p.x, p.y, this.ALL)));

          // If the neighbouring tile is not at a leaf yet (1 choice), or is not contradicting (0 choices)
          // TODO: refine this definition, 1 choice can also mean meta-tile that is unable to collapse downwards
          if (sum(pre) > 1) {
            // console.log();
            // const curChosen = this.chosen.get([p.x, p.y]);
            // cur.set([curChosen], this.LM.get([curChosen]));
            // const allowed = map(apply(and(cur, this.adjaug), 1, sum), sign);
            let allowedAdjacencies = zeros(this.gridChoices);
            // console.log(cur._data);
            //
            for (const idx of this.indices(cur._data)) {
              // if (
              //   idx == this.chosen.subset(index(p.x, p.y)) &&
              //   !this.LM.get([idx])
              // ) {
              //   continue;
              // }

              let adjacencies = squeeze(
                this.adjaug.subset(index(idx, this.ALL))
              );

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
              if (this.LM.get([idx])) {
                allowedAdjacencies = add(allowedAdjacencies, adjacencies);
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

            const post = and(pre, allowedAdjacencies);

            // Algo
            // 1.) get the indices of the currently allowed tiles
            // 2.) get all their submasks; these indicate which tiles are all in their subtree
            // 3.) for each of these we would like to select the associated adjacencies

            // TODO: Remove childless metatiles after determining which ones are allowed
            // TODO: Think of a better way to handle this?

            if (sum(xor(pre, post)) > 0) {
              const newChoices = map(post, sign);
              this.choices.subset(index(nx, ny, this.ALL), newChoices);
              const entr = this.getCellEntropy(nx, ny);
              this.entropy.subset(index(nx, ny), entr);

              q.push(new Target(nx, ny));
              this.entropyImage.subset(
                index(nx, ny, this.COLOR),
                entr <= this.entropyColors.length
                  ? this.entropyColors[entr - 1]
                  : [0, 0, 0, 255]
              );

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
