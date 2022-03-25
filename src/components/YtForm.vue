<template>
  <h1 class="title">Ytdl</h1>
  <div class="forminput forminputPath" :class="{ forminputfocus: focusDownloadPath }">
    <input v-model="item.downloadPath" type="text" name="downloadPath" class="input" @mouseup.right="rightClickMenu" @contextmenu.prevent v-on:focus="focusDownloadPath = true" v-on:focusout="focusDownloadPath = false"> <!-- v-on:keyup.enter="startDl()" -->
    <label for="downloadPath" class="label" :class="{ labelfocus: focusDownloadPath || item.downloadPath != '' }">chemin</label>
  </div>
  <div class="formcard">
    <div class="thumbnail">
      <img v-if="item.thumbnail != ''" :src="item.thumbnail" class="thumbnailTag">
    </div>
    <div class="forminput" :class="{ forminputfocus: focusName }">
      <input v-model="item.name" type="text" name="name" class="input" @mouseup.right="rightClickMenu" @contextmenu.prevent v-on:focus="focusName = true" v-on:focusout="focusName = false">
      <label for="name" class="label" :class="{ labelfocus: focusName || item.name != '' }">nom</label>
    </div>
    <!-- exemple url https://www.youtube.com/watch?v=Cv8EsAajC70 -->
    <div class="forminput" :class="{ forminputfocus: focusUrl }">
      <input v-model="item.url" type="text" name="url" class="input" @mouseup.right="rightClickMenu" @contextmenu.prevent v-on:focus="focusUrl = true" v-on:focusout="focusUrl = false">
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
  <!-- :click="closeMenu"   :style="{'top:'+this.top+'px', 'left:'+this.left+'px'}"  -->
  <ul id="rightClickMenu" tabindex="-1" v-if="viewRightClickMenu">
    <li>copier</li>
    <li>coller</li>
  </ul>
</template>

<script lang="ts">
import { defineComponent, nextTick } from 'vue'
import { ipcRenderer, Menu, MenuItem } from 'electron'
import fs from 'fs'
// import remote from 'remote'

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
      founded: false,
      // input
      focusDownloadPath: false,
      focusName: false,
      focusUrl: false,
      // rightClickMenu
      viewRightClickMenu: false,
      top: 0,
      left: 0,
    }
  },
  created: function() {
    // dl message
    ipcRenderer.on('infoUrl', (event: Electron.IpcRendererEvent, ytInfo: any) => {
      if (ytInfo) {
        if (this.item.name == "") {
          this.item.name = ytInfo.name
        }
        this.item.thumbnail = ytInfo.thumbnail
        this.founded = true
      } else {
        // TODO handle error
        this.founded = false
      }
    })
    ipcRenderer.on('dlUrl', (event: Electron.IpcRendererEvent, isStarted: boolean) => {
      if (isStarted) {
        this.$store.commit('addDlList', this.item)
        this.item = {
          _id: this.item._id + 1,
          name: "",
          downloadPath: this.item.downloadPath,
          url: "",
          thumbnail: "",
          percentage: 0,
        }
        this.founded = false
      } else {
        this.showErrorMessage("dlIssue")
      }
    })
  },
  methods: {
    setMenu: function(top: number, left: number) {
      let largestHeight = window.innerHeight - this.top - 25
      let largestWidth = window.innerWidth - this.left - 25
      if (top > largestHeight)
        top = largestHeight
      if (left > largestWidth)
        left = largestWidth
      this.top = top
      this.left = left
    },
    closeMenu: function() {
      this.viewRightClickMenu = false;
    },
    openMenu: function(e: Event) {
      this.viewRightClickMenu = true
      let test = this
      nextTick(function() {
        // this.right.focus()
        // test.setMenu(e.y, e.x)
      }.bind(this))
      e.preventDefault()
    },
    hideErrorsMessage: function() {
      if (document.getElementById("wrongPath")) {
        document.getElementById("wrongPath")!.style.display = "none"
      }
      if (document.getElementById("noUrl")) {
        document.getElementById("noUrl")!.style.display = "none"
      }
      if (document.getElementById("dlIssue")) {
        document.getElementById("dlIssue")!.style.display = "none"
      }
    },
    showErrorMessage: function(id: string) {
      if (document.getElementById(id)) {
        document.getElementById(id)!.style.display = "block"
      }
    },
    checkUrl: async function() {
      this.hideErrorsMessage()
      let isOk = true
      if (!fs.existsSync(this.item.downloadPath)){
        this.showErrorMessage("wrongPath")
        isOk = false
      }
      if (this.item.url == "") {
        this.showErrorMessage("noUrl")
        isOk = false
      }
      //  else {
      //   if () {
      //     this.showErrorMessage("noYtUrl")
      //     isOk = false
      //   }
      // }

      if (isOk) {
        try {
          ipcRenderer.send('infoUrl', JSON.stringify(this.item))
        } catch (err){
          throw err
        }
      }
    },
    startDl: async function() {
      try {
        ipcRenderer.send('dlUrl', JSON.stringify(this.item))
      } catch (err) {
        throw err
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
  border-bottom: 2px solid #e5e5e5;
  border-radius: 4px;
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
  border: 2px solid #e5e5e5;
}
.input {
  background-color: transparent;
  width: 100%;
  color: #e5e5e5;
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
  color: #e5e5e5;
  background-color: transparent;
}
.labelfocus {
  top: -10px;
  cursor: default;
  left: 0;
  background-color: #757575;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  font-size: 0.8rem;
}
.formcard {
  width: 70vw;
  margin-top:2rem;
  margin-right: 15vw;
  margin-left: 15vw;
  border: solid 1px #ffffff;
  border-radius: 5px;
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
  // display: block;
  color: rgb(207, 1, 1);
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
  background-color: #1f456b;
  border-radius: 5px;
  border: 1px solid #e5e5e5;
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
