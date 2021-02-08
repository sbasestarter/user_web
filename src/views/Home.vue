<template>
  <div class="home home-layout">
    <el-menu
      :default-active="activeMenuItemIndex()"
      class="el-menu-vertical-demo"
      @select="handleSelect"
      :collapse="isCollapse"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
      style="text-align: left"
    >
      <el-menu-item index="collapse">
        <i v-if="isCollapse" class="el-icon-arrow-left"></i>
        <i v-else class="el-icon-arrow-right"></i>
        <span slot="title">{{ $t("label.hide") }}</span>
      </el-menu-item>
      <el-menu-item index="profile">
        <i class="el-icon-user-solid"></i>
        <span slot="title">{{ $t("label.profile") }}</span>
      </el-menu-item>
      <el-menu-item index="change_password">
        <i class="el-icon-key"></i>
        <span slot="title">{{ $t("label.change_password") }}</span>
      </el-menu-item>
      <el-menu-item index="google_auth_manager">
        <i class="el-icon-mobile"></i>
        <span slot="title">{{ $t("label.google_auth") }}</span>
      </el-menu-item>
      <el-menu-item index="um">
        <i class="el-icon-s-grid"></i>
        <span slot="title">{{ $t("label.user_manager") }}</span>
      </el-menu-item>
    </el-menu>
    <router-view style="flex-grow: 1" />
  </div>
</template>

<script>
export default {
  name: "Home",
  data() {
    return {
      isCollapse: false
    };
  },
  methods: {
    activeMenuItemIndex() {
      return this.$route.path.substr(1);
    },
    handleSelect(key) {
      if (key === "collapse") {
        this.isCollapse = !this.isCollapse;
        return;
      }
      if (key === this.activeMenuItemIndex()) {
        return;
      }
      if (key === "profile") {
        this.$router.push({ path: "/profile" });
        return;
      }
      if (key === "change_password") {
        this.$router.push({ path: "/change_password" });
        return;
      }
      if (key === "google_auth_manager") {
        this.$router.push({ path: "/google_auth_manager" });
        return;
      }

      if (key === "um") {
        this.$router.push({ path: "/um" });
        return;
      }
      console.log(key);
    }
  }
};
</script>

<style>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}
.home-layout {
  display: flex;
}
.profile-user-create-time {
  float: right;
  padding: 3px 0;
  font-size: xx-small;
  margin-top: 10px;
}
.profile-user-source {
  text-align: left;
  padding: 10px 10px 10px 10px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.profile-avatar {
  padding: 10px;
  max-height: 200px;
}
</style>
