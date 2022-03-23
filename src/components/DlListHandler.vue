<template>
  <div class="itemCardWrapper">
    <div class="itemCard" v-for="item in dlList" :key="item._id">
      <DlItemCard :item="item"/>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DlItemCard from './DlItemCard.vue';

export default defineComponent({
  name: 'dlListhandler',
  components: {
    DlItemCard,
  },
  computed: {
    dlList () {
      return this.$store.state.dlList
    }
  },
  created: function() {
    // this.$store.commit('addDlList', {
    //   _id: 0,
    //   name: "test1",
    //   downloadPath: "nop",
    //   url: "nop",
    //   thumbnail: "nop",
    //   percentage: 0,
    // })
    // this.$store.commit('addDlList', {
    //   _id: 2,
    //   name: "test2",
    //   downloadPath: "nop",
    //   url: "nop",
    //   thumbnail: "nop",
    //   percentage: 50,
    // })
    // this.$store.commit('addDlList', {
    //   _id: 3,
    //   name: "test3",
    //   downloadPath: "nop",
    //   url: "nop",
    //   thumbnail: "nop",
    //   percentage: 100,
    // })
    // this.$store.commit('addDlList', {
    //   _id: 4,
    //   name: "test4",
    //   downloadPath: "nop",
    //   url: "nop",
    //   thumbnail: "nop",
    //   percentage: 0,
    // })
    // this.$store.commit('addDlList', {
    //   _id: 5,
    //   name: "test5",
    //   downloadPath: "nop",
    //   url: "nop",
    //   thumbnail: "nop",
    //   percentage: 50,
    // })
    // this.$store.commit('addDlList', {
    //   _id: 6,
    //   name: "test6",
    //   downloadPath: "nop",
    //   url: "nop",
    //   thumbnail: "nop",
    //   percentage: 100,
    // })
  }
});
</script>

<style scoped lang="scss">
.itemCardWrapper {
  display: flex;
  flex-wrap: wrap;
}
.itemCard {
  margin-top: 1vh;
  margin-left: 1vw;
  width: 18vw;
  height: 20vh;
}
</style>
