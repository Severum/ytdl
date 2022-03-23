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
  background-color:#757575;
  margin: 0;
  padding: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #ffffff;
}
</style>
