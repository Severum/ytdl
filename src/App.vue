<template>
  <YtForm/>
  <DlListHandler/>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import YtForm from './components/YtForm.vue';
import DlListHandler from './components/DlListHandler.vue';

export default defineComponent({
  name: 'App',
  components: {
    YtForm,
    DlListHandler,
  },
});
</script>

<style lang="scss">
body {
  background-color:#f0f2f5;
  margin: 0;
  padding: 0;
}
#app {
  font-family: Georgia, serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #757575;
}
</style>
