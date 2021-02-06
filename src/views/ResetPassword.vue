<template>
  <el-row type="flex" justify="center">
    <el-col :xs="24" :sm="20" :md="12" style="margin-top: 100px">
      <el-card>
        <div slot="header" style="text-align: left">
          <span>{{ $t("label.reset_password") }}</span>
        </div>
        <el-form
          :model="resetPasswordForm"
          status-icon
          :rules="rules"
          ref="resetPasswordForm"
          label-width="auto"
          class="resetPasswordForm"
        >
          <el-form-item :label="$t('label.user_name')" prop="userName">
            <el-input
              v-model="resetPasswordForm.userName"
              :placeholder="$t('hint.user_name')"
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('label.new_password')" prop="pass">
            <el-input
              type="password"
              v-model="resetPasswordForm.pass"
              :placeholder="$t('hint.password')"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item
            :label="$t('label.new_password_confirm')"
            prop="checkPass"
          >
            <el-input
              type="password"
              v-model="resetPasswordForm.checkPass"
              :placeholder="$t('hint.password_confirm')"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('label.verify_code')" prop="codeForVe">
            <el-col :xs="24" :sm="18">
              <el-input
                v-model="resetPasswordForm.codeForVe"
                :placeholder="$t('hint.verify_code')"
              ></el-input>
            </el-col>
            <el-col :xs="24" :sm="6">
              <el-button plain style="width: 100%" @click="sendVerifyCode()">{{
                $t("label.send_verify_code")
              }}</el-button>
            </el-col>
          </el-form-item>
          <el-form-item
            v-if="needVerifyCodeForGa"
            :label="$t('label.ga_verify_code')"
            prop="codeForGa"
          >
            <el-input
              v-model="resetPasswordForm.codeForGa"
              :placeholder="$t('hint.ga_verify_code')"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              @click="submitForm('resetPasswordForm')"
              >{{ $t("label.submit") }}</el-button
            >
            <el-button @click="resetForm('resetPasswordForm')">{{
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
        if (this.resetPasswordForm.checkPass !== "") {
          this.$refs.resetPasswordForm.validateField("checkPass");
        }
        callback();
      }
    };
    const validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error(this.$t("tips.pass_confirm_is_null")));
      } else if (value !== this.resetPasswordForm.pass) {
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
      needVerifyCodeForGa: false,
      resetPasswordForm: {
        userName: "",
        pass: "",
        checkPass: "",
        codeForVe: "",
        codeForGa: ""
      },
      rules: {
        userName: [{ validator: validateUsername, trigger: "blur" }],
        pass: [{ validator: validatePass, trigger: "blur" }],
        checkPass: [{ validator: validatePass2, trigger: "blur" }],
        codeForVe: [{ validator: validateVerifyCode, trigger: "blur" }],
        codeForGa: [{ validator: validateVerifyCodeForGa, trigger: "blur" }]
      }
    };
  },
  methods: {
    toLogin() {
      this.$router.push({ path: "/login", query: this.$route.query });
    },
    sendVerifyCode() {
      if (this.resetPasswordForm.userName === "") {
        this.$refs.resetPasswordForm.validateField("userName");
        this.$message({
          message: this.$i18n.t("tips.username_is_null"),
          type: "warning"
        });
        return;
      }
      this.apiSendVerifyCode(this.resetPasswordForm.userName)
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
          this.apiResetPassword(
            this.resetPasswordForm.userName,
            this.resetPasswordForm.pass,
            this.resetPasswordForm.codeForVe,
            this.resetPasswordForm.codeForGa
          )
            .then(resp => {
              if (resp.code === 0) {
                this.$message({
                  message: this.$t("tips.operation_success"),
                  type: "success"
                });
              } else if (resp.code === 2) {
                this.$message({
                  message: this.$t("tips.need_google_auth_verify"),
                  type: "warning"
                });
                this.needVerifyCodeForGa = true;
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
    },
    dialogOpen() {
      this.$nextTick(function() {
        this.$refs.ga.setFocus();
      });
    }
  }
};
</script>
