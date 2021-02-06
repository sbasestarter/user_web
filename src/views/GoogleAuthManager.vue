<template>
  <div>
    <el-dialog
      :title="$t('hint.set_google_auth')"
      :visible.sync="setupDialogVisible"
      width="50%"
      :close-on-click-modal="true"
      :close-on-press-escape="true"
      :show-close="true"
      :before-close="handleClose"
      @open="setupDialogOpen"
    >
      <GoogleAuthSetup
        ref="gaSetup"
        :oldGaToken="oldGaToken"
        @googleAuthSetupSuccess="gaSetupSuccess"
      />
    </el-dialog>
    <el-button
      v-if="!$store.getters.enabledGa"
      type="primary"
      @click="setupGoogleAuth()"
      >{{ $t("label.google_auth_set") }}</el-button
    >
    <div v-else>
      <el-form style="padding: 100px">
        <el-form-item>
          <el-button type="primary" @click="resetGoogleAuth()">{{
            $t("label.google_auth_reset")
          }}</el-button>
          <el-button
            v-if="!$store.getters.cfgForcedGa"
            type="primary"
            @click="cleanupGoogleAuth()"
            >{{ $t("label.google_auth_clean") }}</el-button
          >
        </el-form-item>
        <el-form-item> </el-form-item>
        <el-form-item>
          <el-input
            v-model="googleCode"
            clearable
            :placeholder="$t('label.google_auth')"
          ></el-input>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import GoogleAuthSetup from "../components/GoogleAuthSetup";
import store from "../store";
export default {
  data() {
    return {
      setupDialogVisible: false,
      googleAuthKey: "",
      googleCode: "",
      oldGaToken: ""
    };
  },
  components: {
    GoogleAuthSetup
  },
  methods: {
    handleClose(done) {
      done();
    },
    setupDialogOpen() {
      this.$nextTick(function() {
        this.$refs.gaSetup.updateQRKey(this.googleAuthKey);
        this.$refs.gaSetup.setFocus();
      });
    },
    gaSetup() {
      this.apiGoogleAuthGetSetupInfo()
        .then(key => {
          this.googleAuthKey = key;
          this.setupDialogVisible = true;
        })
        .catch(err => {
          this.$message({
            message: err.toString(),
            type: "error"
          });
        });
    },
    setupGoogleAuth() {
      this.oldGaToken = "";
      this.gaSetup();
    },
    resetGoogleAuth() {
      if (this.googleCode === "") {
        this.$message({
          message: this.$t("label.google_auth_input"),
          type: "error"
        });
        return;
      }
      this.apiGoogleAuthVerify(this.googleCode)
        .then(token => {
          this.oldGaToken = token;
          this.gaSetup();
        })
        .catch(err => {
          this.$message({
            message: err.toString(),
            type: "error"
          });
        });
    },
    cleanupGoogleAuth() {
      if (this.googleCode === "") {
        this.$message({
          message: this.$t("label.google_auth_input"),
          type: "error"
        });
        return;
      }
      // eslint-disable-next-line no-unused-vars
      this.apiGoogleAuthVerify(this.googleCode)
        .then(token => {
          this.apiGoogleAuthSet("", token)
            .then(() => {
              this.$message({
                message: this.$t("tips.google_auth_clean_success"),
                type: "success"
              });
              store.dispatch("GetAndCheckToken", { ssoFlag: false });
            })
            .catch(err => {
              this.$message({
                message: err.toString(),
                type: "error"
              });
            });
        })
        .catch(err => {
          this.$message({
            message: err.toString(),
            type: "error"
          });
        });
    },
    gaSetupSuccess() {
      this.$message({
        message: this.$t("tips.google_auth_set_success"),
        type: "success"
      });
      this.setupDialogVisible = false;
      store.dispatch("GetAndCheckToken", { ssoFlag: false });
    }
  }
};
</script>
