<template>
  <el-row type="flex" justify="center">
    <el-dialog
      :title="$t('hint.set_google_auth')"
      :visible.sync="setupDialogVisible"
      width="50%"
      :close-on-click-modal="!forceGoogleAuth"
      :close-on-press-escape="!forceGoogleAuth"
      :show-close="!forceGoogleAuth"
      :before-close="handleClose"
      @open="setupDialogOpen"
    >
      <GoogleAuthSetup ref="gaSetup" @googleAuthSetupSuccess="loginSuccess" />
    </el-dialog>

    <el-col :xs="24" :sm="20" :md="12" style="margin-top: 100px">
      <el-card v-if="!$store.getters.isLoggedIn">
        <div slot="header" style="text-align: left">
          <span>{{ $t("label.login") }}</span>
        </div>
        <el-form
          :model="loginForm"
          status-icon
          :rules="rules"
          ref="loginForm"
          label-width="auto"
          class="loginForm"
        >
          <el-form-item :label="$t('label.user_name')" prop="userName">
            <el-input
              v-model="loginForm.userName"
              :placeholder="$t('hint.user_name')"
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('label.password')" prop="pass">
            <el-input
              type="password"
              v-model="loginForm.pass"
              :placeholder="$t('hint.password')"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item
            v-if="needVerifyCodeForVe"
            :label="$t('label.verify_code')"
            prop="codeForVe"
          >
            <el-input
              v-model="loginForm.codeForVe"
              :placeholder="$t('hint.verify_code')"
            ></el-input>
          </el-form-item>
          <el-form-item
            v-if="needVerifyCodeForGa"
            :label="$t('label.ga_verify_code')"
            prop="codeForGa"
          >
            <el-input
              v-model="loginForm.codeForGa"
              :placeholder="$t('hint.ga_verify_code')"
            ></el-input>
          </el-form-item>
          <el-form-item :inline="true">
            <el-button type="primary" @click="submitForm('loginForm')">{{
              $t("label.login")
            }}</el-button>
            {{ $t("label.no_account") }}
            <el-link type="primary" @click="toRegister()">{{
              $t("label.register")
            }}</el-link>
            <el-link
              style="float: right"
              type="primary"
              @click="toResetPassword()"
            >
              {{ $t("label.reset_password") }}</el-link
            >
          </el-form-item>
        </el-form>
      </el-card>
      <el-form v-else>
        <el-form-item>
          <el-alert :title="$store.getters.user.nickName" type="success">
            <el-button type="primary" @click="logout()">{{$t("label.logout")}}</el-button>
          </el-alert>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<script>
import GoogleAuthSetup from "../components/GoogleAuthSetup";
import types from "../store/mutation-types";
import store from "../store";
export default {
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t("tips.username_is_null")));
      }
      callback();
    };
    const validatePass = (rule, value, callback) => {
      if (value === "") {
        return callback(new Error(this.$t("tips.pass_is_null")));
      }
      callback();
    };
    const validateVerifyCode = (rule, value, callback) => {
      if (!this.needVerifyCodeForVe) {
        return callback();
      }
      if (value === "") {
        return callback(new Error(this.$t("tips.verify_code_is_null")));
      }
      callback();
    };
    const validateVerifyCodeForGa = (rule, value, callback) => {
      if (!this.needVerifyCodeForGa) {
        return callback();
      }
      if (value === "") {
        return callback(new Error(this.$t("tips.ga_verify_code_is_null")));
      }
      callback();
    };
    return {
      setupDialogVisible: false,
      forceGoogleAuth: true,
      needVerifyCodeForVe: false,
      needVerifyCodeForGa: false,
      loginForm: {
        userName: "",
        pass: "",
        codeForVe: "",
        codeForGa: ""
      },
      rules: {
        userName: [{ validator: validateUsername, trigger: "blur" }],
        pass: [{ validator: validatePass, trigger: "blur" }],
        codeForVe: [{ validator: validateVerifyCode, trigger: "blur" }],
        codeForGa: [{ validator: validateVerifyCodeForGa, trigger: "blur" }]
      },
      googleAuthKey: "",
      user: null,
      ssoToken: null
    };
  },
  components: {
    GoogleAuthSetup
  },
  methods: {
    toRegister() {
      this.$router.push({ path: "/register", query: this.$route.query });
    },
    toResetPassword() {
      this.$router.push({ path: "/reset_password", query: this.$route.query });
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        let ssoFlag = false;
        const sso = this.$route.query.sso || "";
        if (sso !== "") {
          ssoFlag = true;
        }
        if (valid) {
          this.apiLogin(
            this.loginForm.userName,
            this.loginForm.pass,
            ssoFlag,
            this.loginForm.codeForVe,
            this.loginForm.codeForGa
          )
            .then(resp => {
              this.user = resp.user;
              this.ssoToken = resp.ssoToken;
              if (resp.code === 0) {
                this.loginSuccess();
              } else if (resp.code === 1) {
                this.$message({
                  message: "登录成功,但是需要设置Google二次验证",
                  type: "success"
                });
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
              } else if (resp.code === 2) {
                this.$message({
                  message: "本次登录需要谷歌验证码",
                  type: "warning"
                });
                this.needVerifyCodeForGa = true;
              } else if (resp.code === 3) {
                this.$message({
                  message: "本次登录需要设备验证码",
                  type: "warning"
                });
                this.needVerifyCodeForVe = true;
              }
            })
            .catch(err => {
              this.$message({
                message: err.toString(),
                type: "error"
              });
            });
        } else {
          this.$message({
            message: "校验数据错误，请检查",
            type: "error"
          });
        }
      });
    },
    handleClose(done) {
      done();
    },
    setupDialogOpen() {
      this.$nextTick(function() {
        this.$refs.gaSetup.updateQRKey(this.googleAuthKey);
        this.$refs.gaSetup.setFocus();
      });
    },
    loginSuccess() {
      this.$store.commit(types.RECEIVE_LOGIN_SUCCESS, { user: this.user });
      this.$message({
        message: "登录成功",
        type: "success"
      });
      const sso = this.$route.query.sso || "";
      if (sso !== "") {
        window.location.replace(
          this.updateQueryStringParameter(sso, "sso_token", this.ssoToken)
        );
      } else {
        const to = this.$route.query.to || "";
        if (to !== "") {
          delete this.$route.query.to;
          this.$router.push({ path: to, query: this.$route.query });
        } else {
          this.$router.push({
            path: "/"
          });
        }
      }
    },
    logout() {
      store.dispatch("Logout4SSO")
    }
  }
};
</script>
