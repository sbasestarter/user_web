<template>
  <div>
    <div class="ga-row-space ga-qrcode-container">
      <div id="qrcode" ref="qrcode"></div>
    </div>
    <el-row class="ga-row-space">
      <span>{{ $t("label.google_auth_scan") }}</span>
    </el-row>
    <el-row class="ga-row-space">
      <el-input class="ga-qrcode" v-model="code" ref="input"></el-input>
    </el-row>
    <el-row class="ga-row-space">
      <el-button type="primary" @click="setupGoogleAuth()">{{
        $t("label.confirm")
      }}</el-button>
    </el-row>
    <el-row></el-row>
  </div>
</template>

<script>
import QRCode from "qrcodejs2";
export default {
  data() {
    return {
      privateKey: "",
      code: ""
    };
  },
  props: {
    oldGaToken: String
  },
  mounted() {
    this.generateQRCode();
  },
  methods: {
    updateQRKey(key) {
      this.privateKey = key;
      this.generateQRCode();
    },
    setFocus() {
      this.$refs.input.focus();
    },
    generateQRCode() {
      document.getElementById("qrcode").innerHTML = "";
      new QRCode("qrcode", {
        width: 150,
        height: 150,
        text: this.privateKey
      });
    },
    setupGoogleAuth() {
      if (this.code === "") {
        this.$message({
          message: this.$t("tips.verify_code_input"),
          type: "error"
        });
      }
      this.apiGoogleAuthSet(this.code, this.oldGaToken)
        .then(() => {
          this.$emit("googleAuthSetupSuccess");
        })
        .catch(err => {
          this.$message({
            message: err.toString(),
            type: "error"
          });
        });
    }
  }
};
</script>
<style>
.ga-qrcode-container {
  display: flex;
  align-items: center;
  justify-content: center;
}
.ga-row-space {
  margin-bottom: 10px;
}
.ga-qrcode .el-input__inner {
  width: 50%;
  text-align: center;
}
</style>
