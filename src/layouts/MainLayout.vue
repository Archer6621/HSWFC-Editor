<template>
  <q-layout view="LHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
        <q-toolbar-title> HSWFC Editor </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <div class="q-pa-md">
        <b class="text-uppercase">Hierarchical Tilesets</b>
        <q-option-group
          v-model="chosenTileset"
          :options="tilesets"
          color="primary"
          @update:model-value="
            (val, _) => {
              this.selectTileset(val);
              this.resetFocus();
            }
          "
        />
      </div>
    </q-drawer>

    <q-page-container>
      <!-- <router-view /> -->
      <span style="display: flex">
        <div class="canvasHolder">
          <canvas
            id="wfc"
            :width="this.tileDim * this.width"
            :height="this.tileDim * this.height"
          ></canvas>
          <canvas
            id="entropy"
            :width="this.width"
            :height="this.height"
            style="opacity: 0.75"
          ></canvas>
          <canvas
            id="highlight"
            :width="this.width"
            :height="this.height"
          ></canvas>
        </div>

        <div
          style="
            display: flex;
            padding: 16px;

            width: 300px;
            flex-direction: column;
          "
        >
          <!-- <b class="text-uppercase">State</b> -->

          <!-- <q-separator style="height: 1px; width: 100%" vertical inset /> -->
          <b class="text-uppercase" title="The tiles that can be painted with"
            >Tiles</b
          >
          <div class="q-pa-md q-gutter-sm">
            <q-tree
              :nodes="tileTree"
              default-expand-all
              v-model:selected="tile_index"
              :duration="50"
              v-model:expanded="expanded"
              node-key="key"
              @click="resetFocus"
              @update:expanded="resetFocus"
            >
              <template v-slot:default-header="prop">
                <div
                  class="row items-center"
                  v-bind:class="{
                    selectedtree: prop.tree.selected === prop.node.key,
                  }"
                >
                  <!-- <q-icon
                    name="square"
                    left
                    :style="`color: rgb(${prop.node.color[0]}, ${prop.node.color[1]}, ${prop.node.color[2]})`"
                  ></q-icon> -->
                  <q-img
                    style="margin-right: 8px"
                    width="24px"
                    height="24px"
                    :src="this.tiles[prop.node.key]?.img?.src"
                  />
                  <div class="text-weight-bold">
                    {{ prop.node.label }}
                    <!-- {{  ? ">" : "" }} -->
                    <!-- {{ print(prop) }} -->
                    <!-- {{ prop }} -->
                  </div>
                </div>
              </template>
            </q-tree>
          </div>

          <!-- <q-btn-toggle
            style="flex-direction: column; text-align: left"
            v-model="tile_index"
            toggle-color="primary"
            color="white"
            @click="resetFocus"
            dense
            unelevated
            text-color="black"
            :options="this.tiles"
          >
            <template v-for="tile in this.tiles" v-slot:[tile.slot] :key="tile">
              <q-icon
                name="square"
                left
                :style="`color: rgb(${tile.color[0]}, ${tile.color[1]}, ${tile.color[2]})`"
              ></q-icon>
              <div>
                {{ tile.slot }}
              </div>
              <q-space />
            </template>
          </q-btn-toggle> -->
          <q-separator style="height: 1px; width: 100%" vertical inset />
        </div>

        <div
          style="
            display: flex;
            padding: 16px;

            width: 300px;
            flex-direction: column;
          "
        >
          <!-- <b class="text-uppercase">Tool</b>
          <q-btn-toggle
            ref="layout"
            tabindex="-1"
            v-model="tool"
            class="my-custom-toggle"
            unelevated
            toggle-color="primary"
            color="white"
            text-color="primary"
            @click="resetFocus"
            :options="[
              { label: '', value: 0, icon: 'brush' },
              { label: '', value: 1, icon: 'question_mark' },
              { label: '', value: 2, icon: 'edit' },
            ]"
          />
          <q-separator style="height: 1px; width: 100%" vertical inset /> -->

          <b class="text-uppercase">Toggles</b>
          <q-checkbox
            title="Shows the entropy of the grid instead of the tiles"
            size="md"
            v-model="debug"
            val="md"
            label="Show Entropy"
            @click="resetFocus"
          />
          <q-separator style="height: 1px; width: 100%" vertical inset />

          <b class="text-uppercase">Controls</b>
          <div class="q-gutter-sm col-auto no-wrap">
            <span class="row">
              <q-btn
                title="Solve for one step, which is sized according to the set solve speed below"
                color="white"
                class="col"
                text-color="black"
                icon="skip_next"
                :ripple="false"
                @click="
                  () => {
                    oneStep();
                    resetFocus();
                  }
                "
              />
            </span>
            <!-- <span class="row">
              <q-btn

                color="white"
                class="col"
                text-color="black"
                label="Suggest"
                :ripple="false"
                @click="
                  () => {
                    suggest();
                    resetFocus();
                  }
                "
              />
            </span> -->
            <span class="row">
              <q-btn
                title="Undo"
                color="white"
                text-color="black"
                class="col"
                icon="undo"
                :disable="!canUndo"
                @click="
                  () => {
                    undo();
                    resetFocus();
                  }
                "
              />
              <q-btn
                title="Redo"
                color="white"
                text-color="black"
                class="col"
                icon="redo"
                :disable="!canRedo"
                @click="
                  () => {
                    redo();
                    resetFocus();
                  }
                "
              />
            </span>
            <span class="row">
              <q-btn
                title="Reset the grid completely"
                color="white"
                class="col"
                text-color="black"
                label="Reset"
                @click="
                  () => {
                    reset();
                    resetFocus();
                  }
                "
              />
            </span>
          </div>
          <q-separator style="height: 1px; width: 100%" vertical inset />

          <b class="text-uppercase" title="Size of the paint brush"
            >Brush Size</b
          >

          <q-item>
            <q-btn-toggle
              title="Size of the paint brush"
              v-model="size"
              toggle-color="primary"
              :options="[
                {
                  icon: 'img:dot-xs.svg',
                  value: 1,
                },
                { icon: 'img:dot-s.svg', value: 5 },
                { icon: 'img:dot-m.svg', value: 9 },
                { icon: 'img:dot.svg', value: 15 },
              ]"
              @click="resetFocus"
              @update:model-value="resetFocus"
            />
            <!-- <q-btn
              color="white"
              text-color="black"
              icon="remove"
              @click="this.size++"
            />
            <q-separator vertical />
            <q-space />
            {{ this.size }}
            <q-space />

            <q-separator vertical />
            <q-btn
              color="white"
              text-color="black"
              icon="add"
              @click="this.size--"
            />
            <q-space /> -->

            <!-- <q-item-section avatar>
              <b>{{ this.size }}</b>
            </q-item-section>
            <q-item-section>
              <q-slider
                v-model="size"
                :min="1"
                :max="9"
                :step="2"
                snap
                @change="resetFocus"
                color="primary"
              />
            </q-item-section> -->
          </q-item>

          <q-separator style="height: 1px; width: 100%" vertical inset />

          <b class="text-uppercase" title="Speed at which the WFC solver runs"
            >Solve Speed</b
          >

          <q-item>
            <q-btn-toggle
              title="Speed at which the WFC solver runs"
              v-model="stepSize"
              toggle-color="primary"
              :options="[
                { icon: 'fa-solid fa-person-walking', value: 1 },
                { icon: 'fa-solid fa-person-running', value: 5 },
                { icon: 'fa-solid fa-person-biking', value: 15 },
                { icon: 'fa-solid fa-truck-fast', value: 50 },
              ]"
              @click="resetFocus"
              @update:model-value="
                () => {
                  setStepSize();
                  resetFocus();
                }
              "
            />
            <!-- <q-item-section avatar>
              <b>{{ this.stepSize }}</b>
            </q-item-section>
            <q-item-section>
              <q-slider
                v-model="stepSize"
                :min="1"
                :max="128"
                :step="1"
                snap
                @click="resetFocus"
                @change="
                  () => {
                    setStepSize();
                    resetFocus();
                  }
                "
                color="primary"
              />
            </q-item-section> -->
          </q-item>

          <q-separator style="height: 1px; width: 100%" vertical inset />
        </div>
      </span>
      <span style="display: flex">
        <!-- <q-card
          v-for="(url, index) in this.imageUrl"
          :key="index"
          class="q-ma-sm"
          style="width: 140px"
        >
          <q-img
            @click="
              {
                imagePopup[index] = true;
              }
            "
            :src="url"
          >
          </q-img>

          <q-dialog v-model="imagePopup[index]">
            <q-card>
              <q-card-section class="row items-center q-pb-none">
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
              </q-card-section>

              <q-card-section>
                <q-img
                  style="
                    width: 500px;
                    height: 500px;
                    image-rendering: pixelated;
                  "
                  @click="
                    {
                      imagePopup[index] = true;
                    }
                  "
                  :src="url"
                >
                </q-img>
              </q-card-section>
              <q-card-actions align="around">
                <q-btn
                  style="width: 100px; height: 32px"
                  class="q-mx-xs"
                  size="md"
                  icon="upload"
                  color="white"
                  @click="
                    () => {
                      loadSnapshot(index);
                      resetFocus();
                      imagePopup[index] = false;
                    }
                  "
                  text-color="black"
                ></q-btn>
              </q-card-actions>
            </q-card>
          </q-dialog>

          <q-card-actions align="around">
            <q-btn
              style="width: 24px; height: 16px"
              class="q-mx-xs"
              size="sm"
              icon="upload"
              color="white"
              @click="
                () => {
                  loadSnapshot(index);
                  resetFocus();
                }
              "
              text-color="black"
            ></q-btn>
            <q-btn
              style="width: 24px; height: 16px"
              class="q-mx-xs"
              size="sm"
              icon="download"
              color="white"
              @click="
                () => {
                  setSnapshot(index);
                  resetFocus();
                }
              "
              text-color="black"
            ></q-btn>
          </q-card-actions>
        </q-card> -->
        <q-space></q-space>
        <q-btn-toggle
          title="Pauses or resumes the automatic collapser, based on the configured solve speed (space)"
          tabindex="-1"
          size="xl"
          v-model="autoCollapse"
          class="my-custom-toggle"
          toggle-color="primary"
          color="white"
          @click="resetFocus"
          text-color="primary"
          @update:model-value="
            (val) => {
              if (val) {
                this.worker.postMessage({ question: 'auto' });
              }
            }
          "
          :options="[
            { icon: 'pause', value: false },
            { icon: 'play_arrow', value: true },
          ]"
        />
        <q-space></q-space>
      </span>
    </q-page-container>

    <q-footer>
      <q-bar dense class="bg-grey">
        <q-badge transparent :align="'middle'">
          x: {{ this.mx }} | y: {{ this.my }}
        </q-badge>
        <q-badge transparent :align="'middle'">
          <!-- lmao -->
          choices:
          {{
            //  Formula: c + C * y + C * Y * x
            this.mx >= 0 &&
            this.mx < this.width &&
            this.my >= 0 &&
            this.my < this.height
              ? this.grid?.nameIndex?.filter(
                  (n) =>
                    this.grid?.choices?.[
                      this.grid?.invertedIndex[n] +
                        this.grid?.nameIndex.length * this.mx + // TODO: Investigate why this is flipped compared to the algorithm...
                        this.grid?.nameIndex.length * this.height * this.my
                    ]
                )
              : []
          }}
        </q-badge>
        <q-badge transparent :align="'middle'">
          <!-- lmao -->
          current:
          {{
            //  Formula: c + C * y + C * Y * x
            this.mx >= 0 &&
            this.mx < this.width &&
            this.my >= 0 &&
            this.my < this.height
              ? this.grid?.nameIndex?.[
                  this.grid?.chosen._data?.[this.my]?.[this.mx]
                ]
              : "n/a"
          }}
        </q-badge>
        <q-badge transparent :align="'middle'">
          entropy:
          {{
            this.mx >= 0 &&
            this.mx < this.width &&
            this.my >= 0 &&
            this.my < this.height
              ? this.grid?.entropy._data?.[this.my]?.[this.mx]
              : "n/a"
          }}
        </q-badge>
      </q-bar>
    </q-footer>
  </q-layout>
