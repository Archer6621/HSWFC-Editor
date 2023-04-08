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
        <canvas id="wfc" :width="this.width" :height="this.height"></canvas>
        <div
          style="
            display: flex;
            padding: 16px;

            width: 300px;
            flex-direction: column;
          "
        >
          <b class="text-uppercase">State</b>
          <q-btn-toggle
            tabindex="-1"
            v-model="autoCollapse"
            class="my-custom-toggle"
            unelevated
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
              { label: 'Paused', value: false },
              { label: 'Collapsing', value: true },
            ]"
          />
          <q-separator style="height: 1px; width: 100%" vertical inset />
          <b class="text-uppercase">Tiles</b>
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
                  <q-icon
                    name="square"
                    left
                    :style="`color: rgb(${prop.node.color[0]}, ${prop.node.color[1]}, ${prop.node.color[2]})`"
                  ></q-icon>
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
          <b class="text-uppercase">Tool</b>
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
            ]"
          />
          <q-separator style="height: 1px; width: 100%" vertical inset />

          <b class="text-uppercase">Toggles</b>
          <q-checkbox
            size="md"
            v-model="debug"
            val="md"
            label="Debug"
            @click="resetFocus"
          />
          <q-separator style="height: 1px; width: 100%" vertical inset />

          <b class="text-uppercase">Controls</b>
          <div class="q-gutter-sm col-auto no-wrap">
            <span class="row">
              <q-btn
                color="white"
                class="col"
                text-color="black"
                label="Step"
                :ripple="false"
                @click="
                  () => {
                    oneStep();
                    resetFocus();
                  }
                "
              />
            </span>
            <span class="row">
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
            </span>
            <span class="row">
              <q-btn
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

          <b class="text-uppercase">Brush Size</b>
          <q-item>
            <q-item-section avatar>
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
            </q-item-section>
          </q-item>

          <q-separator style="height: 1px; width: 100%" vertical inset />

          <b class="text-uppercase">Speed</b>

          <q-item>
            <q-item-section avatar>
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
            </q-item-section>
          </q-item>

          <q-separator style="height: 1px; width: 100%" vertical inset />
        </div>
      </span>
      <span style="display: flex">
        <q-card
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
        </q-card>
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
            this.mx >= 0 &&
            this.mx < this.width &&
            this.my >= 0 &&
            this.my < this.height
              ? this.grid?.nameIndex?.filter(
                  (_, i) => this.grid?.choices._data?.[this.my]?.[this.mx][i]
                )
              : []
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
      width: 64,
      height: 64,
      mx: 0,
      my: 0,
      size: 1,
      stepSize: 1,
      intervalId: undefined,
      grid: undefined,
      context: undefined,
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
      expanded: [0],
      canRedo: false,
      canUndo: false,
      snapshotCount: 4,
      imageUrl: [],
      imagePopup: [],
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
      this.worker.postMessage({ question: "step", value: this.stepSize });
    },
    updateCanvas(w, h) {
      const matrix = toRaw(this.grid).image._data;

      for (const i of range(0, this.size)._data) {
        for (const j of range(0, this.size)._data) {
          let index = matrix[this.my + i - floor(this.size / 2)];
          if (index) {
            index = index[this.mx + j - floor(this.size / 2)];
          }
          if (index) {
            index[0] = 255;
          }
        }
      }

      const img = this.debug
        ? new ImageData(
            Uint8ClampedArray.from(
              flatten(toRaw(this.grid).entropyImage._data)
            ),
            w,
            h
          )
        : new ImageData(Uint8ClampedArray.from(flatten(matrix)), w, h);
      this.context.putImageData(img, 0, 0);
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
    selectTileset(path) {
      for (const c in toRaw(this.importedTilesets)) {
        console.log(c);
      }

      console.log(
        toRaw(this.importedTilesets),
        path,
        toRaw(this.importedTilesets)[path]
      );
      console.log(
        toRaw(this.importedTilesets)["../assets/data/1_dev_tileset.json"]
      );

      const json = toRaw(toRaw(this.importedTilesets)[path]);

      const nodes = json.nodes;
      const nodeCount = Object.keys(nodes).length;
      let i = 0;
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
      for (const n in nodes) {
        invertedIndex[n] = i;
        nodeArray.push(nodes[n]);
        const node = nodes[n];
        if (node.paintable) {
          this.tiles.push({ slot: n, color: node.color, value: i });
        }
        // dagNodes.push(dagNode);

        i++;
      }

      // Build tile tree
      const treeNodeArray = [];
      console.log(treeNodeArray);

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
    var canvas = document.getElementById("wfc");
    this.context = canvas.getContext("2d");

    this.worker = new Worker(
      new URL("../assets/js/worker.js", import.meta.url),
      { type: "module" }
    );

    const tilesets = import.meta.glob("../assets/data/*.json");
    let i = 0;
    for (const filename in tilesets) {
      tilesets[filename]().then((module) => {
        this.importedTilesets.push(module.default);
        this.tilesets.push({
          label: filename.split("/").pop().split(".")[0],
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
      }
      this.updateCanvas(this.width, this.height);
      if (message === "doneAuto" && this.autoCollapse) {
        this.worker.postMessage({ question: "auto" });
      }
      if (message === "doneInit") {
        console.log("My body is ready");
        window.setInterval(() => {
          this.worker.postMessage({ question: "update" });
        }, 10);
      }
    };

    let paintCanvas = (canvas, event) => {
      this.worker.postMessage({
        question: "manual",
        value: [this.mx, this.my, this.tile_index, this.size],
      });
    };
    canvas.addEventListener("mousemove", (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      this.mx = round(
        ((this.width + 1) * (e.clientX - rect.left)) / canvas.offsetWidth - 1
      );
      this.my = round(
        ((this.height + 1) * (e.clientY - rect.top)) / canvas.offsetHeight - 1
      );

      if (this.leftMouseDown && this.tool == 0) {
        paintCanvas(canvas, e);
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
    canvas.addEventListener("mousedown", (e) => {
      e.preventDefault();
      if (e.button == 0) {
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
    });
    document.addEventListener("mouseup", (e) => {
      if (e.button == 0) {
        this.leftMouseDown = false;
        this.worker.postMessage({ question: "unlock" });
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
    canvas.addEventListener("touchstart", (e) => {
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
    canvas.addEventListener("touchend", (e) => {
      this.leftMouseDown = false;
      this.worker.postMessage({ question: "unlock" });
    });
    canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      if (e.touches) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        this.mx = round(
          ((this.width + 1) * (touch.clientX - rect.left)) /
            canvas.offsetWidth -
            1
        );
        this.my = round(
          ((this.height + 1) * (touch.clientY - rect.top)) /
            canvas.offsetHeight -
            1
        );

        if (this.leftMouseDown && this.tool == 0) {
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

    console.log("MOUNTED");
  },
});
</script>
