import types from "../mutation-types";
import Vue from "vue";

function stringToObject(s) {
  try {
    return JSON.parse(s);
  } catch (e) {
    return null;
  }
}

function initialState() {
  const user = stringToObject(localStorage.getItem("user"));
  return {
    user: user,
    error: null
  };
}

const state = {
  item: initialState()
};

const getters = {
  isLoggedIn: state => {
    return state.item.user !== undefined && state.item.user !== null;
  },
  user(store) {
    return store.item.user;
  },
  userId(store) {
    if (store.item.user == null) {
      return 0;
    }
    return store.item.user.id;
  },
  enabledGa(store) {
    if (store.item.user == null) {
      return false;
    }
    return store.item.user.enabledGa;
  },
  cfgEnabledGa(store) {
    if (store.item.user == null) {
      return false;
    }
    return Vue.prototype.enabledGlobalGa(store.item.user.flagGa);
  },
  cfgForcedGa(store) {
    if (store.item.user == null) {
      return false;
    }
    return Vue.prototype.forceEnabledGlobalGa(store.item.user.flagGa);
  }
};

const mutations = {
  [types.RECEIVE_LOGIN_SUCCESS](state, { user }) {
    localStorage.setItem("user", JSON.stringify(user));
    state.item = {
      ...state.item,
      user: user,
      error: null
    };
  },
  [types.RECEIVE_LOGIN_FAILURE](state, { error }) {
    localStorage.removeItem("user");
    state.item = {
      ...state.item,
      user: null,
      error: error
    };
  },
  [types.RECEIVE_LOGOUT_SUCCESS](state) {
    state.item = {
      ...state.item,
      user: null,
      error: null
    };
  },
  [types.UI_WAITING_BEGIN](state, obj) {
    obj.$loading({
      lock: true,
      fullscreen: true,
      text: obj.$t("label.ui_waiting"),
      background: "rgba(0, 0, 0, 0.3)"
    });
  },
  [types.UI_WAITING_FINISH](state, obj) {
    obj.$loading().close();
  }
};

const actions = {
  Logout4SSO({ commit }) {
    return new Promise((resolve, reject) => {
      Vue.prototype
        .apiLogout()
        .then(() => {
          commit(types.RECEIVE_LOGOUT_SUCCESS);
          resolve();
        })
        .catch(err => {
          reject(err);
        });
    });
  },
  GetAndCheckToken({ commit }, { ssoFlag = false }) {
    return new Promise((resolve, reject) => {
      Vue.prototype
        .apiProfile(ssoFlag)
        .then(resp => {
          if (resp.result !== 0) {
            commit(types.RECEIVE_LOGOUT_SUCCESS);
          } else {
            commit(types.RECEIVE_LOGIN_SUCCESS, { user: resp.user });
          }
          resolve(resp.ssoToken);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
};

export default {
  state,
  mutations,
  getters,
  actions
};
