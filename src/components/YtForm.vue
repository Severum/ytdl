<template>
  <h1 class="title">Ytdl</h1>
  <div class="forminput forminputPath" :class="{ forminputfocus: focusDownloadPath }">
    <input v-model="item.downloadPath" type="text" name="downloadPath" class="input" @mouseup.right="openRightClickMenu" @contextmenu.prevent v-on:focus="focusDownloadPath = true" v-on:focusout="focusDownloadPath = false"> <!-- v-on:keyup.enter="startDl()" -->
    <label for="downloadPath" class="label" :class="{ labelfocus: focusDownloadPath || item.downloadPath != '' }">chemin</label>
  </div>
  <div class="formcard">
    <div id="loader" class="loader">
      <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
    </div>
    <div class="thumbnail">
      <img v-if="item.thumbnail != ''" :src="item.thumbnail" class="thumbnailTag">
    </div>
    <div class="forminput" :class="{ forminputfocus: focusName }">
      <input v-model="item.name" type="text" name="name" class="input" @mouseup.right="openRightClickMenu" @contextmenu.prevent v-on:focus="focusName = true" v-on:focusout="focusName = false">
      <label for="name" class="label" :class="{ labelfocus: focusName || item.name != '' }">nom</label>
    </div>
    <!-- exemple url https://www.youtube.com/watch?v=Cv8EsAajC70 -->
    <div class="forminput" :class="{ forminputfocus: focusUrl }">
      <input v-model="item.url" type="text" name="url" class="input" @mouseup.right="openRightClickMenu" @contextmenu.prevent v-on:focus="focusUrl = true" v-on:focusout="focusUrl = false">
      <label for="url" class="label" :class="{ labelfocus: focusUrl || item.url != '' }">url</label>
    </div>
    <div class="footer">
      <div class="errorsGroup">
        <div id="wrongPath" class="errorMessage">
          Le dossier n'existe pas
        </div>
        <div id="noUrl" class="errorMessage">
          Le champs url est nécessaire
        </div>
        <div id="noYtUrl" class="errorMessage">
          Ce n'est pas une url Youtube
        </div>

        <div id="dlIssue" class="errorMessage">
          Problème de téléchargement
        </div>
      </div>
      <div class="buttonsGroup">
        <button id="dlButton" class="button" :class="{ buttonDisabled: !founded }" v-on:click="startDl">Télécharger</button>
        <button class="button" v-on:click="checkUrl">Suivant</button>
      </div>
    </div>
  </div>
  <!-- right click copy/paste  -->
  <ul id="rightClickMenu" tabindex="-1" v-show="rightClickMenu">
    <li id="copy" v-on:click="copyToClipboard" >copier</li>
    <li id="paste" v-on:click="pasteFromClipboard">coller</li>
  </ul>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ipcRenderer, clipboard } from 'electron';
import fs from 'fs';

export default defineComponent({
  name: 'YtForm',
  data() {
    return {
      item: {
        _id: 0,
        name: "",
        downloadPath: "",
        url: "",
        thumbnail: "",
        percentage: 0,
      },
      // is item data fill
      founded: false,
      // input tag decorator
      focusDownloadPath: false,
      focusName: false,
      focusUrl: false,
      // display rightClickMenu
      rightClickMenu: false,
      selectedInput: "",
      selectionToCopy: "",
    }
  },
  created: function() {
    // close right click menu
    window.addEventListener('click', (e: MouseEvent) => {
      if (this.rightClickMenu) {
        this.rightClickMenu = false;
      }
    })
    // get video data from yt
    ipcRenderer.on('infoUrl', (event: Electron.IpcRendererEvent, ytInfo: any) => {
      if (ytInfo) {
        this.item.name = ytInfo.name;
        this.item.thumbnail = ytInfo.thumbnail;
        this.founded = true;
        document.getElementById("loader")!.style.display = "none";
      } else {
        this.showErrorMessage("noYtUrl");
        this.founded = false;
        document.getElementById("loader")!.style.display = "none";
      }
    })
    // run download and reset form
    ipcRenderer.on('dlUrl', (event: Electron.IpcRendererEvent, isStarted: boolean) => {
      if (isStarted) {
        this.$store.commit('addDlList', this.item);
        this.item = {
          _id: this.item._id + 1,
          name: "",
          downloadPath: this.item.downloadPath,
          url: "",
          thumbnail: "",
          percentage: 0,
        };
        this.founded = false;
      } else {
        this.showErrorMessage("dlIssue");
      }
    })
  },
  methods: {
    openRightClickMenu: function(e: MouseEvent) {
      this.rightClickMenu = true;
      document.getElementById("rightClickMenu")!.style.left = e.clientX + "px";
      document.getElementById("rightClickMenu")!.style.top = e.clientY + "px";
      this.selectedInput = this.focusDownloadPath ? 'dlPath' : this.focusName ? 'name' : 'url';
      if (window.getSelection()) {
        this.selectionToCopy = window.getSelection() ? window.getSelection()!.toString() : "";
      }
      e.preventDefault();
    },
    hideErrorsMessage: function() {
      if (document.getElementById("wrongPath")) {
        document.getElementById("wrongPath")!.style.display = "none";
      }
      if (document.getElementById("noUrl")) {
        document.getElementById("noUrl")!.style.display = "none";
      }
      if (document.getElementById("noYtUrl")) {
        document.getElementById("noYtUrl")!.style.display = "none";
      }
      
      if (document.getElementById("dlIssue")) {
        document.getElementById("dlIssue")!.style.display = "none";
      }
    },
    showErrorMessage: function(id: string) {
      if (document.getElementById(id)) {
        document.getElementById(id)!.style.display = "block";
      }
    },
    checkUrl: async function() {
      this.hideErrorsMessage();
      let isOk = true;
      if (!fs.existsSync(this.item.downloadPath)){
        this.showErrorMessage("wrongPath");
        isOk = false;
      }
      if (this.item.url == "") {
        this.showErrorMessage("noUrl");
        isOk = false;
      }

      if (isOk) {
        try {
          ipcRenderer.send('infoUrl', JSON.stringify(this.item));
          document.getElementById("loader")!.style.display = "block";
        } catch(err) {
          throw err;
        }
      }
    },
    startDl: async function() {
      try {
        ipcRenderer.send('dlUrl', JSON.stringify(this.item));
      } catch (err) {
        throw err;
      }
    },  
    copyToClipboard: function() {
      clipboard.writeText(this.selectionToCopy);
    },
    pasteFromClipboard: function() {
      try {
        switch (this.selectedInput) {
          case "dlPath":
            this.item.downloadPath = clipboard.readText();
            return;
          case 'name': 
            this.item.name = clipboard.readText();
            return;
          case 'url':
            this.item.url = clipboard.readText();
            return;
          default:
            console.log("j'ai pas collé !!!" + clipboard.readBookmark());
        }
      } catch (e) {
        console.log(e);
        throw e;
      }
    }
    
  }
});
</script>

