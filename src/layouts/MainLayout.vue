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

            width: 200px;
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
          <q-btn
            color="white"
            text-color="black"
            label="Reset"
            @click="
              () => {
                reset();
                resetFocus();
              }
            "
          />
          <q-separator style="height: 1px; width: 100%" vertical inset />

          <b class="text-uppercase">Tiles</b>
          <q-btn-toggle
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
          </q-btn-toggle>
          <q-separator style="height: 1px; width: 100%" vertical inset />

          <b class="text-uppercase">Brush Size</b>
          <q-slider
            v-model="size"
            :min="1"
            :max="9"
            :step="2"
            snap
            label
            label-always
            switch-label-side
            @click="resetFocus"
            color="primary"
          />
        </div>
      </span>
    </q-page-container>

    <q-footer>
      <q-bar dense class="bg-grey">
        <q-badge transparent :align="middle">
          x: {{ this.mx }} | y: {{ this.my }}
        </q-badge>
        <q-badge transparent :align="middle">
          <!-- lmao -->
          choices:
          {{
            this.mx >= 0 &&
            this.mx < this.width &&
            this.my >= 0 &&
            this.my < this.height
              ? this.gridState?.nameIndex?.filter(
                  (_, i) =>
                    this.gridState?.choices._data?.[this.my]?.[this.mx][i]
                )
              : []
          }}
        </q-badge>
        <q-badge transparent :align="middle">
          entropy:
          {{
            this.mx >= 0 &&
            this.mx < this.width &&
            this.my >= 0 &&
            this.my < this.height
              ? this.gridState?.entropy._data?.[this.my]?.[this.mx]
              : "n/a"
          }}
        </q-badge>
      </q-bar>
    </q-footer>
  </q-layout>
</template>

<script>
import { defineComponent, ref, toRaw } from "vue";
import { flatten, round, zeros, matrix, index, isUndefined } from "mathjs";

const linksList = [];

export default defineComponent({
  name: "MainLayout",

  components: {},
  // 0: [0, 0, 0, 255], // R
  //     1: [50, 130, 50, 255], // G
  //     2: [120, 120, 50, 255], // S
  //     3: [70, 70, 255, 255], // W
  data() {
    return {
      width: 32,
      height: 32,
      mx: 0,
      my: 0,
      size: 1,
      intervalId: undefined,
      gridState: undefined,
      context: undefined,
      leftMouseDown: false,
      rightMouseDown: false,
      autoCollapse: false,
      debug: false,
      tile_index: 0,
      worker: undefined,
      tool: 0,
      tiles: [],
      tilesets: [],
      chosenTileset: 0,
      importedTilesets: [],
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
    updateCanvas(w, h) {
      const img = this.debug
        ? new ImageData(
            Uint8ClampedArray.from(
              flatten(toRaw(this.gridState).entropyImage._data)
            ),
            w,
            h
          )
        : new ImageData(
            Uint8ClampedArray.from(flatten(toRaw(this.gridState).image._data)),
            w,
            h
          );
      this.context.putImageData(img, 0, 0);
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
      for (const n in nodes) {
        invertedIndex[n] = i;
        const node = nodes[n];
        if (node.paintable) {
          this.tiles.push({ slot: n, color: node.color, value: i });
        }
        // dagNodes.push(dagNode);

        i++;
      }

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
    // this.gridState = new GridState(this.width);
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
        if (i === 0) {
          this.chosenTileset = this.tilesets[0].value;
          this.selectTileset(this.chosenTileset);
        }
        i++;
      });
    }
    console.log(this.importedTilesets);

    this.worker.onmessage = ({ data: { gridState, message } }) => {
      this.gridState = gridState;
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

    canvas.addEventListener("mousedown", (e) => {
      if (e.button == 0) {
        this.leftMouseDown = true;
        this.worker.postMessage({ question: "clear" });
        if (this.tool == 0) {
          paintCanvas(canvas, e);
        } else if (this.tool == 1) {
          this.worker.postMessage({ question: "info", value: [] });
        }
      }
    });
    canvas.addEventListener("mouseup", (e) => {
      if (e.button == 0) {
        this.leftMouseDown = false;
      }
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === " ") {
        this.autoCollapse = !this.autoCollapse;
        if (this.autoCollapse) {
          this.worker.postMessage({ question: "auto" });
        }
      }
      if (e.key === "Escape") {
        this.leftDrawerOpen = !this.leftDrawerOpen;
      }
    });
    console.log("MOUNTED");
  },
});
</script>
