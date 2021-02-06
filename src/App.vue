<template>
  <div>
    <el-menu
            :router="true"
            mode="horizontal"
            background-color="#545c64"
            text-color="#fff"
            active-text-color="#ffd04b"
    >
      <el-menu-item v-if="!isSSOPage()" index="/">{{
        $t("label.home")
        }}</el-menu-item>
      <el-submenu v-if="!isSSOPage()" index="/login">
        <template slot="title">{{ $t("label.account_manager") }}</template>
        <el-menu-item
                index="/register"
                @click="handleSubmenuSelection($event)"
        >{{ $t("label.register") }}</el-menu-item
        >
        <el-menu-item index="/login" @click="handleSubmenuSelection($event)">{{
          $t("label.login")
          }}</el-menu-item>
        <el-menu-item
                index="/reset_password"
                @click="handleSubmenuSelection($event)"
        >
          {{ $t("label.reset_password") }}</el-menu-item
        >
      </el-submenu>
      <el-menu-item @click="langSwitch()"
      >{{ $t("label.lang") }} [{{ $t("lang") }}]</el-menu-item
      >
      <el-menu-item v-if="!isSSOPage()" index="/about?h=hoho&hoho=haha">{{
        $t("label.about")
        }}</el-menu-item>
      <el-menu-item v-if="isSSOPage()" @click="returnLastPage">{{
        $t("label.return")
        }}</el-menu-item>
    </el-menu>
    <div id="app">
      <el-container>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </div>
  </div>
</template>

<script>
  export default {
    methods: {
      langSwitch() {
        if (this.$i18n.locale === "zh_CN") {
          this.$i18n.locale = "en_US";
        } else {
          this.$i18n.locale = "zh_CN";
        }
      },
      handleSubmenuSelection(menu_item) {
        if (
                menu_item.$parent &&
                menu_item.$parent.$options.name === "ElSubmenu"
        ) {
          menu_item.$parent.handleMouseleave();
        }
      },
      isSSOPage() {
        if (this.$route.path === "/sso") {
          return true;
        }
        return this.$route.query["sso"] !== undefined;
      },
      returnLastPage() {
        const sso = this.$route.query.sso || "";
        if (sso !== "") {
          window.location.replace(sso);
        }
      }
    }
  };
</script>

<style>
  #app {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }
  #nav a {
    font-weight: bold;
    color: #2c3e50;
  }

  #nav a.router-link-exact-active {
    color: #42b983;
  }
</style>
