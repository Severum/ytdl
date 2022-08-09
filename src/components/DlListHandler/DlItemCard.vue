<template>
  <div class="itemCard">
    <div class="thumbnail">
      <img class="thumbnailTag" :src="item.thumbnail">
    </div>
    <div class="name">
      {{ item.name }}
    </div>

    <div v-if="!ended" class="downloading">
      <div class="loadingBar">
        <div :id="'progressBar'+item._id" class="progressBar" v-bind:style="{ width: item.percentage+'%' }"></div>
        <div class="percentage">{{item.percentage}}%</div>
      </div>
    </div>

    <div v-if="ended" class="downloaded">
      <div class="removeButton">
        <button class="button" v-on:click="removeCard">Terminé</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ipcRenderer } from "electron";

export default defineComponent({
  name: "DlItemCard",
  data() {
    return {
      registerPath: "",
      ended: false
    }
  },
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  created: function() {
    ipcRenderer.on("progressUrl" + this.item._id, (event: Electron.IpcRendererEvent, percent: number) => {
      this.item.percentage = percent;
    })
    ipcRenderer.on("endDl" + this.item._id, (event: Electron.IpcRendererEvent, success: boolean) => {
      this.ended = true;
    })
  },
  methods: {
    removeCard: function() {
      this.$store.commit("removeDlList", this.item);
    }
  }
});
</script>

<style scoped lang="scss">
.itemCard {
  position: relative;
  display: flex;
  flex-direction: column;
  border: solid 1px #757575;
  border-radius: 5px;
}
.thumbnail {
  margin-top: 1vh;
  height: 100%;
  width: 100%;
}
.thumbnailTag {
  height: 100%;
  width: 95%;
}
.name {
  color: #757575;
}
.downloading {
  margin:0.5vh;
}

.loadingBar{
  width:100%;
  height:auto;
  background:#dfe6e9;
  border-radius:5px;
  border: 1px solid #ffffff;

  .progressBar{
    height:100%;
    background:#166fe5;
    border-radius:5px;
  }
  .percentage{
    float:center;
    font-size:0.9em;
  }
}

.downloaded {
  margin:0.5vh;
}
.button {
  align-self: flex-end;
  height: 1.7rem;
  width: 6rem;
  font-family: inherit;
  background-color: #36a420;
  border-radius: 5px;
  border: 1px solid #757575;
  color: #f0f2f5;
  cursor: pointer;
}
</style>
