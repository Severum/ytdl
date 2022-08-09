import { createStore } from "vuex";

export default createStore({
  state: {
    dlList: new Array()
  },
  mutations: {
    addDlList (state, item) {
      state.dlList.push(item);
    },
    removeDlList (state, item) {
      const index = state.dlList.indexOf(item, 0);
      if (index > -1) {
         state.dlList.splice(index, 1);
      }
    }
  },
  actions: {
  },
  modules: {
  }
})
