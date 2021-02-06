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
      <GoogleAuth ref="gaSetup" @googleAuthSetupSuccess="registerSuccess" />
    </el-dialog>
    <el-col :xs="24" :sm="20" :md="12" style="margin-top: 100px">
      <el-card>
        <div slot="header" style="text-align: left">
          <span>{{ $t("label.register") }}</span>
        </div>
        <el-form
          :model="registerForm"
          status-icon
          :rules="rules"
          ref="registerForm"
          label-width="auto"
          class="registerForm"
        >
          <el-form-item :label="$t('label.user_name')" prop="userName">
            <el-input
              v-model="registerForm.userName"
              :placeholder="$t('hint.user_name')"
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('label.password')" prop="pass">
            <el-input
              type="password"
              v-model="registerForm.pass"
              :placeholder="$t('hint.password')"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('label.password_confirm')" prop="checkPass">
            <el-input
              type="password"
              v-model="registerForm.checkPass"
              :placeholder="$t('hint.password_confirm')"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('label.verify_code')" prop="verifyCode">
            <el-col :xs="24" :sm="18">
              <el-input
                v-model="registerForm.verifyCode"
                :placeholder="$t('hint.verify_code')"
              ></el-input>
            </el-col>
            <el-col :xs="24" :sm="6">
              <el-button plain style="width: 100%" @click="sendVerifyCode()">{{
                $t("label.send_verify_code")
              }}</el-button>
            </el-col>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm('registerForm')">{{
              $t("label.submit")
            }}</el-button>
            <el-button @click="resetForm('registerForm')">{{
              $t("label.reset")
            }}</el-button>
            {{ $t("label.has_account") }}
            <el-link type="primary" @click="toLogin()">{{
              $t("label.login")
            }}</el-link>
          </el-form-item>
        </el-form>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
import GoogleAuth from "../components/GoogleAuthSetup";
import types from "../store/mutation-types";
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
        callback(new Error(this.$t("tips.pass_is_null")));
      } else {
        if (this.registerForm.checkPass !== "") {
          this.$refs.registerForm.validateField("checkPass");
        }
        callback();
      }
    };
    const validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error(this.$t("tips.pass_confirm_is_null")));
      } else if (value !== this.registerForm.pass) {
        callback(new Error(this.$t("tips.pass_incorrect")));
      } else {
        callback();
      }
    };
    const validateVerifyCode = (rule, value, callback) => {
      if (value === "") {
        callback(new Error(this.$t("tips.verify_code_is_null")));
      } else {
        callback();
      }
    };
    return {
      setupDialogVisible: false,
      forceGoogleAuth: true,
      registerForm: {
        userName: "",
        pass: "",
        checkPass: "",
        verifyCode: ""
      },
      rules: {
        userName: [{ validator: validateUsername, trigger: "blur" }],
        pass: [{ validator: validatePass, trigger: "blur" }],
        checkPass: [{ validator: validatePass2, trigger: "blur" }],
        verifyCode: [{ validator: validateVerifyCode, trigger: "blur" }]
      },
      googleAuthKey: "",
      user: null,
      ssoToken: null
    };
  },
  components: {
    GoogleAuth
  },
  methods: {
    toLogin() {
      this.$router.push({ path: "/login", query: this.$route.query });
    },
    sendVerifyCode() {
      if (this.registerForm.userName === "") {
        this.$refs.registerForm.validateField("userName");
        this.$message({
          message: this.$i18n.t("tips.username_is_null"),
          type: "warning"
        });
        return;
      }
      this.apiSendVerifyCode(this.registerForm.userName)
        .then(() => {
          this.$message({
            message: this.$t("tips.operation_success"),
            type: "success"
          });
        })
        .catch(err => {
          this.$message({
            message: err.toString(),
            type: "error"
          });
        });
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          let ssoFlag = false;
          const sso = this.$route.query.sso || "";
          if (sso !== "") {
            ssoFlag = true;
          }
          this.apiRegister(
            this.registerForm.userName,
            this.registerForm.pass,
            this.registerForm.verifyCode,
            ssoFlag
          )
            .then(resp => {
              if (resp.code === 0) {
                this.user = resp.user;
                this.ssoToken = resp.ssoToken;
                this.registerSuccess();
              } else if (resp.code === 1) {
                this.$message({
                  message: this.$t("tips.need_google_auth_set"),
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
              }
            })
            .catch(err => {
              this.$message({
                message: err.toString(),
                type: "error"
              });
            });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    handleClose(done) {
      done();
      this.registerSuccess();
    },
    setupDialogOpen() {
      this.$nextTick(function() {
        this.$refs.gaSetup.updateQRKey(this.googleAuthKey);
        this.$refs.gaSetup.setFocus();
      });
    },
    registerSuccess() {
      this.$store.commit(types.RECEIVE_LOGIN_SUCCESS, { user: this.user });
      this.$message({
        message: this.$t("tips.register_success"),
        type: "success"
      });
      this.$router.push({
        path: "/"
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
    }
  }
};
</script>
