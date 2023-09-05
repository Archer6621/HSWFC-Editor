<template>
  <q-toolbar class="bg-primary text-white header">
    <!-- TODO: does not play nicely with 90deg transform -->
    <q-icon name="bolt" size="3vh" />
    <q-toolbar-title style="font-size: 3vh">HSWFC EDITOR</q-toolbar-title>
    <q-tabs v-model="tab" shrink stretch>
      <q-tab name="input" label="Input Editor" />
      <q-tab name="environment" label="Environment Editor" />
    </q-tabs>
    <q-space></q-space>
    <q-space></q-space>
    <q-space></q-space>
  </q-toolbar>

  <!-- INPUT EDITOR -->
  <div class="inputGrid" v-show="tab === 'input'">
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
        <q-btn
          icon="image"
          @click="importtileset = true"
          title="Import multiple tiles from image..."
          style="flex-grow: 1; min-width: 0"
        >
        </q-btn>

        <q-dialog ref="importtilesetdialog" v-model="importtileset">
          <q-card style="width: 40%; height: 50%">
            <q-card-section>
              <div class="text-h6">Import Tileset</div>
            </q-card-section>
            <q-card-section>
              <q-item>
                <q-item-section>Tileset Atlas</q-item-section>
                <q-item-section>
                  <q-file
                    dense
                    ref="tilesetatlasfilefield"
                    v-model="tilesetatlasfile"
                    label="Standard"
                    :rules="[(val) => !!val || 'Field is required']"
                    @update:model-value="tilesetFromAtlas()"
                /></q-item-section>
              </q-item>
              <q-item>
                <q-item-section>Tile Image</q-item-section>
                <q-item-section>
                  <q-input
                    :rules="[(val) => !!val || 'Field is required']"
                    type="number"
                    v-model="tilesetatlassize"
                  ></q-input>
                </q-item-section>
              </q-item>
            </q-card-section>
          </q-card>
        </q-dialog>
      </span>
      <span class="q-pa-sm" style="display: flex; flex-grow: 1; min-width: 0">
        <q-input
          ref="tilesetImport"
          style="display: none"
          v-model="uploadedtilesetfile"
          v-on:change="importTileset()"
          type="file"
          label="Standard"
        ></q-input>
        <q-btn
          icon="save_alt"
          @click="exportTileset()"
          title="Save current tileset"
          style="flex-grow: 1; min-width: 0"
        >
        </q-btn>
        <q-btn
          icon="upload_file"
          @click="getTilesetFile()"
          title="Import tileset from file"
          style="flex-grow: 1; min-width: 0"
        ></q-btn>
      </span>
      <q-space></q-space>
      <q-space></q-space>
      <q-space></q-space>
      <q-space></q-space>

      <q-space></q-space>
    </div>

    <div class="tileTreeArea" style="overflow-x: auto">
      <div class="q-mx-md q-mt-sm" style="flex: 0 1 auto; max-height: 2em">
        <b
          class="text-uppercase text-h6 text-weight-bold"
          title="The tiles that
          can be painted with"
        >
          TOOLS</b
        >
      </div>

      <q-separator style="height: 1px; width: 100%" vertical inset />

      <div
        class="q-pa-md q-gutter-sm"
        style="overflow-y: auto; max-height: 8%; height: 8%; flex: 0 1 auto"
      >
        <q-btn-toggle
          v-model="this.selectedNodeInput"
          class="buttonToggleTools"
          :options="[{ icon: 'fa-solid fa-eraser', value: 'ERASER' }]"
        >
          <q-tooltip>Eraser</q-tooltip>
        </q-btn-toggle>
      </div>

      <div class="q-mx-md q-mt-sm" style="flex: 0 1 auto; max-height: 2em">
        <b
          class="text-uppercase text-h6 text-weight-bold"
          title="The tiles that
          can be painted with"
        >
          Tile Tree</b
        >
      </div>

      <q-separator style="height: 1px; width: 100%" vertical inset />
      <div
        class="q-pa-md q-gutter-sm"
        style="overflow-y: auto; max-height: 50%; height: 50%; flex: 0 1 auto"
      >
        <q-tree
          :nodes="tileTree"
          ref="inputTree"
          default-expand-all
          v-model:selected="selectedNodeInput"
          :duration="50"
          node-key="value"
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
                this.selectedNodeInput = this.lastSelectednode;

                var tileId = parseInt(this.selectedNodeInput.split('|')[1]);
                if (this.nodesInput[tileId].meta) {
                  this.setActiveLayer(tileId);
                }
              }
            }
          "
          @update:expanded="resetFocus"
        >
          <template v-slot:default-header="prop">
            <!-- <q-tooltip v-if="prop.node.value === '|0'"
              >The root tile overlays everything by default.</q-tooltip
            > -->
            <div
              class="row items-center"
              v-bind:class="{
                selectedtree: prop.tree.selected === prop.node.value,
                selectedlayer: String(prop.node.key) === this.activeLayer,

                // disabledroot: prop.node.value === '|0',
              }"
            >
              <q-img
                style="margin-right: 8px"
                class="unselectable"
                width="24px"
                height="24px"
                :src="this.tiles[prop.node.key]?.img?.src"
              />
              <div class="text-weight-bold unselectable">
                {{ prop.node.name }}
              </div>
            </div>
          </template>
        </q-tree>
      </div>

      <div class="q-mx-md q-mt-sm" style="flex: 0 1 auto; max-height: 2em">
        <b
          class="text-uppercase text-h6 text-weight-bold"
          title="The tiles that
          can be painted with"
        >
          Available Tiles</b
        >
      </div>
      <q-separator style="height: 1px; width: 100%" vertical inset />
      <div
        class="q-pa-md q-gutter-sm"
        style="overflow-y: auto; max-height: 50%; flex: 0 1 auto"
      >
        <q-btn-toggle
          v-model="this.selectedNodeInput"
          class="buttonToggleUnallocated"
          unelevated
          size="md"
          toggle-color="blue-3"
          :options="this.unallocated"
          style="flex-wrap: wrap"
          @click="resetFocus"
        >
          <template
            v-for="node in this.unallocated"
            :key="node.value"
            v-slot:[node.slot]
          >
            <q-tooltip class="bg-primary text-body2">{{ node.name }}</q-tooltip>
            <q-btn
              style="
                position: absolute;
                right: 0;
                bottom: 0;
                min-width: 0px;
                min-height: 0px;
                padding: 0;
                margin: 0;
                width: 16px;
                height: 16px;
                color: black;
                background-color: white;
              "
              icon="edit"
              size="xs"
              dense
              @click="
                this.addtile = true;
                this.addtileop = 'edit';
              "
            ></q-btn>
          </template>
        </q-btn-toggle>
        <q-btn
          style="width: 48px; height: 48px"
          icon="add"
          @click="
            this.addtile = true;
            this.addtileop = 'add';
          "
        ></q-btn>

        <q-dialog ref="addtiledialog" v-model="addtile">
          <q-card style="width: 40%; height: 50%">
            <q-card-section>
              <div class="text-h6">{{ addtilebuttonname }}</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <q-list>
                <q-item>
                  <q-item-section>
                    <q-input
                      ref="addtilenamefield"
                      label="Name"
                      v-model="addtilename"
                      :rules="[
                        (val) => !!val || 'Field is required',
                        (val) =>
                          !this.nodeArray.find(
                            (n) =>
                              (n.name === val && this.addtileop === 'add') ||
                              (n.name === val &&
                                n.value !== this.selectedNodeInput &&
                                this.addtileop === 'edit')
                          ) || 'A tile with this name already exists',
                        (val) =>
                          !val.includes('-') ||
                          'Tile names may not have dashes',
                      ]"
                    ></q-input>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section> Tile Type </q-item-section>
                  <q-item-section>
                    <q-space></q-space>
                  </q-item-section>

                  <q-item-section>
                    <q-radio v-model="addtilemeta" :val="false" label="Regular"
                  /></q-item-section>
                  <q-item-section>
                    <q-radio v-model="addtilemeta" :val="true" label="Meta"
                  /></q-item-section>
                </q-item>
                <q-item v-if="addtilemeta">
                  <q-item-section> Tile Color </q-item-section>
                  <q-item-section>
                    <div
                      :style="`background-color: ${addtilecolor}`"
                      style="width: 32px; height: 32px"
                    ></div>
                  </q-item-section>
                  <q-item-section>
                    <q-input
                      ref="addtilecolorfield"
                      filled
                      v-model="addtilecolor"
                      dense
                      hide-bottom-space
                      :rules="['anyColor']"
                      class="my-input"
                    >
                      <template v-slot:append>
                        <q-icon name="colorize" class="cursor-pointer">
                          <q-popup-proxy
                            cover
                            transition-show="scale"
                            transition-hide="scale"
                          >
                            <q-color v-model="addtilecolor" />
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                    </q-input>
                  </q-item-section>
                  <!-- <q-item-section
                    >
    </q-item-section> -->
                  <!-- <q-icon name="colorize" class="cursor-pointer" size="md">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-color v-model="addtilecolor" />
                    </q-popup-proxy>
                  </q-icon> -->
                </q-item>
                <q-item v-if="!addtilemeta">
                  <q-item-section>Tile Image</q-item-section>
                  <q-item-section>
                    <q-file
                      dense
                      ref="addtilefilefield"
                      v-model="addtilefile"
                      label="Standard"
                      :rules="[(val) => !!val || 'Field is required']"
                      @update:model-value="readTileImage()"
                  /></q-item-section>
                </q-item>
              </q-list>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn
                flat
                :label="addtilebuttonname"
                color="primary"
                @click="
                  if (
                    $refs.addtilenamefield.validate() &&
                    (($refs.addtilecolorfield?.validate() &&
                      this.addtilemeta) ||
                      ($refs.addtilefilefield?.validate() && !this.addtilemeta))
                  ) {
                    if (addtileop === 'add') {
                      addNewTile(
                        this.addtilename,
                        this.addtilecolor,
                        this.addtileimage,
                        this.addtilemeta
                      );
                    } else {
                      editTile(
                        parseInt(selectedNodeInput.split('|')[1]),
                        this.addtilename,
                        this.addtilecolor,
                        this.addtileimage,
                        this.addtilemeta
                      );
                    }
                    this.addtile = false;
                  } else {
                    $refs.addtiledialog.shake();
                  }
                "
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
        <!-- <div
          style="width: 48px; height: 48px"
          v-for="t in unallocated"
          :key="t"
        ></div> -->
      </div>
    </div>

    <div class="settingsArea">
      <div class="q-mx-md q-mt-sm" style="flex: 0 1 auto; max-height: 2em">
        <b class="text-uppercase text-h6 text-weight-bold"> Settings</b>
      </div>

      <q-separator style="height: 1px; width: 100%" vertical inset />

      <div class="q-pa-md q-gutter-sm" style="overflow: hidden; flex: 0 1 auto">
        <q-item dense>
          <span class="row">
            <q-input
              v-model.number="this.inputWidth"
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
              v-model.number="this.inputHeight"
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
      </div>
    </div>
    <!-- TODO: Turn into classes -->
    <div class="canvasHeader">
      <q-card
        ><q-card-section
          class="row items-center q-pb-none text-uppercase text-h6 text-weight-bold"
          ><q-space></q-space>{{ this.layerName
          }}<q-space></q-space></q-card-section
      ></q-card>
    </div>

    <div class="canvasArea">
      <div
        class="canvasHolder"
        :style="`aspect-ratio: ${this.inputAspect(
          true
        )}/ ${this.inputAspect()};`"
      >
        <canvas
          v-for="(l, i) of layers"
          v-show="this.activeLayer === l.id"
          :key="i"
          :ref="`layer-${l.id}`"
          :width="this.tileDim * this.inputWidth"
          :height="this.tileDim * this.inputHeight"
        ></canvas>

        <canvas
          id="inputhighlight"
          :width="this.inputWidth"
          :height="this.inputHeight"
        ></canvas>
      </div>
    </div>

    <div class="footerArea">
      <q-bar class="bg-grey">
        <q-badge transparent :align="'middle'">
          x: {{ this.mx }} | y: {{ this.my }}
        </q-badge>

        <q-badge v-show="true" transparent :align="'middle'">
          current:
          {{
            //  Formula: c + C * y + C * Y * x
            this.mx >= 0 &&
            this.mx < this.width &&
            this.my >= 0 &&
            this.my < this.height
              ? this.nodeArray[
                  this.metaLayers[this.activeLayer]?.matrix?._data?.[this.mx]?.[
                    this.my
                  ]
                ]?.name
              : "n/a"
          }}
        </q-badge>
      </q-bar>
    </div>
  </div>

  <!-- ENVIRONMENT EDITOR -->
  <div class="mainGrid" v-show="tab === 'environment'">
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
          node-key="value"
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
                selectedtree: prop.tree.selected === prop.node.value,
                prb0: this.probDict[prop.node.value] === this.probMods[0].value,
                prb1: this.probDict[prop.node.value] === this.probMods[1].value,
                prb2: this.probDict[prop.node.value] === this.probMods[2].value,
                prb3: this.probDict[prop.node.value] === this.probMods[3].value,
                prb4: this.probDict[prop.node.value] === this.probMods[4].value,
              }"
            >
              <q-img
                style="margin-right: 8px"
                class="unselectable"
                width="24px"
                height="24px"
                :src="this.tiles[prop.node.key]?.img?.src"
              />
              <div class="text-weight-bold unselectable">
                {{ prop.node.name }}
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

    <div class="footerArea">
      <q-bar class="bg-grey">
        <q-badge transparent :align="'middle'">
          x: {{ this.mx }} | y: {{ this.my }}
        </q-badge>

        <q-badge v-show="true" transparent :align="'middle'">
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
        <q-badge v-show="true" transparent :align="'middle'">
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
        <q-badge v-show="true" transparent :align="'middle'">
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
  dotMultiply,
  bitOr,
  bitXor,
  reviver,
  ones,
  setCartesian,
  range,
  sum,
  format,
  floor,
  sin,
  clone,
} from "mathjs";
import hexRgb from "hex-rgb";
import download from "downloadjs";
// import { v4 as uuidv4 } from "uuid";

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
      lastSelectednode: "",
      worker: undefined,
      tool: 0,
      tiles: [], // Needed for import/export
      tileTree: [{ label: "none", color: [0, 0, 0] }],
      nodeArray: [], // Needed for import/export
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
      contradictionBuffer: [],
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
      tab: "environment",
      overrides: {},
      //////////////////////////////////////////////////////////////////////////////////////
      // VARIABLES/DATA FOR INPUT EDITOR -
      // TODO: SPLIT THIS OFF TO SEPARATE COMPONENTS
      /////////////////////////////////////////////////////////////////////////////////////
      metaLayers: {}, // Needed for import/export
      inputHighlightContext: undefined,
      selectedNodeInput: "",
      expandedInput: [],
      inputWidth: 16,
      inputHeight: 16,
      addtile: "none",
      addtileop: "add",
      addtilename: "",
      addtilemeta: false,
      addtilecolor: "#aaaaaa",
      addtilefile: undefined,
      activeLayer: "0",
      inputMetaLayerMap: {},
      importtileset: false,
      tilesetatlasfile: undefined,
      tilesetatlassize: 8,
      tilesetatlasimage: undefined,
      uploadedtilesetfile: undefined,
      startingGhost: 0,
      startingTile: -1,
      edgeOverrides: {},
      refresh: 0,
    };
  },
  computed: {
    getWindow() {
      return window;
    },
    tile_index() {
      return parseInt(this.selectedNode.split("|")[1]);
    },
    unallocated() {
      this.refresh;
      return this.nodeArray.filter(
        (t) => !(String(t.key) in this.inputMetaLayerMap || t.key === 0)
      );
    },
    allocated() {
      return this.nodeArray.filter(
        (t) => String(t.key) in this.inputMetaLayerMap || t.key === 0
      );
    },
    layers() {
      return Object.entries(this.metaLayers).map((l) => {
        return { ...l[1], id: l[0] };
      });
    },
    layerName() {
      return "Layer: " + this.nodeArray?.[parseInt(this.activeLayer)]?.name; //this.nodesInput;
    },
    addtilebuttonname() {
      return this.addtileop === "add" ? "Add Tile" : "Edit Tile";
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

      const edgeoverride = this.edgeOverrides[this.selectedNode];
      console.log("HUH", edgeoverride, this.edgeOverrides);

      this.worker.postMessage({
        question: "prob mod",
        value: [
          !!edgeoverride ? edgeoverride : this.selectedNode,
          this.probDict[this.selectedNode],
        ],
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
          toRaw(this.overrides),
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
    updateHighlight(w, h, ctx) {
      const arr = Uint8ClampedArray.from(new Array(w * h * 4));

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
            this.mx + i < w &&
            this.my + j >= 0 &&
            this.my + j < h
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

      for (let p of this.contradictionBuffer) {
        arr[4 * p[0] + 4 * p[1] * w + 0] =
          100 + (155 * (1 + sin(this.time / 5))) / 2;

        arr[4 * p[0] + 4 * p[1] * w + 3] = 255;
      }

      const highlightImg = new ImageData(arr, w, h);
      ctx.putImageData(highlightImg, 0, 0);
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
        this.entropyContext.clearRect(0, 0, w, h);
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
        let tileImage = this.tiles[matrix?.[i]?.[j]]?.img;
        if (!tileImage) {
          tileImage = this.tiles[this.overrides[matrix?.[i]?.[j]]]?.img;
        }
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
    // TODO: change method arg
    selectTileset(json, invertedIndex = null) {
      // console.log(
      //   toRaw(this.importedTilesets),
      //   path,
      //   toRaw(this.importedTilesets)[path]
      // );
      // console.log(
      //   toRaw(this.importedTilesets)["../assets/data/1_dev_tileset.json"]
      // );

      this.tilesetData = json;

      const nodes = json.nodes;
      const nodeCount = Object.keys(nodes).length;

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

      let buildIndex = false;
      if (!invertedIndex) {
        buildIndex = true;
        invertedIndex = {};
      }

      for (const n in nodes) {
        if (buildIndex) {
          invertedIndex[n] = i;
        }
        nodeArray[invertedIndex[n]] = nodes[n];
        const node = nodes[n];
        const tile = {
          slot: n,
          color: `${node.color}`,
          value: invertedIndex[n],
          meta: node.meta,
        };

        if (!("image" in node)) {
          tile.img = new Image();
          tile.img.src = new URL(
            `../assets/data/${json.name}/${n}.png`,
            import.meta.url
          ).href;

          tile.img.onload = () => {
            this.tileDim = tile.img.width;
          };
        } else {
          tile.img = node.image;
          delete node.image;
        }
        this.tiles[invertedIndex[n]] = tile;

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
        // this.print(this.tiles[nodeIndex].img);
        treeNode.color = `${node.color}`;
        treeNode.paintable = node.paintable;
        treeNode.key = nodeIndex;
        treeNode.name = n;
        treeNode.slot = n;
        treeNode.icon = `img:${this.tiles[nodeIndex].img.src}`;
        treeNode.meta = node.meta;
        treeNodeArray[nodeIndex] = treeNode;
      }

      const root = treeNodeArray[invertedIndex["root"]];
      root.value = "|0";
      const memory = {};
      memory[root.value] = root;
      const queue = [root.value];

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
            child.value = edge;
            this.probDict[edge] = 1;
          }

          memory[edge] = child;
          nextTreeNode.children.push(child);
          queue.push(edge);
        }
      }

      this.tileTree = [root];
      this.nodeArray = treeNodeArray;
      // A little necessary evil
      this.nodeArray.forEach((n) => {
        n.value = `|${n.key}`;
      });

      this.expanded.push(this.tileTree[0].value);
      this.tileTree[0].children.forEach((c) => {
        this.expanded.push(c.value);
      });

      // console.log(nodeIndex);

      // Build adjacency matrices
      // TODO: Make per-meta ADJ matrix
      const adjmeta = {};

      for (const name in nodes) {
        const adjacencies = {
          U: zeros(nodeCount, nodeCount),
          D: zeros(nodeCount, nodeCount),
          L: zeros(nodeCount, nodeCount),
          R: zeros(nodeCount, nodeCount),
        };

        // const oppositeDir = {
        //   U: "D",
        //   D: "U",
        //   L: "R",
        //   R: "L",
        // };

        const node = nodes[name];

        for (const dir in node.adjacencies) {
          for (const adj of node.adjacencies[dir]) {
            const pair = adj.split(">-<");
            const index1 = invertedIndex[pair[0]];
            const index2 = invertedIndex[pair[1]];
            adjacencies[dir].set([index1, index2], 1);
          }
        }

        adjmeta[name] = adjacencies;
      }

      // Get all possible paths from root
      // Lazy way to do it: just get all possible paths from the expanded tree, then eliminate paths that consist of the same IDs.
      // Lazy way to do it the lazy way: use a dict, and use the stringified chain of IDs as keys, and arrays of nodes as the values

      // Non-recursive depth-first-based algorithm to get all the possible paths
      const stack = [root];
      let path = [];
      const branching_points = [];
      const paths = {}; // key is a node, value is a list of all the paths from root until this node
      const metaPaths = {};
      while (stack.length > 0) {
        branching_points.shift();
        const node = stack.shift();
        path.push(node);
        for (const child of node.children) {
          stack.unshift(child);
          branching_points.unshift(path.length);
        }
        if (node.children.length === 0) {
          const key = path[path.length - 1].key;
          if (!(key in paths)) {
            paths[key] = [];
          }
          paths[key].push([...path]);
          path = path.slice(0, branching_points[0]);
        }
      }

      // Armed with all the possible paths in the DAG, we should cascade adjacencies on each of them
      // QUESTION:
      // - Do we do this for every tile? Or only for leaf tiles?
      // - If we do this for every tile, then we need the unfinished paths as well; it just means that above we make a record at every step instead of just when a path is finished.
      // - Lets start with just the leaves
      const final_adjacencies = {
        U: zeros(nodeCount, nodeCount),
        D: zeros(nodeCount, nodeCount),
        L: zeros(nodeCount, nodeCount),
        R: zeros(nodeCount, nodeCount),
      };

      const splits = {};
      for (const key in paths) {
        const cascades = {};
        let firstKey;
        for (const path of paths[key]) {
          const pathKey = path.map((n) => n.key).join(".");
          const adj = {
            U: zeros(nodeCount, nodeCount),
            D: zeros(nodeCount, nodeCount),
            L: zeros(nodeCount, nodeCount),
            R: zeros(nodeCount, nodeCount),
          };
          for (const node of path) {
            for (const dir in adj) {
              adj[dir] = bitOr(adj[dir], adjmeta[node.name][dir]);
            }
          }

          const cascadeKeyArr = [];
          for (const dir in adj) {
            cascadeKeyArr.push(
              adj[dir].subset(index(parseInt(key), range(0, nodeCount)))
            );
            cascadeKeyArr.push(
              adj[dir].subset(index(range(0, nodeCount), parseInt(key)))
            );
          }

          const cascadeKey = format(cascadeKeyArr);
          if (Object.values(cascades).length === 0) {
            firstKey = cascadeKey;
            // Set adjacencies for the first one
            for (const dir in final_adjacencies) {
              final_adjacencies[dir].subset(
                index([parseInt(key)], range(0, nodeCount)),
                adj[dir].subset(index(parseInt(key), range(0, nodeCount)))
              );
              final_adjacencies[dir].subset(
                index(range(0, nodeCount), [parseInt(key)]),
                adj[dir].subset(index(range(0, nodeCount), parseInt(key)))
              );
            }
          }
          if (!(cascadeKey in cascades)) {
            cascades[cascadeKey] = [];
          }
          // PATH, ADJ, NODE
          cascades[cascadeKey].push([path, clone(adj), path[path.length - 1]]);
        }

        let indexCounter = nodeCount + Object.values(splits).length;
        console.log("COUNTER", indexCounter);
        for (const c in cascades) {
          // console.log("ITERATING CASCADE", c, cascades[c]);
          if (c !== firstKey) {
            // console.log("VALID CASCADE");
            const paths = cascades[c].map((entry) => entry[0]);
            const cascade = cascades[c][0][1];
            const node = cascades[c][0][2];
            splits[indexCounter] = [paths, cascade, node];
            indexCounter++;
          }
        }

        // console.log("SPLITS:", splits);
        // Now iterate through the cascades and find inequalities --> split these off
        // TODO: Finish this clustering technique...
        // const bins = {};
        // for (const c in cascades) {
        //   const cascadeKey = cascades[c][2];
        //   bins[cascadeKey] = [];
        // }

        // console.log("BIN", bins);

        // for (const c1 in cascades) {
        //   console.log(cascades[c1]);
        //   const cascade1 = cascades[c1][1];
        //   const c1path = cascades[c1][0];
        //   const leafIndex = c1path[c1path.length - 1].key;
        //   outer: for (const b in bins) {
        //     const bin = bins[b];
        //     for (const [c2path, cascade2] of bin) {
        //       for (const dir in cascade1) {
        //         if (
        //           sum(
        //             bitXor(
        //               cascade1[dir].subset(
        //                 index(leafIndex, range(0, nodeCount))
        //               ),
        //               cascade2[dir].subset(
        //                 index(leafIndex, range(0, nodeCount))
        //               )
        //             )
        //           ) > 0
        //         ) {
        //           // splits[c2] = [c2path, cascade2];
        //           for (const c of bins[c1]) {
        //             bin.push(c);
        //           }
        //           bins[c1] = [];
        //           break outer;
        //         }
        //       }
        //     }
        //   }
        // }

        // console.log(bins);

        // for (const c1 in cascades) {
        //   for (const c2 in cascades) {
        //     const cascade1 = cascades[c1][1];
        //     const cascade2 = cascades[c2][1];
        //     const c2path = cascades[c2][0];
        //     const leafIndex = c2path[c2path.length - 1].key;

        //     // TODO: Should probably reconsider this approach, the aim is to reduce
        //     // Or even better --> we should cluster
        //     // Bin accumulation:
        //     // - Compare cascade to all the "binned" cascades
        //     // - If cascade is not similar to any of them, add a new "bin"
        //     // - Otherwise, attribute the cascade to that bin
        //     // - Create new split for every bin

        //     if (c1 != c2 && !(c1 in splits) && !(c2 in splits)) {
        //       for (const dir in cascade1) {
        //         if (
        //           sum(
        //             bitXor(
        //               cascade1[dir].subset(
        //                 index(leafIndex, range(0, nodeCount))
        //               ),
        //               cascade2[dir].subset(
        //                 index(leafIndex, range(0, nodeCount))
        //               )
        //             )
        //           ) > 0
        //         ) {
        //           splits[c2] = [c2path, cascade2];
        //           break;
        //         }
        //       }
        //     }
        //   }
        // cascades[path];
      }
      console.log("ADJ SO FAR:", structuredClone(final_adjacencies));
      // Object.values(final_adjacencies).forEach((e) => {
      //   console.log(format(e));
      // });

      // const compressed_adjacencies = {
      //   U: Object.values(adjmeta)
      //     .map((adj) => adj.U)
      //     .reduce((acc, c) => bitOr(acc, c)),
      //   D: Object.values(adjmeta)
      //     .map((adj) => adj.D)
      //     .reduce((acc, c) => bitOr(acc, c)),
      //   R: Object.values(adjmeta)
      //     .map((adj) => adj.R)
      //     .reduce((acc, c) => bitOr(acc, c)),
      //   L: Object.values(adjmeta)
      //     .map((adj) => adj.L)
      //     .reduce((acc, c) => bitOr(acc, c)),
      // };

      // Now that we have all the potential splits, we need to check each one, and create a new tile.
      // There is a dumb way to do this, and a smart one.
      // The dumb but neat way is to add the nodes to the tiles/node arrays, which will break everything unless I split off the ones intended for the input and copy over
      // The smart and lazy way is to specify some kind of overrides map (is it smart though..?)

      const splitCount = Object.values(splits).length;
      for (const dir in final_adjacencies) {
        final_adjacencies[dir].resize([
          nodeCount + splitCount,
          nodeCount + splitCount,
        ]);
      }

      const overrides = {};
      for (const splitKey in splits) {
        const [_, __, node] = splits[splitKey];
        overrides[splitKey] = node.key;
      }

      for (const splitKey in splits) {
        const splitKeyNum = parseInt(splitKey);
        const [paths, cascade, node] = splits[splitKey];

        console.log("SPLIT", paths, cascade, node);
        const oldChild = node;
        const newName = `${oldChild.name}-${splitKey}`; // Should basically remain the same
        const newChild = {
          paintable: true,
          generate: true,
          meta: oldChild.meta,
          color: [
            // Color is deprecated
            0, 0, 0, 255,
          ],
          children: {},
          adjacencies: {
            // Unused, only used in the input
            // TODO: See if we can ditch it
            U: [],
            D: [],
            L: [],
            R: [],
          },
        };
        nodes[newName] = newChild;

        for (const path of paths) {
          if (path.length > 1) {
            const oldParent = path[path.length - 2];
            this.edgeOverrides[
              `${oldParent.key}|${oldChild.key}`
            ] = `${oldParent.key}|${splitKey}`;
            nodes[oldParent.name].children[newName] =
              nodes[oldParent.name].children[oldChild.name];
            delete nodes[oldParent.name].children[oldChild.name];
            // this.probDict[`${oldParent.key}|${splitKey}`] = 1;
          }
        }
        console.log("OVERRIDES:", overrides);
        console.log(splitCount);
        for (const dir in final_adjacencies) {
          const indices = range(0, nodeCount);

          // Swap original index with split index
          indices.set([oldChild.key], splitKeyNum);

          // We're skipping split<->original and original<->split
          //
          final_adjacencies[dir].subset(
            index([splitKeyNum], indices),
            cascade[dir].subset(index([oldChild.key], range(0, nodeCount)))
          );
          final_adjacencies[dir].subset(
            index(indices, [splitKeyNum]),
            cascade[dir].subset(index(range(0, nodeCount), [oldChild.key]))
          );

          // How can this possibly break... It somehow forgets about
          for (let i = nodeCount; i < nodeCount + splitCount; i++) {
            console.log(
              "SET:",
              `[${splitKeyNum},${i}] to value at [${oldChild.key},${
                overrides[i]
              }] which is ${cascade[dir].get([oldChild.key, overrides[i]])}`
            );

            final_adjacencies[dir].set(
              [splitKeyNum, i],
              cascade[dir].get([oldChild.key, overrides[i]])
            );
            final_adjacencies[dir].set(
              [i, splitKeyNum],
              cascade[dir].get([overrides[i], oldChild.key])
            );
          }

          // Asymmetrical adjacencies in order to deal with meta-tile interface
          // This is where we deal with split<->original and original<->split
          // This does create illegal tile configurations, but we are okay with these
          final_adjacencies[dir].set(
            [splitKeyNum, oldChild.key],
            final_adjacencies[dir].get([splitKeyNum, splitKeyNum])
          );
          final_adjacencies[dir].set(
            [oldChild.key, splitKeyNum],
            final_adjacencies[dir].get([oldChild.key, oldChild.key])
          );
        }

        invertedIndex[newName] = splitKeyNum;
      }
      this.overrides = overrides;

      this.workerData.adjacencies = final_adjacencies;

      // this.workerData.adjacencies = adjmeta;
      this.workerData.nodes = nodes;
      this.workerData.invertedIndex = invertedIndex;

      this.nodesInput = treeNodeArray;
      // Build adjacency hashmap
      this.initWorker();
      nextTick(() => {
        this.$refs.inputTree.expandAll();
      });
      // console.log("tiles", this.tiles);
    },

    ////////////////
    // METHODS FOR INPUT EDITOR
    /////////////////////////////////

    inputAspect(w) {
      return w
        ? min(1, this.inputWidth / this.inputHeight)
        : min(1, this.inputHeight / this.inputWidth);
    },
    setActiveLayer(layerId) {
      this.activeLayer = String(layerId);
    },
    generateMetatileImage(color, dim) {
      var canvas = document.createElement("canvas");
      canvas.width = dim;
      canvas.height = dim;
      var context = canvas.getContext("2d");
      context.fillStyle = `rgb(${color})`;
      context.fillRect(0, 0, dim, dim);
      return canvas.toDataURL("image/png");
    },
    editTile(id, name, color, image, meta) {
      const node = this.nodeArray[id];
      const tile = this.tiles[id];

      node.name = name;
      tile.name = name;
      const c = hexRgb(color, { format: "array" });
      c.pop();
      const imgUrl = meta ? this.generateMetatileImage(c, this.tileDim) : image;

      if (meta) {
        node.color = String(c);
        tile.color = node.color;
        if (!node.meta && meta) {
          this.addNewLayer(String(id));
        }
      } else {
        node.icon = imgUrl;
      }
      node.meta = meta;
      tile.meta = meta;
      tile.img.src = imgUrl;

      this.updateCanvas(
        this.width,
        this.height,
        setCartesian(range(0, this.width), range(0, this.height))._data
      );
      this.refresh++;
    },
    addNewTile(name, color, image, meta) {
      const c = hexRgb(color, { format: "array" });
      c.pop();
      const nodeKey = this.tiles.length;
      const imgUrl = meta ? this.generateMetatileImage(c, this.tileDim) : image;

      const node = {
        color: String(c),
        paintable: true,
        key: nodeKey,
        name: name,
        value: `|${nodeKey}`,
        slot: `|${nodeKey}`,
        children: [],
        icon: `img:${imgUrl}`,
        meta: meta,
      };

      const tile = {
        slot: name,
        color: node.color,
        value: nodeKey,
        meta: meta,
      };
      tile.img = new Image();
      tile.img.width = this.tileDim;
      tile.img.height = this.tileDim;
      tile.img.src = imgUrl;

      this.tiles.push(tile);
      this.nodeArray.push(node);

      if (meta) {
        this.addNewLayer(String(nodeKey));
      }
    },
    addNewLayer(id) {
      console.log("Adding new metalayer", id);
      this.metaLayers[id] = {
        matrix: dotMultiply(-1, ones(this.inputWidth, this.inputHeight)),
        ghost: zeros(this.inputWidth, this.inputHeight),
        id: id,
      };
    },
    inputPaint() {
      const context =
        this.$refs[`layer-${this.activeLayer}`][0]?.getContext("2d");

      // document
      //   .getElementById(`layer-${this.activeLayer}`)

      this.print(this.metaLayers);
      this.print(this.activeLayer);
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
          if (i >= 0 && i < this.inputWidth && j >= 0 && j < this.inputHeight) {
            var layer = this.metaLayers[this.activeLayer];
            var tileId = parseInt(this.selectedNodeInput.split("|")[1]);

            if (this.selectedNodeInput === "ERASER") {
              tileId = -1;
              layer.ghost._data[i][j] = false;
            }

            if (this.activeLayer === String(tileId)) {
              continue;
            }

            // TODO: Check for cycle
            if (this.isAncestor(tileId, parseInt(this.activeLayer))) {
              continue;
            }

            if (this.startingTile === tileId) {
              layer.ghost._data[i][j] = !this.startingGhost;
            }

            layer.matrix._data[i][j] = tileId;

            this.updateInputCanvas([[i, j]], layer, context);
          }
        }
      }
    },
    // TODO: Implement
    isAncestor(ancestor, of) {
      return false;
    },
    updateInputCanvas(cells, layer, ctx) {
      const data = layer.matrix._data;
      const ghost = layer.ghost._data;
      for (const c of cells) {
        const i = c[0];
        const j = c[1];
        const tileImage = this.tiles[data?.[i]?.[j]]?.img;

        if (tileImage) {
          if (ghost?.[i]?.[j] === 1 || ghost?.[i]?.[j] === true) {
            console.log("CLEARING TILE");
            ctx.globalAlpha = 0.5;
            ctx.clearRect(
              i * this.tileDim,
              j * this.tileDim,
              this.tileDim,
              this.tileDim
            );
          }
          ctx.drawImage(tileImage, this.tileDim * i, this.tileDim * j);
          ctx.globalAlpha = 1.0;
        } else {
          ctx.clearRect(
            i * this.tileDim,
            j * this.tileDim,
            this.tileDim,
            this.tileDim
          );
          ctx.fillStyle = "rgba(0,0,0,0)";
          ctx.fillRect(
            i * this.tileDim,
            j * this.tileDim,
            this.tileDim,
            this.tileDim
          );
        }
      }
    },

    readTileImage() {
      const reader = new FileReader();
      reader.addEventListener(
        "load",
        () => {
          // convert image file to base64 string
          this.addtileimage = reader.result;
          this.addtilename = this.addtilefile.name.split(".")[0];
        },
        false
      );

      if (this.addtilefile) {
        reader.readAsDataURL(this.addtilefile);
      }
    },
    tilesetFromAtlas() {
      const reader = new FileReader();
      reader.addEventListener(
        "load",
        (file) => {
          const img = new Image();
          img.src = file.target.result;
          img.onload = () => {
            // We need to do some magic here...
            this.print(this.tilesetatlasimage);
            const h = floor(img.width / this.tilesetatlassize);
            const v = floor(img.height / this.tilesetatlassize);
            this.print(h);
            this.print(v);

            const dataUrls = [];
            for (let i = 0; i < h; i++) {
              for (let j = 0; j < v; j++) {
                var canvas = document.createElement("canvas");
                canvas.width = this.tilesetatlassize;
                canvas.height = this.tilesetatlassize;
                var context = canvas.getContext("2d");
                context.drawImage(
                  img,
                  i * this.tilesetatlassize,
                  j * this.tilesetatlassize,
                  this.tilesetatlassize,
                  this.tilesetatlassize,
                  0,
                  0,
                  this.tilesetatlassize,
                  this.tilesetatlassize
                );
                dataUrls.push(canvas.toDataURL("image/png"));
              }
            }

            // Using base64 to our advantage, we can eliminate duplicates easily by creating a set
            const uniqueTiles = new Set(dataUrls);
            let index = this.nodesInput.length;
            for (const image of Array.from(uniqueTiles)) {
              this.addNewTile(
                String(index),
                this.addtilecolor, // Unused for leaves anyway
                image,
                false
              );
              index++;
            }
          };
        },
        false
      );

      if (this.tilesetatlasfile) {
        reader.readAsDataURL(this.tilesetatlasfile);
      }
    },
    // This is to check which tiles are allocated/unallocated --> needs to change
    pruneMetaTiles() {
      // TODO: Fix
      // // this.print(this.inputMetaLayerMap);
      // Object.entries(this.inputMetaLayerMap).forEach((entry) => {
      //   let layer = this.layers.find((l) => l.id === entry[1]);
      //   if (entry[1] === "BASE") {
      //     layer = {
      //       context: this.baseContext,
      //       matrix: this.inputMat,
      //       id: "BASE",
      //     };
      //   }
      //   let found = false;
      //   for (const m of layer.matrix) {
      //     if (`${m.value}` === entry[0]) {
      //       found = true;
      //       break;
      //     }
      //   }
      //   if (!found) {
      //     delete this.inputMetaLayerMap[entry[0]];
      //   }
      // });
    },
    exportTileset() {
      const obj = {
        tiles: toRaw(this.tiles),
        nodeArray: toRaw(this.nodeArray),
        metaLayers: toRaw(this.metaLayers),
      };
      download(JSON.stringify(obj), "tileset.json", "text/plain");
    },
    getTilesetFile() {
      this.$refs.tilesetImport.$el.click();
    },
    importTileset() {
      const reader = new FileReader();
      reader.addEventListener(
        "load",
        (file) => {
          const obj = JSON.parse(file.target.result, (k, v) => {
            if (k === "matrix" || k === "ghost") {
              return reviver(k, v);
            }
            return v;
          });
          this.tiles = obj.tiles;
          this.nodeArray = obj.nodeArray;
          this.metaLayers = obj.metaLayers;
          for (const t of this.tiles) {
            const imageSource = this.nodeArray[t.value].icon.substring(4);
            t.img = new Image();
            t.img.src = imageSource;
          }

          nextTick(() => {
            for (const layer of this.layers) {
              const context =
                this.$refs[`layer-${layer.id}`][0]?.getContext("2d");
              this.updateInputCanvas(
                setCartesian(
                  range(0, this.inputWidth),
                  range(0, this.inputHeight)
                )._data,
                layer,
                context
              );
            }
          });

          this.buildMetaTree();
        },
        false
      );

      if (this.uploadedtilesetfile) {
        console.log(this.uploadedtilesetfile[0]);
        reader.readAsText(this.uploadedtilesetfile[0]);
      }
    },
    buildMetaTree() {
      console.log("LAYERS", this.metaLayers, this.layers);
      // STEPS
      // 1.) Collect allocated tiles
      // 2.) Create list of nodes
      // 3.) Iterate and "raycast" through each pixel of grid
      // 4.) find adjacencies

      // Find allocated nodes WRONG
      const treeNodes = this.nodeArray;

      // List of nodes according to input format
      const nodes = {};
      const index = {};
      const invertedIndex = {};
      treeNodes.forEach((n) => {
        index[n.key] = n.name;
        invertedIndex[n.name] = n.key;
        nodes[n.name] = {
          paintable: n.paintable,
          meta: n.meta,
          color: JSON.parse(`[${n.color}]`),
          children: {},
          image: this.tiles[n.key].img,
          adjacencies: {
            U: [],
            D: [],
            L: [],
            R: [],
          },
        };
      });

      for (let i = 0; i < this.inputWidth; i++) {
        for (let j = 0; j < this.inputHeight; j++) {
          // Assign children, probabilities and adjacencies
          // let prevNode = nodes[index[0]];
          for (const l of this.layers) {
            const metaName = index[l.id];
            const tileId = l.matrix._data[i][j];
            const ghost = l.ghost._data[i][j];

            if (tileId > 0) {
              const name = index[`${tileId}`];
              const neighbours = {
                U: l.matrix._data[i]?.[j - 1],
                D: l.matrix._data[i]?.[j + 1],
                L: l.matrix._data[i - 1]?.[j],
                R: l.matrix._data[i + 1]?.[j],
              };
              for (const n in neighbours) {
                if (neighbours[n] > 0) {
                  const neighbourName = index[neighbours[n]];

                  if (
                    nodes[metaName]["adjacencies"][n].findIndex(
                      (e) => e === `${name}>-<${neighbourName}`
                    ) === -1
                  ) {
                    nodes[metaName]["adjacencies"][n].push(
                      `${name}>-<${neighbourName}`
                    );
                  }
                }
              }

              const node = nodes[metaName];
              if (!ghost) {
                if (!(name in node.children)) {
                  node.children[name] = 0;
                }
                node.children[name] += 1;
              }
            }
          }
        }
      }
      this.print(nodes);
      this.selectTileset({ nodes: nodes }, invertedIndex);
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

    // For input
    var inputHighlightCanvas = document.getElementById("inputhighlight");
    this.inputHighlightContext = inputHighlightCanvas.getContext("2d");
    this.layers.forEach((layer) => {
      layer.matrix = dotMultiply(-1, ones(this.inputWidth, this.inputHeight));
      // layer.context = document
      //   .getElementById(`layer-${layer.id}`)
      //   .getContext("2d");
    });

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

          this.selectTileset(
            toRaw(toRaw(this.importedTilesets)[this.chosenTileset])
          );
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
        this.contradictionBuffer.push(...grid.contradictions);

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
            if (this.tab === "environment") {
              this.updateHighlight(
                this.width,
                this.height,
                this.highlightContext
              );
            } else if (this.tab === "input") {
              this.updateHighlight(
                this.inputWidth,
                this.inputHeight,
                this.inputHighlightContext
              );
            }
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
      }
    });

    highlightCanvas.addEventListener("mousedown", (e) => {
      e.preventDefault();
      if (e.button == 0) {
        this.leftMouseDown = true;
        this.markForPaint();
        this.checkpoint();
      }
    });

    // FOR INPUT EDITOR
    inputHighlightCanvas.addEventListener("mousemove", (e) => {
      e.preventDefault();
      const rect = inputHighlightCanvas.getBoundingClientRect();
      this.mxp = this.mx;
      this.myp = this.my;
      this.mx = round(
        (this.inputWidth * (e.clientX - rect.left)) /
          inputHighlightCanvas.offsetWidth -
          0.5
      );
      this.my = round(
        (this.inputHeight * (e.clientY - rect.top)) /
          inputHighlightCanvas.offsetHeight -
          0.5
      );
      const isPortrait = window.matchMedia(
        "screen and (orientation: portrait)"
      ).matches;
      if (isPortrait) {
        const x = this.mx;
        this.mx = this.inputWidth - this.my;
        this.my = x;
      }
      if (this.mx !== this.mxp || this.my !== this.myp) {
        if (this.leftMouseDown) {
          // PAINT INPUT
          this.inputPaint();
        }
      }
    });

    inputHighlightCanvas.addEventListener("mousedown", (e) => {
      e.preventDefault();
      if (e.button == 0) {
        this.leftMouseDown = true;

        // For ghost tiles
        this.startingGhost =
          this.metaLayers[this.activeLayer].ghost._data[this.mx][this.my];
        this.startingTile =
          this.metaLayers[this.activeLayer].matrix._data[this.mx][this.my];

        this.inputPaint();
        // PAINT INPUT
      }
    });

    document.addEventListener("mouseup", (e) => {
      if (e.button == 0 && this.leftMouseDown) {
        this.leftMouseDown = false;
        if (this.tab === "environment") {
          if (this.paintBuffer.length > 0) {
            this.worker.postMessage({
              question: "paint",
              value: [this.tile_index],
              cells: flatten(toRaw(this.paintBuffer)),
            });
          }
          this.processBuffer = this.paintBuffer;
          this.paintBuffer = [];
          this.contradictionBuffer = []; // TODO: Bit of a cop-out, should only clear the parts that were painted over
          this.paintMat = zeros(this.width, this.height);
        } else if (this.tab === "input") {
          this.pruneMetaTiles();
          this.buildMetaTree();
        }
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
    this.setStepSize();
    this.addNewLayer("0");
  },
});
</script>
