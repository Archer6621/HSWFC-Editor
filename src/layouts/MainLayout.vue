<template>
  <div class="mainGrid">
    <div class="tileTreeArea" style="overflow-x: auto">
      <div class="q-mx-md q-mt-sm" style="flex: 0 1 auto; max-height: 2em">
        <b
          class="text-uppercase text-h6 text-weight-bold"
          title="The tiles that
          can be painted with"
        >
          Tiles</b
        >
      </div>

      <q-separator style="height: 1px; width: 100%" vertical inset />
      <div class="q-pa-md q-gutter-sm" style="overflow-y: auto; flex: 0 1 auto">
        <q-tree
          :nodes="tileTree"
          ref="tree"
          default-expand-all
          v-model:selected="selectedNode"
          :duration="50"
          v-model:expanded="expanded"
          node-key="domKey"
          @click="
            (e) => {
              resetFocus();
            }
          "
          @update:selected="
            (t) => {
              if (t) {
                this.lastSelectednode = t;
              } else {
                this.selectedNode = this.lastSelectednode;
              }
            }
          "
          @update:expanded="resetFocus"
        >
          <template v-slot:default-header="prop">
            <div
              class="row items-center"
              v-bind:class="{
                selectedtree: prop.tree.selected === prop.node.domKey,
                prb0:
                  this.probDict[prop.node.domKey] === this.probMods[0].value,
                prb1:
                  this.probDict[prop.node.domKey] === this.probMods[1].value,
                prb2:
                  this.probDict[prop.node.domKey] === this.probMods[2].value,
                prb3:
                  this.probDict[prop.node.domKey] === this.probMods[3].value,
                prb4:
                  this.probDict[prop.node.domKey] === this.probMods[4].value,
              }"
            >
              <!-- () -->
              <!-- {{ this.print(this) }} -->
              <!-- {{ prop }} -->
              <!-- <q-icon
                    name="square"
                    left
                    :style="`color: rgb(${prop.node.color[0]}, ${prop.node.color[1]}, ${prop.node.color[2]})`"
                  ></q-icon> -->
              <!-- :ref="
                (el) =>
                  `vla`
              " -->
              <q-img
                style="margin-right: 8px"
                width="24px"
                height="24px"
                :src="this.tiles[prop.node.key]?.img?.src"
              />
              <div class="text-weight-bold unselectable">
                {{ prop.node.label }}
                <!-- {{  ? ">" : "" }} -->
                <!-- {{ print(prop) }} -->
                <!-- {{ prop }} -->
              </div>
            </div>
          </template>
        </q-tree>
      </div>
    </div>

    <div class="canvasArea">
      <div
        class="canvasHolder"
        :style="`aspect-ratio: ${this.aspect(true)}/ ${this.aspect()};`"
      >
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
    </div>

    <div class="settingsArea">
      <div class="q-mx-md q-mt-sm" style="flex: 0 1 auto; max-height: 2em">
        <b class="text-uppercase text-h6 text-weight-bold"> Settings</b>
      </div>

      <q-separator style="height: 1px; width: 100%" vertical inset />

      <div
        class="q-pa-md q-gutter-sm"
        style="overflow-y: auto; overflow-x: auto; flex: 0 1 auto"
      >
        <q-item dense>
          <q-checkbox
            title="Shows the entropy of the grid overlaid over the tiles"
            size="md"
            v-model="debug"
            val="md"
            dense
            label="Show Entropy"
            class="row"
            @click="resetFocus"
          />
        </q-item>

        <q-item dense>
          <span class="row">
            <q-input
              v-model.number="this.width"
              style="min-width: 48px"
              type="number"
              filled
              dense
              label="width"
              class="q-mr-xs q-my-xs col"
              @update:model-value="
                () => {
                  initWorker();
                }
              "
              @click="resetFocus"
            />
            <q-input
              v-model.number="this.height"
              type="number"
              style="min-width: 48px"
              filled
              dense
              label="height"
              class="q-mr-xs q-my-xs col"
              @update:model-value="
                () => {
                  initWorker();
                }
              "
              @click="resetFocus"
            />
          </span>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label class="q-py-sm">
              <b class="text-uppercase" title="Size of the paint brush"
                >Brush Size</b
              >
            </q-item-label>
            <q-btn-toggle
              title="Size of the paint brush"
              v-model="size"
              spread
              class="buttonToggleMW"
              style="max-width: 100%"
              size="md"
              toggle-color="primary"
              :options="[
                { icon: 'img:dot-xs.svg', value: 1 },
                { icon: 'img:dot-s.svg', value: 3 },
                { icon: 'img:dot-m.svg', value: 5 },
                { icon: 'img:dot-l.svg', value: 9 },
                { icon: 'img:dot.svg', value: 15 },
              ]"
              @click="resetFocus"
              @update:model-value="resetFocus"
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label class="q-py-sm">
              <b
                class="text-uppercase"
                title="Speed at which the generator runs"
                >Generation Speed</b
              >
            </q-item-label>
            <q-btn-toggle
              title="Speed at which the generator runs"
              spread
              v-model="stepSize"
              style="max-width: 100%"
              class="buttonToggleMW"
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
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label class="q-py-sm">
              <b
                class="text-uppercase"
                title="Modify how often the selected tile in the hierarchy will be chosen"
                >Tile Probability</b
              >
            </q-item-label>
            <q-btn-toggle
              title="Modify how often the selected tile in the hierarchy will be chosen"
              spread
              v-model="this.probDict[this.selectedNode]"
              style="max-width: 100%"
              class="buttonToggleMW"
              toggle-color="yellow-7"
              :options="this.probMods"
              @click="resetFocus"
              @update:model-value="
                () => {
                  setProbMod();
                  resetFocus();
                }
              "
            />
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-label class="q-pt-md">
            <b
              class="text-uppercase"
              title="Save and load snapshots of the canvas"
              >Snapshots</b
            >
          </q-item-label>
        </q-item>
        <q-item
          class="q-ma-none q-pa-none"
          v-for="(url, index) in this.imageUrl"
          :key="index"
        >
          <q-card class="q-ma-sm">
            <q-card-section horizontal class="row items-center q-pb-none">
              <img
                :style="`aspect-ratio: ${this.aspect(
                  true
                )}/ ${this.aspect()}; `"
                class="snapshotImage"
                @click="
                  {
                    imagePopup[index] = true;
                  }
                "
                :src="url"
              />

              <q-dialog v-model="imagePopup[index]">
                <q-card style="width: 30%; max-width: 30%">
                  <q-card-section class="row items-center q-pb-none">
                    <q-space />
                    <q-btn icon="close" flat round dense v-close-popup />
                  </q-card-section>
                  <q-card-section class="row items-center q-pb-none">
                    <q-img
                      style="image-rendering: pixelated; max-width: 100%"
                      @click="
                        {
                          imagePopup[index] = true;
                        }
                      "
                      :src="url"
                    >
                    </q-img>
                  </q-card-section>
                  <q-card-section>
                    <q-card-actions align="around">
                      <q-btn
                        style="width: 100px; height: 32px"
                        title="Load snapshot"
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
                  </q-card-section>
                </q-card>
              </q-dialog>

              <q-card-actions vertical align="around">
                <q-btn
                  style="width: 24px; min-height: 0px; height: 24px"
                  title="Load snapshot"
                  class="q-mb-md"
                  size="md"
                  icon="arrow_right"
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
                  style="width: 24px; min-height: 0px; height: 24px"
                  title="Save snapshot"
                  class="q-mt-md"
                  size="md"
                  icon="arrow_left"
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
            </q-card-section>
          </q-card>
        </q-item>
      </div>
    </div>

    <div
      class="controlsArea row q-py-md"
      style="max-width: 100%; min-width: 100%"
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

      <!-- <b class="text-uppercase">Controls</b> -->
      <span class="q-pa-sm" style="display: flex; flex-grow: 1; min-width: 0">
        <q-btn-toggle
          title="Pause or resume generation [Space]"
          tabindex="-1"
          v-model="autoCollapse"
          toggle-color="primary"
          color="white"
          spread
          style="flex-grow: 1; min-width: 0"
          size="md"
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
      </span>

      <span class="q-pa-sm" style="display: flex; flex-grow: 1; min-width: 0">
        <q-btn
          title="Generate one step sized according to the set generation speed [Right Arrow]"
          color="white"
          style="flex-grow: 1; min-width: 0"
          text-color="black"
          size="md"
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

      <span class="q-pa-sm" style="display: flex; flex-grow: 1; min-width: 0">
        <q-btn
          title="Undo [CTRL+Z, Left Arrow]"
          color="white"
          text-color="black"
          style="flex-grow: 1; min-width: 0"
          icon="undo"
          size="md"
          :disable="!canUndo"
          @click="
            () => {
              undo();
              resetFocus();
            }
          "
        />
        <q-btn
          title="Redo [CTRL+Y]"
          color="white"
          text-color="black"
          style="flex-grow: 1; min-width: 0"
          icon="redo"
          size="md"
          :disable="!canRedo"
          @click="
            () => {
              redo();
              resetFocus();
            }
          "
        />
      </span>

      <span class="q-pa-sm" style="display: flex; flex-grow: 1; min-width: 0">
        <q-btn
          title="Reset the canvas completely [R]"
          color="white"
          class="q-mx-xs"
          text-color="black"
          size="md"
          style="flex-grow: 1; min-width: 0"
          icon="delete"
          @click="
            () => {
              reset();
              resetFocus();
            }
          "
        />
        <q-btn
          title="Reset areas that came from the tile selected in the hierarchy"
          color="white"
          class="q-mx-xs"
          text-color="black"
          size="md"
          icon="rebase_edit"
          style="flex-grow: 1; min-width: 0"
          @click="
            () => {
              collapsePathRegen();
              resetFocus();
            }
          "
        />
        <q-btn
          title="Download an image of the canvas"
          color="white"
          class="q-mx-xs"
          text-color="black"
          size="md"
          style="flex-grow: 1; min-width: 0"
          icon="download"
          @click="
            () => {
              saveImage();
              resetFocus();
            }
          "
        />
      </span>

      <!-- <div class="q-gutter-sm col-auto no-wrap"> -->
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
      <!-- </div> -->
    </div>

    <div class="toolbarArea">
      <q-toolbar style="min-height: 100%" class="bg-primary text-white">
        <!-- <q-btn flat round dense>
        <q-icon name="menu" />
      </q-btn> -->
        <!-- TODO: does not play nicely with 90deg transform -->
        <q-icon name="bolt" size="3vh" />
        <q-toolbar-title style="font-size: 3vh"> HSWFC Editor </q-toolbar-title>
        <!-- <q-btn flat round dense>
        <q-icon name="more_vert" />
      </q-btn> -->
      </q-toolbar>
    </div>

    <div class="footerArea">
      <q-bar class="bg-grey">
        <q-badge transparent :align="'middle'">
          x: {{ this.mx }} | y: {{ this.my }}
        </q-badge>

        <q-badge v-show="false" transparent :align="'middle'">
          <!-- lmao -->
          current:
          {{
            //  Formula: c + C * y + C * Y * x
            this.mx >= 0 &&
            this.mx < this.width &&
            this.my >= 0 &&
            this.my < this.height
              ? this.grid?.nameIndex?.[
                  this.grid?.chosen._data?.[this.mx]?.[this.my]
                ]
              : "n/a"
          }}
        </q-badge>
        <q-badge v-show="false" transparent :align="'middle'">
          entropy:
          {{
            this.mx >= 0 &&
            this.mx < this.width &&
            this.my >= 0 &&
            this.my < this.height
              ? this.grid?.entropy._data?.[this.mx]?.[this.my]
              : "n/a"
          }}
        </q-badge>
        <q-badge v-show="false" transparent :align="'middle'">
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
                        this.grid?.nameIndex.length * this.my +
                        this.grid?.nameIndex.length * this.height * this.mx
                    ]
                )
              : []
          }}
        </q-badge>
      </q-bar>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, toRaw, nextTick } from "vue";
import {
  flatten,
  transpose,
  min,
  round,
  zeros,
  matrix,
  index,
  isUndefined,
  ones,
  setCartesian,
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
      width: 96,
      height: 64,
      mx: 0,
      my: 0,
      mxp: 0,
      myp: 0,
      size: 5,
      stepSize: 15,
      intervalId: undefined,
      grid: undefined,
      context: undefined,
      highlightContext: undefined,
      entropyContext: undefined,
      leftMouseDown: false,
      rightMouseDown: false,
      autoCollapse: false,
      debug: false,
      selectedNode: "|0",
      lastSelectednode: "|0",
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
      snapshotCount: 3,
      imageUrl: [],
      imagePopup: [],
      paintBuffer: [],
      processBuffer: [],
      processFlush: 0,
      tileDim: 0,
      tilesetData: undefined,
      intervals: [],
      workerData: {},
      paintMat: undefined,
      probDict: {},
      probMods: [
        {
          icon: "img:density_least.svg",
          color: "red-5",
          value: 0.05,
        },
        {
          icon: "img:density_less.svg",
          color: "red-3",
          value: 0.25,
        },
        {
          // icon: "scatter_plot",
          color: "grey-5",
          value: 1,
        },
        {
          icon: "img:density_more.svg",
          color: "blue-3",
          value: 5,
        },
        {
          icon: "img:density_most.svg",
          color: "blue-5",
          value: 25,
        },
      ],
    };
  },
  computed: {
    getWindow() {
      return window;
    },
    tile_index() {
      return parseInt(this.selectedNode.split("|")[1]);
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
    setProbMod() {
      console.log(
        "SETTING PROB MOD",
        this.selectedNode,
        "to",
        this.probDict[this.selectedNode]
      );
      this.worker.postMessage({
        question: "prob mod",
        value: [this.selectedNode, this.probDict[this.selectedNode]],
      });
    },
    initWorker() {
      for (const interval of this.intervals) {
        window.clearInterval(interval);
      }
      this.intervals = [];

      this.worker.postMessage({
        question: "init",
        value: [
          this.width,
          this.height,
          toRaw(this.workerData.nodes),
          toRaw(this.workerData.adjacencies),
          toRaw(this.workerData.invertedIndex),
        ],
      });
    },
    aspect(w) {
      return w
        ? min(1, this.width / this.height)
        : min(1, this.height / this.width);
    },
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
    // Make fake link and download it.. lol
    saveImage() {
      const link = document.createElement("a");
      link.href = this.getCanvasImageURL();
      link.download = `environment-${Date.now()}.png`;
      link.click();
    },
    collapsePathRegen() {
      this.checkpoint();
      this.worker.postMessage({
        question: "collapse path regen",
        value: [this.tile_index],
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
      console.log("PRINTING", t);
    },
    redo() {
      this.worker.postMessage({
        question: "redo",
      });
    },
    setStepSize() {
      this.worker.postMessage({ question: "step", value: this.stepSize });
    },
    updateHighlight(w, h) {
      const arr = Uint8ClampedArray.from(
        new Array(this.width * this.height * 4)
      );

      for (
        let i = round(-this.size / 2) + 1;
        i <= round(this.size / 2) - 1;
        i++
      ) {
        for (
          let j = round(-this.size / 2) + 1;
          j <= round(this.size / 2) - 1;
          j++
        ) {
          // try {
          if (
            this.mx + i >= 0 &&
            this.mx + i < this.width &&
            this.my + j >= 0 &&
            this.my + j < this.height
          ) {
            arr[4 * (this.mx + i) + 4 * (this.my + j) * w + 1] = 100;

            arr[4 * (this.mx + i) + 4 * (this.my + j) * w] = 255;
            arr[4 * (this.mx + i) + 4 * (this.my + j) * w + 3] = 50;
          }
          // } catch {}
        }
      }

      arr[4 * this.mx + 4 * this.my * w] = 255;
      arr[4 * this.mx + 4 * this.my * w + 1] = 0;

      arr[4 * this.mx + 4 * this.my * w + 3] = 255;

      for (let p of this.paintBuffer) {
        arr[4 * p[0] + 4 * p[1] * w] = 255;
        arr[4 * p[0] + 4 * p[1] * w + 1] = 255;

        arr[4 * p[0] + 4 * p[1] * w + 3] = 128;
      }

      for (let p of this.processBuffer) {
        arr[4 * p[0] + 4 * p[1] * w + 1] =
          100 + (155 * (1 + sin(this.time / 5))) / 2;
        arr[4 * p[0] + 4 * p[1] * w + 2] = 255;

        arr[4 * p[0] + 4 * p[1] * w + 3] = 128;
      }

      const highlightImg = new ImageData(arr, w, h);
      this.highlightContext.putImageData(highlightImg, 0, 0);
    },
    updateCanvas(w, h, cells) {
      const matrix = (this.grid?.chosen)._data;
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
      for (const c of cells) {
        const i = c[0];
        const j = c[1];
        const tileImage = this.tiles[matrix?.[i]?.[j]]?.img;
        if (tileImage) {
          this.context.drawImage(tileImage, this.tileDim * i, this.tileDim * j);
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
            if (!this.paintMat._data[i][j]) {
              this.paintBuffer.push([i, j]);
              this.paintMat._data[i][j] = true;
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
          `../assets/data/${json.name}/${n}.png`,
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
      // console.log("exp", this.expanded);

      for (const n in nodes) {
        const nodeIndex = invertedIndex[n];
        const node = nodeArray[nodeIndex];
        const treeNode = {};
        treeNode.color = node.color;
        treeNode.paintable = node.paintable;
        treeNode.key = nodeIndex;
        treeNode.label = n;
        treeNodeArray.push(treeNode);
      }

      const root = treeNodeArray[invertedIndex["root"]];
      root.domKey = "|0";
      const memory = {};
      memory[root.domKey] = root;
      const queue = [root.domKey];

      while (queue.length > 0) {
        const nextIndex = queue.pop();
        const nextTreeNode = memory[nextIndex];
        const node = nodeArray[nextTreeNode.key];
        if (!node.paintable) {
          continue;
        }
        nextTreeNode.children = [];
        for (const c in node.children) {
          const edge = `${nextTreeNode.key}|${invertedIndex[c]}`;
          let child = Object.assign({}, treeNodeArray[invertedIndex[c]]);
          if (!child.paintable) {
            continue;
          }

          if (edge in memory) {
            child = memory[edge];
          } else {
            child.domKey = edge;
            this.probDict[edge] = 1;
          }

          memory[edge] = child;
          nextTreeNode.children.push(child);
          queue.push(edge);
        }
      }

      this.tileTree = [root];

      this.expanded.push(this.tileTree[0].domKey);
      this.tileTree[0].children.forEach((c) => {
        this.expanded.push(c.domKey);
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
      this.workerData.adjacencies = adjacencies;
      this.workerData.nodes = nodes;
      this.workerData.invertedIndex = invertedIndex;
      // Build adjacency hashmap
      this.initWorker();
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
    this.paintMat = zeros(this.width, this.height);

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

    this.worker.onmessage = ({ data: { grid, message, other } }) => {
      this.grid = grid;
      if (message === "doneUpdate") {
        this.canRedo = grid.canRedo;
        this.canUndo = grid.canUndo;

        this.updateCanvas(this.width, this.height, grid.modifiedCells);

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
      if (message === "process") {
        this.processBuffer = other;
      }
      if (message === "doneInit") {
        console.log("My body is ready");
        this.updateCanvas(
          this.width,
          this.height,
          setCartesian(range(0, this.width), range(0, this.height))._data
        );
        this.intervals.push(
          window.setInterval(() => {
            this.worker.postMessage({ question: "update" });
          }, 10)
        );
        // Feels smoother, more regular
        this.intervals.push(
          window.setInterval(() => {
            this.updateHighlight(this.width, this.height);
          }, 10)
        );
        this.intervals.push(
          window.setInterval(() => {
            this.time++;
          }, 10)
        );
      }
      if (message === "redraw") {
        this.updateCanvas(
          this.width,
          this.height,
          setCartesian(range(0, this.width), range(0, this.height))._data
        );
      }
    };

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
      const isPortrait = window.matchMedia(
        "screen and (orientation: portrait)"
      ).matches;
      if (isPortrait) {
        const x = this.mx;
        this.mx = this.width - this.my;
        this.my = x;
      }
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
        this.paintMat = zeros(this.width, this.height);
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
        // this.worker.postMessage({ question: "clear" });
        this.checkpoint();
        // this.worker.postMessage({ question: "lock" });
        // this.markForPaint();
      }
      return false;
    });
    highlightCanvas.addEventListener("touchend", (e) => {
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
      this.paintMat = zeros(this.width, this.height);
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
        const isPortrait = window.matchMedia(
          "screen and (orientation: portrait)"
        ).matches;
        if (isPortrait) {
          const x = this.mx;
          this.mx = this.width - this.my;
          this.my = x;
        }

        if (this.leftMouseDown) {
          this.markForPaint();
        }
      }
    });
    // document.body.addEventListener(
    //   "touchmove",
    //   function (event) {
    //     event.preventDefault();
    //   },
    //   { passive: false }
    // );

    // Add placeholders for snapshots
    for (const _ of range(0, this.snapshotCount)) {
      this.imageUrl.push(
        new URL("../assets/default.png", import.meta.url).href
      );
    }

    // TODO: Doesn't work at all...
    window.addEventListener("load", function () {
      // Set a timeout...
      setTimeout(function () {
        // Hide the address bar!
        window.scrollTo(0, 1);
      }, 0);
    });
  },
});
</script>
