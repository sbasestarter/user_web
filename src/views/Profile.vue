<template>
  <div>
    <el-card class="box-card" style="height: 100%">
      <div slot="header">
        <span>{{ userNickName }}</span>
        <div class="profile-user-create-time">
          <span>{{ $t("label.create_at") }} {{ createAt }}</span>
        </div>
      </div>
      <div class="profile-user-source">
        <span
          >{{ $t("label.from_source") }} - {{ sourceVe }}:
          {{ sourceName }}</span
        >
      </div>
      <el-row>
        <el-col :xs="24" :sm="20" :md="12">
          <el-form label-width="auto" status-icon style="flex-grow: 1">
            <el-form-item :label="$t('label.nick_name')">
              <el-input v-model="userNickName"></el-input>
            </el-form-item>
            <el-form-item :label="$t('label.email_address')">
              <el-input v-model="userEmail"></el-input>
            </el-form-item>
            <el-form-item :label="$t('label.we_chat')">
              <el-input v-model="userWeChat"></el-input>
            </el-form-item>
          </el-form>
          <el-form>
            <el-form-item :inline="true">
              <el-button type="primary" @click="updateDetail">{{
                $t("label.submit")
              }}</el-button>
              <el-button @click="flushUI">{{ $t("label.reset") }}</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :xs="24" :sm="20" :md="12">
          <el-upload
            class="avatar-uploader"
            drag
            :show-file-list="false"
            action=""
            :http-request="customUpload"
            :before-upload="beforeAvatarUpload"
          >
            <div v-if="cover" class="profile-user-avatar">
              <el-image :src="cover" class="profile-avatar" alt="" />
              <a class="profile-user-remove-cover" @click.stop="cover = ''"></a>
            </div>
            <div v-else>
              <i class="el-icon-upload" />
              <div class="el-upload__text">
                {{ $t("label.upload_text1")
                }}<em>{{ $t("label.upload_text2") }}</em>
              </div>
            </div>
          </el-upload>
        </el-col>
      </el-row>
      <el-row> </el-row>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cover: "",
      userDetail: null,
      userNickName: "",
      userEmail: "",
      userWeChat: ""
    };
  },
  mounted() {
    this.flushUI();
  },
  computed: {
    createAt() {
      if (this.userDetail === null) {
        return "-";
      }
      return this.$moment(this.userDetail.createAt * 1000).format(
        "YYYY-MM-DD HH:mm:ss"
      );
    },
    sourceVe() {
      if (this.userDetail === null) {
        return "-";
      }
      return this.userDetail.user.userVe;
    },
    sourceName() {
      if (this.userDetail === null) {
        return "-";
      }
      return this.userDetail.user.userName;
    }
  },
  methods: {
    flushUI() {
      this.apiGetDetailInfo()
        .then(info => {
          this.userDetail = info;
          this.userNickName = this.userDetail.baseInfo.nickName;
          this.userEmail = this.userDetail.email;
          this.userWeChat = this.userDetail.wechat;
          this.cover = encodeURI(
            process.env.VUE_APP_IMAGE_DOWNLOAD_BASE_URL +
              "/" +
              this.userDetail.baseInfo.avatar
          );
        })
        .catch(err => {
          this.$message({
            message: err.toString(),
            type: "error"
          });
        });
    },
    updateDetail() {
      this.apiUpdateDetailInfoRequest({
        nickName: this.userNickName,
        email: this.userEmail,
        weChat: this.userWeChat
      })
        .then(() => {
          this.$message({
            message: this.$t("tips.operation_success"),
            type: "success"
          });
          this.flushUI();
        })
        .catch(err => {
          this.$message({
            message: err.toString(),
            type: "error"
          });
        });
    },
    beforeAvatarUpload(file) {
      const isValidType =
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/bmp" ||
        file.type === "image/gif" ||
        file.type === "image/webp";
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isValidType) {
        this.$message.error(this.$t("article_post.upload_picture_type_error"));
      }
      if (!isLt2M) {
        this.$message.error(this.$t("article_post.upload_picture_size_error"));
      }
      return isValidType && isLt2M;
    },
    customUpload(file) {
      const fReader = new FileReader();
      fReader.onload = e => {
        this.apiUploadImage(
          file.file.name,
          this.$arrayBufferToBytes(e.target.result)
        )
          .then(fileUrl => {
            this.apiUpdateDetailInfoRequest({ avatar: fileUrl })
              .then(() => {
                this.$message.success(this.$t("tips.label.operation_success"));
                this.cover = encodeURI(
                  process.env.VUE_APP_IMAGE_DOWNLOAD_BASE_URL + "/" + fileUrl
                );
              })
              .catch(err => {
                this.$message.error(
                  this.$t("tips.operation_failed") + ":" + JSON.stringify(err)
                );
              });
          })
          .catch(err => {
            this.$message.error(
              this.$t("tips.operation_failed") + ":" + JSON.stringify(err)
            );
          });
      };
      fReader.readAsArrayBuffer(file.file);
    }
  }
};
</script>

<style>
.profile-user-avatar {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.profile-user-remove-cover {
  padding-left: 10px;
}
</style>