<style scoped lang="scss">
.title {
  font-size: 2rem;
}
.forminput {
  position: relative;
  margin: 5px;
  padding: 5px;
  border-top: 2px solid transparent;
  border-left: 2px solid transparent;
  border-right: 2px solid transparent;
  border-bottom: 2px solid #757575;
  border-radius: 4px;
  margin-top: 0.5rem;
  margin-right: 1rem;
  margin-left: 1rem;
  transition: all 0.2s ease;
}
.forminputPath {
  margin-left: 15vw;
  margin-right: 15vw;
  width: 70vw;
}
.forminputfocus {
  border: 2px solid #757575;
}
.input {
  background-color: transparent;
  width: 100%;
  color: #757575;
  font-family: inherit;
  border: none;
  outline: 0;
}
.label {
  position: absolute;
  cursor: text;
  top: 5px;
  left: 10px;
  transition: all 0.2s ease;
  color: #757575;
  background-color: transparent;
}
.labelfocus {
  top: -10px;
  cursor: default;
  left: 0;
  background-color: #f0f2f5;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  font-size: 0.8rem;
}
.formcard {
  width: 70vw;
  margin-top:2rem;
  margin-right: 15vw;
  margin-left: 15vw;
  border: solid 1px #757575;
  border-radius: 5px;
}
.loader {
  top: 9rem;
  left: 15%;
  height: 49%;
  width: 70%;
  border: solid 1px #757575;
  border-radius: 5px;
  background-color: #000000;
  opacity: 50%;
  display: none;
  z-index: 100;
  position: absolute;
}
.lds-ellipsis {
  opacity: 100%;
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}
.lds-ellipsis div {
  position: absolute;
  top: 33px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: #fff;
  animation-timing-function: cubic-bezier(0, 1, 1, 0);
}
.lds-ellipsis div:nth-child(1) {
  left: 8px;
  animation: lds-ellipsis1 0.6s infinite;
}
.lds-ellipsis div:nth-child(2) {
  left: 8px;
  animation: lds-ellipsis2 0.6s infinite;
}
.lds-ellipsis div:nth-child(3) {
  left: 32px;
  animation: lds-ellipsis2 0.6s infinite;
}
.lds-ellipsis div:nth-child(4) {
  left: 56px;
  animation: lds-ellipsis3 0.6s infinite;
}
@keyframes lds-ellipsis1 {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes lds-ellipsis3 {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}
@keyframes lds-ellipsis2 {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(24px, 0);
  }
}

.thumbnail {
  margin: 1rem;
  height: 15vh;
}
.thumbnailTag {
  height: 15vh;
  width: auto;
}
.footer {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}
.errorsGroup {
  align-self: center;
  margin: 1rem;
  min-height: 1rem;
}
.errorMessage {
  display: none;
  color: #f02849;
}
.buttonsGroup {
  display: flex;
  flex-direction: row-reverse;
  margin: 1rem;
}
.button {
  margin: 0.5rem;
  align-self: flex-end;
  height: 3rem;
  width: 6rem;
  font-family: inherit;
  background-color: #166fe5;
  border-radius: 5px;
  border: 1px solid #757575;
  color: #e5e5e5;
  cursor: pointer;
}
.buttonDisabled {
  opacity: 0.6;
  cursor: not-allowed;
}

#rightClickMenu{
  background: #FAFAFA;
  border: 1px solid #BDBDBD;
  box-shadow: 0 2px 2px 0 rgba(0,0,0,.14),0 3px 1px -2px rgba(0,0,0,.2),0 1px 5px 0 rgba(0,0,0,.12);
  display: block;
  list-style: none;
  margin: 0;
  padding: 0;
  position: absolute;
  width: 250px;
  z-index: 999999;
}
#rightClickMenu li {
  border-bottom: 1px solid #E0E0E0;
  margin: 0;
  padding: 5px 35px;
}
#rightClickMenu li:last-child {
  border-bottom: none;
}
#rightClickMenu li:hover {
  background: #1E88E5;
  color: #FAFAFA;
}
</style>
