import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./plugins/element.js";
import i18n from "./tools/i18n";
import apis from "./apis/api";

Vue.config.productionTip = false;

Vue.use(apis);

router.beforeEach((to, from, next) => {
  store.dispatch("GetAndCheckToken", { });
  if (to.path === "/sso") {
    next();
    // eslint-disable-next-line no-prototype-builtins
    if (to.query.hasOwnProperty("url")) {
      // eslint-disable-next-line no-prototype-builtins
      if (to.query.hasOwnProperty("logout")) {
        store
            .dispatch("Logout4SSO")
            .then(() => {
              window.location.replace(
                  Vue.prototype.updateQueryStringParameter(
                      to.query["url"],
                      "logout_result",
                      "0"
                  )
              );
            })
            .catch(() => {
              window.location.replace(
                  Vue.prototype.updateQueryStringParameter(
                      to.query["url"],
                      "logout_result",
                      "-1"
                  )
              );
            });
      } else {
        store
            .dispatch("GetAndCheckToken", { ssoJumpUrl: to.query["url"] })
            .then(ssoToken => {
              if (ssoToken !== "") {
                window.location.replace(
                    Vue.prototype.updateQueryStringParameter(
                        to.query["url"],
                        "sso_token",
                        ssoToken
                    )
                );
              } else {
                next("/login?sso=" + to.query["url"]);
              }
            })
            .catch(err => {
              window.location.replace(
                  Vue.prototype.updateQueryStringParameter(
                      to.query["url"],
                      "token_err",
                      err
                  )
              );
            });
      }
    }
    return;
  }

  if (to.matched.some(record => record.meta.requireAuth)) {
    if (store.getters.isLoggedIn) {
      next();
      return;
    }
    next("/login?to=" + to.fullPath);
  } else {
    next();
  }
});

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount("#app");
