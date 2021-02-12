<template>
  <div>
    <div class="table-content">
      <el-table :data="itemList" stripe style="width: 100%;">
        <el-table-column prop="info.id" :label="$t('label.id')"></el-table-column>
        <el-table-column :label="$t('label.user_name_type')">
          <template slot-scope="scope">
            <p>{{ userNameTypeText(scope.row.user.userVe) }}</p>
          </template>
        </el-table-column>
        <el-table-column prop="user.userName" :label="$t('label.user_name')"></el-table-column>
        <el-table-column prop="lastLoginAt" :label="$t('label.last_login_at')"></el-table-column>
        <el-table-column prop="createAt" :label="$t('label.create_at')"></el-table-column>
        <el-table-column :label="$t('label.admin_flag')">
          <template slot-scope="scope">
            <p>{{ privilegesText(scope.row.privileges) }}</p>
          </template>
        </el-table-column>
        <el-table-column :label="$t('label.privilege_change')" min-width="130px">
          <template slot-scope="scope">
            <el-dropdown split-button type="primary" @command="handlePrivilegesCommand">
              {{ $t("label.change") }}
              <el-dropdown-menu slot="dropdown" trigger="click">
                <el-dropdown-item v-if="scope.row.privileges === 0" :command="{ 'id': scope.row.info.id, 'privileges': 0}">
                  {{ $t("label.set_to_admin") }}
                </el-dropdown-item>
                <el-dropdown-item v-if="scope.row.privileges === 1" :command="{ 'id': scope.row.info.id, 'privileges': 0}">
                  {{ $t("label.unset_to_admin") }}
                </el-dropdown-item>
                <el-dropdown-item :command="{ 'id': scope.row.info.id, 'privileges': -1}">
                  {{ $t("label.delete_user") }}
                </el-dropdown-item>
                <el-dropdown-item :command="{ 'id': scope.row.info.id, 'privileges': -2}">
                  {{ $t("label.reset_password") }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
        <el-table-column prop="privileges" :label="$t('label.privileges')"></el-table-column>
      </el-table>
      <div class="block">
        <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="currentPage"
                :page-sizes="[1, 2, 3, 10, 20, 30, 40]"
                :page-size="10"
                layout="total, sizes, prev, pager, next, jumper"
                :total="count"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
  import {
    UserNameType,
  } from "../../proto/user/user_grpc_web_pb"

  export default {
    data() {
      return {
        count: 0,
        itemList: [],
        currentPage: 1,
        pageSize: 10
      };
    },
    mounted() {
      this.handleSizeChange(0)
    },
    methods: {
      fetchUsers: function(offset, pageSize) {
        this.apiGetUserList(offset, pageSize).then(resp => {
          this.count = resp.cnt;
          this.itemList = [];
          for (let i = 0; i < resp.users.length; i++) {
            this.itemList.push(resp.users[i].toObject())
          }
        }).catch(err => {
          this.$message({
            message: err.toString(),
            type: "error"
          });
        })
      },
      handleSizeChange: function(pageSize) {
        this.pageSize = pageSize;
        this.handleCurrentChange(this.currentPage);
      },
      handleCurrentChange: function(currentPage) {
        this.currentPage = currentPage;
        this.currentChangePage( (currentPage-1) * this.pageSize);
      },
      currentChangePage(currentPage) {
        this.fetchUsers(currentPage, this.pageSize)
      },
      flushCurrentPage() {
        this.currentChangePage(this.currentPage)
      },
      privilegesText: function(privileges) {
        if (privileges === 0) {
          return this.$t('label.no')
        }
        return this.$t('label.yes')
      },
      userNameTypeText: function (userNameType) {
        return userNameType;
      },
      handlePrivilegesCommand: function (data) {
        if (data.privileges === -1) {
          this.apiDeleteUser(data.id).then(()=>{
            this.$message({
              message: this.$i18n.t("tips.delete_user_success"),
              type: "success"
            });
            this.flushCurrentPage()
          }).catch(err => {
            this.$message({
              message: err.toString(),
              type: "error"
            });
          })
        } else if (data.privileges === -2) {
          this.$prompt(
                  '请输入新密码：',
                  '提示',
                  {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消'
                  }
          ).then(({value}) => {
            this.$confirm(
                    '新密码为：' + value,
                    '提示',
                    {
                      confirmButtonText: '确定',
                      cancelButtonText: '取消'
                    }
            ).then(({}) => {
              this.apiResetUserPassword(data.id, value).then(()=>{
                this.$message({
                  message: this.$i18n.t("tips.reset_password_success"),
                  type: "success"
                });
              }).catch(err=>{
                this.$message({
                  message: err.toString(),
                  type: "error"
                });
              })
            });
          });
        } else if (data.privileges === 0) {
          this.apiSwitchUserAdminPrivileges(data.id).then(()=>{
            this.$message({
              message: this.$i18n.t("tips.operation_success"),
              type: "success"
            });
            this.flushCurrentPage()
          }).catch(err => {
            this.$message({
              message: err.toString(),
              type: "error"
            });
          })
        }
      },
    }
  };
</script>