</template>

<script>
import { defineComponent, ref, toRaw, nextTick } from "vue";
import {
  flatten,
  round,
  zeros,
  matrix,
  index,
  isUndefined,
  ones,
  range,
  floor,
  sin,
} from "mathjs";

export default defineComponent({
  name: "MainLayout",

  components: {},
  // 0: [0, 0, 0, 255], // R
  //     1: [50, 130, 50, 255], // G
  //     2: [120, 120, 50, 255], // S
  //     3: [70, 70, 255, 255], // W
  data() {
    return {
      time: 0,
      width: 32,
      height: 32,
      mx: 0,
      my: 0,
      mxp: 0,
      myp: 0,
      size: 5,
      stepSize: 5,
      intervalId: undefined,
      grid: undefined,
      context: undefined,
      highlightContext: undefined,
      entropyContext: undefined,
      leftMouseDown: false,
      rightMouseDown: false,
      autoCollapse: false,
      debug: false,
      tile_index: 0,
      worker: undefined,
      tool: 0,
      tiles: [],
      tileTree: [{ label: "none", color: [0, 0, 0] }],
      tilesets: [],
      chosenTileset: 0,
      importedTilesets: [],
      ctrlDown: false,
      expanded: [],
      canRedo: false,
      canUndo: false,
      snapshotCount: 4,
      imageUrl: [],
      imagePopup: [],
      paintBuffer: [],
      processBuffer: [],
      processFlush: 0,
      tileDim: 0,
      tilesetData: undefined,
    };
  },
  computed: {
    getWindow() {
      return window;
    },
  },
  setup() {
    const leftDrawerOpen = ref(false);

    return {
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },

  methods: {
    resetFocus() {
      document.body.setAttribute("tabindex", "-1");
      document.body.focus();
      document.body.removeAttribute("tabindex");
    },
    reset() {
      this.worker.postMessage({
        question: "reset",
      });
    },
    loadSnapshot(i) {
      this.checkpoint();
      this.worker.postMessage({ question: "load snapshot", value: i });
    },
    setSnapshot(i) {
      this.imageUrl[i] = this.getCanvasImageURL();
      this.worker.postMessage({ question: "snapshot", value: i });
    },
    getCanvasImageURL() {
      var canvas = document.getElementById("wfc");
      if (canvas) {
        this.context = canvas.getContext("2d");
        return canvas.toDataURL("image/png");
      } else {
        return "";
      }
    },
    checkpoint() {
      this.worker.postMessage({ question: "checkpoint" });
      // Any operation that creates a checkpoint invalidates our redo stack (unless we start using some funny merge strategies..)
      // this.canRedo = false;
    },
    isEmpty(obj) {
      for (var x in obj) {
        return false;
      }
      return true;
    },
    undo() {
      this.worker.postMessage({
        question: "undo",
      });
    },
    getRange(x) {
      return range(0, x);
    },
    print(t) {
      console.log(t);
    },
    redo() {
      this.worker.postMessage({
        question: "redo",
      });
    },
    setStepSize() {
      console.log("SETTING STEP SIZE");
      this.worker.postMessage({ question: "step", value: this.stepSize });
    },
    updateCanvas(w, h) {
      const arr = Uint8ClampedArray.from(
        new Array(this.width * this.height * 4)
      );

      // TODO: loop for full marker?
      arr[4 * this.mx + 4 * this.my * w] = 255;
      arr[4 * this.mx + 4 * this.my * w + 3] = 255;

      for (let p of this.paintBuffer) {
        arr[4 * p[1] + 4 * p[0] * w] = 255;
        arr[4 * p[1] + 4 * p[0] * w + 1] = 255;

        arr[4 * p[1] + 4 * p[0] * w + 3] = 128;
      }

      for (let p of this.processBuffer) {
        arr[4 * p[1] + 4 * p[0] * w + 1] =
          100 + (155 * (1 + sin(this.time / 5))) / 2;
        arr[4 * p[1] + 4 * p[0] * w + 2] = 255;

        arr[4 * p[1] + 4 * p[0] * w + 3] = 128;
      }

      const highlightImg = new ImageData(arr, w, h);
      this.highlightContext.putImageData(highlightImg, 0, 0);

      const matrix = this.grid?.chosen._data;
      // for (let i = 0; i < this.width; i++) {
      //   for (let j = 0; j < this.width; j++) {
      //     this.context.drawImage(this.tile, 7 * i, 7 * j);
      //   }
      // }

      if (this.debug) {
        const entrImg = new ImageData(
          Uint8ClampedArray.from(flatten(toRaw(this.grid).entropyImage._data)),
          w,
          h
        );
        this.entropyContext.putImageData(entrImg, 0, 0);
      } else {
        this.entropyContext.clearRect(0, 0, this.width, this.height);
      }

      // Probably do entropy via yet another overlay
      // const img = this.debug
      //   ? new ImageData(
      //       Uint8ClampedArray.from(
      //         flatten(toRaw(this.grid).entropyImage._data)
      //       ),
      //       w,
      //       h
      //     )
      //   : new ImageData(Uint8ClampedArray.from(flatten(matrix)), w, h);
      // this.context.putImageData(img, 0, 0);

      // this.context.putImageData(img, 0, 0);
      for (let i = 0; i < this.width; i++) {
        for (let j = 0; j < this.height; j++) {
          this.context.drawImage(
            this.tiles[matrix[j][i]].img,
            this.tileDim * i,
            this.tileDim * j
          );
        }
      }
    },
    oneStep() {
      this.checkpoint();
      this.worker.postMessage({ question: "onestep" });
    },
    suggest(i = 0) {
      const old = this.worker.onmessage;
      this.worker.onmessage = ({ data: { grid, message } }) => {
        if (message === "doneStep") {
          this.worker.onmessage = old;
          this.grid = grid;
          this.updateCanvas(this.width, this.height);
          this.setSnapshot(i);
          this.undo();
          this.updateCanvas(this.width, this.height);

          if (i < this.snapshotCount - 1) {
            this.suggest(i + 1);
          }
        }
      };
      this.checkpoint();
      this.worker.postMessage({
        question: "onestep",
        value: 8 * this.stepSize,
      });
    },
    markForPaint() {
      const paintMat = zeros(this.width, this.height);
      for (
        let i = Math.floor(this.mx - this.size / 2) + 1;
        i < Math.floor(this.mx + this.size / 2) + 1;
        i++
      ) {
        for (
          let j = Math.floor(this.my - this.size / 2) + 1;
          j < Math.floor(this.my + this.size / 2) + 1;
          j++
        ) {
          if (i >= 0 && i < this.width && j >= 0 && j < this.height) {
            if (!paintMat._data[i][j]) {
              this.paintBuffer.push([j, i]);
              paintMat._data[i][j] = true;
            }
          }
        }
      }
    },
    selectTileset(path) {
      console.log(
        toRaw(this.importedTilesets),
        path,
        toRaw(this.importedTilesets)[path]
      );
      // console.log(
      //   toRaw(this.importedTilesets)["../assets/data/1_dev_tileset.json"]
      // );

      const json = toRaw(toRaw(this.importedTilesets)[path]);
      this.tilesetData = json;

      const tiles = {};

      const nodes = json.nodes;
      const nodeCount = Object.keys(nodes).length;
      const invertedIndex = {};
      const adjacencies = {
        U: zeros(nodeCount, nodeCount),
        D: zeros(nodeCount, nodeCount),
        L: zeros(nodeCount, nodeCount),
        R: zeros(nodeCount, nodeCount),
      };

      const opposingDir = {
        U: "D",
        D: "U",
        L: "R",
        R: "L",
      };

      // Build tile array
      // dagNodes = [];
      this.tiles = [];
      const nodeArray = [];
      let i = 0;

      for (const n in nodes) {
        invertedIndex[n] = i;
        nodeArray.push(nodes[n]);
        const node = nodes[n];
        const tile = { slot: n, color: node.color, value: i };

        tile.img = new Image();
        tile.img.src = new URL(
          `../../${json.name}/${n}.png`,
          import.meta.url
        ).href;
        console.log(tile.img.src);
        // Kinda redundant to set it for every tile but oh well
        tile.img.onload = () => {
          this.tileDim = tile.img.width;
        };
        this.tiles.push(tile);

        //

        // dagNodes.push(dagNode);

        i++;
      }

      // Build tile tree
      const treeNodeArray = [];
      console.log("exp", this.expanded);

      for (const n in nodes) {
        const nodeIndex = invertedIndex[n];
        const node = nodeArray[nodeIndex];
        const treeNode = {};
        treeNode.color = node.color;
        treeNode.key = nodeIndex;
        treeNode.label = n;
        treeNodeArray.push(treeNode);
      }

      for (const tn of treeNodeArray) {
        const node = nodeArray[tn.key];
        const treeNode = treeNodeArray[tn.key];
        treeNode.children = [];
        for (const childName in node.children) {
          treeNode.children.push(treeNodeArray[invertedIndex[childName]]);
        }
      }

      this.tileTree = [treeNodeArray[invertedIndex["root"]]];
      this.expanded.push(this.tileTree[0].key);
      this.tileTree[0].children.forEach((c) => {
        this.expanded.push(c.key);
      });

      // console.log(nodeIndex);

      // Build adjacency matrices
      for (const n1 in nodes) {
        const node1 = nodes[n1];
        for (const dir in node1.adjacencies) {
          for (const n2 of node1.adjacencies[dir]) {
            const index1 = invertedIndex[n1];
            const index2 = invertedIndex[n2];
            try {
              adjacencies[dir].set([index1, index2], 1);
              // adjacencies[dir].set([index2, index1], 1);

              // adjacencies[opposingDir[dir]].set([index2, index1], 1);
            } catch (error) {
              console.error(
                "Could not set adjacency:",
                n1,
                name1,
                "<->",
                n2,
                name2
              );
            }
          }
        }
      }
      console.log(adjacencies);
      // Build adjacency hashmap

      this.worker.postMessage({
        question: "init",
        value: [this.width, nodes, adjacencies, invertedIndex],
      });
    },
  },
  mounted() {
    this.leftDrawerOpen = false;
    var canvas = document.getElementById("wfc");
    var highlightCanvas = document.getElementById("highlight");
    var entropyCanvas = document.getElementById("entropy");
    this.context = canvas.getContext("2d");
    this.highlightContext = highlightCanvas.getContext("2d");
    this.entropyContext = entropyCanvas.getContext("2d");

    this.worker = new Worker(
      new URL("../assets/js/worker.js", import.meta.url),
      { type: "module" }
    );

    const tilesets = import.meta.glob("../assets/data/*.json");
    let i = 0;
    for (const filename in tilesets) {
      tilesets[filename]().then((module) => {
        module.default.name = filename.split("/").pop().split(".")[0];
        this.importedTilesets.push(module.default);
        this.tilesets.push({
          label: module.default.name,
          value: i,
        });
        this.tilesets = this.tilesets.sort((a, b) =>
          a.label > b.label ? 1 : -1
        );
        if (i === 0) {
          this.chosenTileset = this.tilesets[0].value;
          this.selectTileset(this.chosenTileset);
        }
        i++;
      });
    }
    console.log(this.importedTilesets);

    this.worker.onmessage = ({ data: { grid, message } }) => {
      this.grid = grid;
      if (message === "doneUpdate") {
        this.canRedo = grid.canRedo;
        this.canUndo = grid.canUndo;

        // lmao h@x0r
        if (this.processBuffer) {
          this.processFlush++;
        }
        if (this.processFlush > 20) {
          this.processFlush = 0;
          this.processBuffer = [];
        }
      }
      // this.updateCanvas(this.width, this.height);
      if (message === "doneAuto" && this.autoCollapse) {
        this.worker.postMessage({ question: "auto" });
      }
      if (message === "doneInit") {
        console.log("My body is ready");
        window.setInterval(() => {
          this.worker.postMessage({ question: "update" });
        }, 10);
        // Feels smoother, more regular
        window.setInterval(() => {
          this.updateCanvas(this.width, this.height);
        }, 10);
      }
    };

    window.setInterval(() => {
      this.time++;
    }, 10);

    // let paintCanvas = (canvas, event) => {
    //   // this.worker.postMessage({
    //   //   question: "manual",
    //   //   value: [this.mx, this.my, this.tile_index, this.size, this.tool],
    //   // });
    // };

    highlightCanvas.addEventListener("mousemove", (e) => {
      e.preventDefault();
      const rect = highlightCanvas.getBoundingClientRect();
      this.mxp = this.mx;
      this.myp = this.my;
      this.mx = round(
        (this.width * (e.clientX - rect.left)) / highlightCanvas.offsetWidth -
          0.5
      );
      this.my = round(
        (this.height * (e.clientY - rect.top)) / highlightCanvas.offsetHeight -
          0.5
      );

      if (this.mx !== this.mxp || this.my !== this.myp) {
        if (this.leftMouseDown) {
          this.markForPaint();
        }

        // if (this.leftMouseDown && [0, 2].includes(this.tool)) {
        //   // paintCanvas(canvas, e);
        // }
      }
    });

    //   const event = new MouseEvent("click", {
    //   view: window,
    //   bubbles: true,
    //   cancelable: true,
    // });
    // const cb = document.getElementById("checkbox");
    // const cancelled = !cb.dispatchEvent(event);

    // TODO: Probably nicer to detect mouseup outside of the element
    // canvas.addEventListener("mouseout", (e) => {
    //   this.leftMouseDown = false;
    // });
    highlightCanvas.addEventListener("mousedown", (e) => {
      e.preventDefault();
      if (e.button == 0) {
        this.leftMouseDown = true;
        this.markForPaint();

        // this.worker.postMessage({ question: "clear" });
        this.checkpoint();
        // this.worker.postMessage({ question: "lock" });

        // if ([0, 2].includes(this.tool)) {
        //   paintCanvas(canvas, e);
        // } else if (this.tool == 1) {
        //   this.worker.postMessage({ question: "info", value: [] });
        // }
      }
    });
    document.addEventListener("mouseup", (e) => {
      if (e.button == 0) {
        this.leftMouseDown = false;
        if (this.paintBuffer.length > 0) {
          this.worker.postMessage({
            question: "paint",
            value: [this.tile_index],
            cells: flatten(toRaw(this.paintBuffer)),
          });
        }
        this.processBuffer = this.paintBuffer;
        this.paintBuffer = [];
      }
    });
    window.addEventListener("keydown", (e) => {
      this.ctrlDown = e.ctrlKey;
      if (e.key === "ArrowLeft") {
        this.undo();
      }

      if (e.key === "ArrowRight") {
        this.oneStep();
      }
      for (const i of range(1, this.snapshotCount + 1)) {
        if (e.key === `${i.value}` && this.ctrlDown) {
          this.loadSnapshot(i.value - 1);
        }
      }
    });
    window.addEventListener("keyup", (e) => {
      this.ctrlDown = e.ctrlKey;
    });
    window.addEventListener("keypress", (e) => {
      if (e.key === " ") {
        this.autoCollapse = !this.autoCollapse;
        if (this.autoCollapse) {
          this.checkpoint();
          this.worker.postMessage({ question: "auto" });
        }
      }
      if (e.key === "Escape") {
        this.leftDrawerOpen = !this.leftDrawerOpen;
      }
      // CTRL + Z is special...
      if (this.ctrlDown && e.key.charCodeAt(0) == 26) {
        this.undo();
      }

      // So is CTRL + Y...
      if (this.ctrlDown && e.key.charCodeAt(0) == 25) {
        this.redo();
      }

      if (e.key === "r") {
        this.reset();
      }
      if (e.key === "s") {
        this.oneStep();
      }

      for (const i of range(1, this.snapshotCount + 1)) {
        if (e.key === `${i.value}`) {
          this.setSnapshot(i.value - 1);
        }
      }
    });

    // TOUCH SUPPORT
    // TODO: Extract common elements to methods, so mouse/touch can use the same interface
    highlightCanvas.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        this.leftMouseDown = true;
        this.worker.postMessage({ question: "clear" });
        this.checkpoint();
        this.worker.postMessage({ question: "lock" });

        if (this.tool == 0) {
          paintCanvas(canvas, e);
        } else if (this.tool == 1) {
          this.worker.postMessage({ question: "info", value: [] });
        }
      }
      return false;
    });
    highlightCanvas.addEventListener("touchend", (e) => {
      this.leftMouseDown = false;
      this.worker.postMessage({ question: "unlock" });
    });
    highlightCanvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      if (e.touches) {
        const touch = e.touches[0];
        const rect = highlightCanvas.getBoundingClientRect();
        this.mx = round(
          ((this.width + 1) * (touch.clientX - rect.left)) /
            highlightCanvas.offsetWidth -
            1
        );
        this.my = round(
          ((this.height + 1) * (touch.clientY - rect.top)) /
            highlightCanvas.offsetHeight -
            1
        );

        if (this.leftMouseDown && [0, 2].includes(this.tool)) {
          paintCanvas(canvas, e);
        }
      }
    });
    document.body.addEventListener(
      "touchmove",
      function (event) {
        event.preventDefault();
      },
      false
    );

    // Add placeholders for snapshots
    for (const _ of range(0, this.snapshotCount)) {
      this.imageUrl.push(
        new URL("../assets/default.png", import.meta.url).href
      );
    }

    this.setStepSize();

    console.log("MOUNTED");
  },
});
</script>
