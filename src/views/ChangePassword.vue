<template>
  <div>
    <el-card class="box-card" style="height: 100%">
      <el-row>
        <el-col :xs="24" :sm="24" :md="24">
          <el-form
            :model="Form"
            label-width="auto"
            status-icon
            :rules="rules"
            ref="Form"
            style="flex-grow: 1"
          >
            <el-form-item :label="$t('label.password')" prop="password">
              <el-input type="password" v-model="Form.password"></el-input>
            </el-form-item>
            <el-form-item :label="$t('label.new_password')" prop="newPassword">
              <el-input type="password" v-model="Form.newPassword"></el-input>
            </el-form-item>
            <el-form-item
              :label="$t('label.new_password_confirm')"
              prop="newPasswordAgain"
            >
              <el-input
                type="password"
                v-model="Form.newPasswordAgain"
              ></el-input>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-row>
        <el-form>
          <el-form-item>
            <el-button type="primary" @click="changePassword('Form')">{{
              $t("label.change_password")
            }}</el-button>
          </el-form-item>
        </el-form>
      </el-row>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    const validatePassword = (rule, value, callback) => {
      if (value === "") {
        callback(new Error(this.$t("tips.pass_is_null")));
      } else {
        callback();
      }
    };
    const validateNewPassword = (rule, value, callback) => {
      if (value === "") {
        callback(new Error(this.$t("tips.pass_is_null")));
      } else {
        if (this.Form.newPasswordAgain !== "") {
          this.$refs.Form.validateField("newPasswordAgain");
        }
        callback();
      }
    };
    const validateNewPasswordAgain = (rule, value, callback) => {
      if (value === "") {
        callback(new Error(this.$t("tips.pass_confirm_is_null")));
      } else if (value !== this.Form.newPassword) {
        callback(new Error(this.$t("tips.pass_incorrect")));
      } else {
        callback();
      }
    };
    return {
      Form: {
        password: "",
        newPassword: "",
        newPasswordAgain: ""
      },
      rules: {
        password: [{ validator: validatePassword, trigger: "blur" }],
        newPassword: [{ validator: validateNewPassword, trigger: "blur" }],
        newPasswordAgain: [
          { validator: validateNewPasswordAgain, trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    changePassword(formName) {
      this.$refs[formName].validate(valid => {
        console.log("xxx");
        if (!valid) {
          return;
        }
        this.apiChangePassword(this.Form.password, this.Form.newPassword)
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
      });
    }
  }
};
</script>
