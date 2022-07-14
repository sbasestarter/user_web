import {
  GoogleAuthGlobalFlag,
  UserId,
  VerificationEquipment,
  TriggerAuthRequest,
  TriggerAuthPurpose,
  UserStatus,
  RegisterRequest,
  GoogleAuthGetSetupInfoRequest,
  LoginRequest,
  LogoutRequest,
  ProfileRequest,
  GoogleAuthVerifyRequest,
  GoogleAuthSetRequest,
  ResetPasswordRequest,
  GetDetailInfoRequest,
  UpdateDetailInfoRequest,
  GetCsrfTokenRequest,
  ChangePasswordRequest,
  GetUserListRequest,
  ManagerUserRequest,
  ManagerUserType,
  ManagerUserResetPasswordRequest
} from "../../proto/user/user_pb";

import { UserServiceClient } from "../../proto/user/user_grpc_web_pb";

import {
  UpdateFileRequest,
} from "../../proto/file/file_pb";

import { FileServiceClient } from "../../proto/file/file_grpc_web_pb"

import moment from "moment";

export default {
  install(Vue) {
    Vue.prototype.$moment = moment;

    Vue.prototype.$arrayBufferToBytes = function(ab) {
      const buf = Buffer.alloc(ab.byteLength);
      const view = new Uint8Array(ab);
      for (let i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
      }
      return buf;
    };

    Vue.prototype.enabledGlobalGa = function(flag) {
      return (
        flag === GoogleAuthGlobalFlag.GOOGLE_AUTH_GLOBAL_FLAG_ENABLED ||
        flag === GoogleAuthGlobalFlag.GOOGLE_AUTH_GLOBAL_FLAG_ENABLED_FORCE
      );
    };

    Vue.prototype.forceEnabledGlobalGa = function(flag) {
      return flag === GoogleAuthGlobalFlag.GOOGLE_AUTH_GLOBAL_FLAG_ENABLED_FORCE;
    };

    Vue.prototype.fileClient = new FileServiceClient(
      process.env.VUE_APP_BASE_UPLOAD_URL,
      null,
      {
        withCredentials: true
      }
    );

    Vue.prototype.__checkFileStatus = function(err, resp, reject) {
      if (err != null) {
        reject(new Error(JSON.stringify(err)));
        return false;
      }

      return true;
    };

    Vue.prototype.apiUploadImage = function(fileName, fileContent) {
      return new Promise((resolve, reject) => {
        try {
          const req = new UpdateFileRequest();
          req.setContent(fileContent);
          Vue.prototype.fileClient.updateFile(req, {}, (err, resp) => {
            if (!Vue.prototype.__checkFileStatus(err, resp, reject)) {
              return;
            }

            resolve(resp.getFileUrl());
          });
        } catch (err) {
          reject(err);
        }
      });
    };

    Vue.prototype.client = new UserServiceClient(
      process.env.VUE_APP_BASE_URL,
      null,
      {
        withCredentials: true
      }
    );

    Vue.prototype.__checkGRPCResp = function(err, resp, reject) {
      if (err != null) {
        reject(new Error(JSON.stringify(err)));
        return false;
      }

      if (resp.getStatus().getStatus() !== UserStatus.USER_STATUS_SUCCESS) {
        reject(new Error(resp.getStatus().getMsg()));
        return false;
      }

      return true;
    };

    Vue.prototype.__checkUserGRPCResultForProfile = function(
      err,
      resp,
      reject
    ) {
      if (err != null) {
        reject(new Error(JSON.stringify(err)));
        return -1;
      }

      if (resp.getStatus().getStatus() !== UserStatus.USER_STATUS_SUCCESS) {
        return 1;
      }

      return 0;
    };

    Vue.prototype.__processGrpcWithGoogleAuthFlagResp = function(
      err,
      resp,
      resolve,
      reject
    ) {
      if (err != null) {
        reject(new Error(JSON.stringify(err)));
        return false;
      }

      if (resp.getStatus().getStatus() === UserStatus.USER_STATUS_SUCCESS) {
        resolve({
          code: 0,
          user: resp.getInfo().toObject(),
          ssoToken: resp.getSsoToken()
        });
        return true;
      }

      if (resp.getStatus().getStatus() === UserStatus.USER_STATUS_NEED_2FA_SETUP) {
        resolve({
          code: 1,
          user: resp.getInfo().toObject(),
          ssoToken: resp.getSsoToken()
        });
        return false;
      }

      if (resp.getStatus().getStatus() === UserStatus.USER_STATUS_NEED_2FA_AUTH) {
        resolve({ code: 2, user: null });
        return false;
      }

      if (resp.getStatus().getStatus() === UserStatus.USER_STATUS_NEED_VE_AUTH) {
        resolve({ code: 3, user: null });
        return false;
      }

      reject(new Error(resp.getStatus().getMsg()));

      return false
    };

    Vue.prototype.apiSendVerifyCode = function(username) {
      return new Promise((resolve, reject) => {
        try {
          const userId = new UserId();
          userId.setUserName(username);
          userId.setUserVe(VerificationEquipment.VERIFICATION_EQUIPMENT_UNSPECIFIED.toString());

          const req = new TriggerAuthRequest();
          req.setUser(userId);
          req.setPurpose(TriggerAuthPurpose.TRIGGER_AUTH_PURPOSE_REGISTER);

          Vue.prototype.client.triggerAuth(req, {}, (err, resp) => {
            if (!Vue.prototype.__checkGRPCResp(err, resp, reject)) {
              return;
            }
            resolve();
          });
        } catch (err) {
          reject(err);
        }
      });
    };

    Vue.prototype.apiRegister = function(
      username,
      password,
      verifyCode,
      ssoJumpURL
    ) {
      return new Promise((resolve, reject) => {
        try {
          const userId = new UserId();
          userId.setUserName(username);
          userId.setUserVe(VerificationEquipment.VERIFICATION_EQUIPMENT_UNSPECIFIED.toString());

          const req = new RegisterRequest();
          req.setUser(userId);
          req.setCodeForVe(verifyCode);
          req.setNewPassword(password);
          if (ssoJumpURL !== undefined && ssoJumpURL !== "") {
            req.setAttachSsoToken(true);
            req.setSsoJumpUrl(ssoJumpURL);
          }

          Vue.prototype.client.register(req, {}, (err, resp) => {
            Vue.prototype.__processGrpcWithGoogleAuthFlagResp(
              err,
              resp,
              resolve,
              reject
            );
          });
        } catch (err) {
          reject(err);
        }
      });
    };

    Vue.prototype.apiGoogleAuthGetSetupInfo = function() {
      return new Promise((resolve, reject) => {
        try {
          const req = new GoogleAuthGetSetupInfoRequest();
          Vue.prototype.client.googleAuthGetSetupInfo(req, {}, (err, resp) => {
            if (!Vue.prototype.__checkGRPCResp(err, resp, reject)) {
              return;
            }
            resolve(resp.getSecretKey());
          });
        } catch (err) {
          reject(err);
        }
      });
    };

    Vue.prototype.apiLogin = function(
      username,
      password,
      ssoJumpURL,
      codeForVe,
      codeForGa
    ) {
      return new Promise((resolve, reject) => {
        try {
          const userId = new UserId();
          userId.setUserName(username);
          userId.setUserVe(VerificationEquipment.VERIFICATION_EQUIPMENT_UNSPECIFIED.toString());
          const req = new LoginRequest();
          req.setUser(userId);
          req.setPassword(password);
          if (ssoJumpURL !== undefined && ssoJumpURL !== "") {
            req.setAttachSsoToken(true);
            req.setSsoJumpUrl(ssoJumpURL);
          }
          if (codeForVe !== undefined) {
            req.setCodeForVe(codeForVe);
          }
          if (codeForGa !== undefined) {
            req.setCodeForGa(codeForGa);
          }
          Vue.prototype.client.login(req, {}, (err, resp) => {
            Vue.prototype.__processGrpcWithGoogleAuthFlagResp(
              err,
              resp,
              resolve,
              reject
            );
          });
        } catch (err) {
          reject(err);
        }
      });
    };

    Vue.prototype.apiLogout = function() {
      return new Promise((resolve, reject) => {
        try {
          const req = new LogoutRequest();
          Vue.prototype.client.logout(req, {}, (err, resp) => {
            if (!Vue.prototype.__checkGRPCResp(err, resp, reject)) {
              return;
            }
            resolve();
          });
        } catch (err) {
          reject(err);
        }
      });
    };

    Vue.prototype.apiProfile = function(ssoJumpUrl) {
      return new Promise((resolve, reject) => {
        try {
          const req = new ProfileRequest();
          if (ssoJumpUrl !== undefined && ssoJumpUrl !== "") {
            req.setAttachSsoToken(true);
            req.setSsoJumpUrl(ssoJumpUrl);
          }
          Vue.prototype.client.profile(req, {}, (err, resp) => {
            const r = Vue.prototype.__checkUserGRPCResultForProfile(
              err,
              resp,
              reject
            );
            if (r === -1) {
              return;
            }
            let userInfo = {};
            if (resp.getInfo() !== undefined) {
              userInfo = resp.getInfo().toObject();
            }
            resolve({
              ssoToken: resp.getSsoToken(),
              result: r,
              user: userInfo
            });
          });
        } catch (err) {
          reject(err);
        }
      });
    };

    Vue.prototype.apiGoogleAuthVerify = function(code) {
      return new Promise((resolve, reject) => {
        try {
          const req = new GoogleAuthVerifyRequest();
          req.setCode(code);
          Vue.prototype.client.googleAuthVerify(req, {}, (err, resp) => {
            if (!Vue.prototype.__checkGRPCResp(err, resp, reject)) {
              return;
            }
            resolve(resp.getToken());
          });
        } catch (err) {
          reject(err);
        }
      });
    };

    Vue.prototype.apiGoogleAuthSet = function(code, oldToken) {
      return new Promise((resolve, reject) => {
        try {
          const req = new GoogleAuthSetRequest();
          req.setCode(code);
          if (oldToken !== undefined) {
            req.setTokenGaOld(oldToken);
          }
          Vue.prototype.client.googleAuthSet(req, {}, (err, resp) => {
            if (!Vue.prototype.__checkGRPCResp(err, resp, reject)) {
              return;
            }
            resolve();
          });
        } catch (err) {
          reject(err);
        }
      });
    };

    Vue.prototype.apiResetPassword = function(
      username,
      password,
      codeForVe,
      codeForGa
    ) {
      return new Promise((resolve, reject) => {
        try {
          const userId = new UserId();
          userId.setUserName(username);
          userId.setUserVe(VerificationEquipment.VERIFICATION_EQUIPMENT_UNSPECIFIED.toString());
          const req = new ResetPasswordRequest();
          req.setUser(userId);
          req.setNewPassword(password);
          req.setCodeForVe(codeForVe);
          if (codeForGa !== undefined) {
            req.setCodeForGa(codeForGa);
          }
          Vue.prototype.client.resetPassword(req, {}, (err, resp) => {
            if (
              !Vue.prototype.__processGrpcWithGoogleAuthFlagResp(
                err,
                resp,
                resolve,
                reject
              )
            ) {
              return;
            }
            resolve(resp.getToken());
          });
        } catch (err) {
          reject(err);
        }
      });
    };

    Vue.prototype.apiGetDetailInfo = function() {
      return new Promise((resolve, reject) => {
        try {
          const req = new GetDetailInfoRequest();
          Vue.prototype.client.getDetailInfo(req, {}, (err, resp) => {
            if (!Vue.prototype.__checkGRPCResp(err, resp, reject)) {
              return;
            }
            resolve(resp.getInfo().toObject());
          });
        } catch (err) {
          reject(err);
        }
      });
    };

    Vue.prototype.apiGetCsrfToken = function() {
      return new Promise((resolve, reject) => {
        try {
          const req = new GetCsrfTokenRequest();
          Vue.prototype.client.getCsrfToken(req, {}, (err, resp) => {
            if (!Vue.prototype.__checkGRPCResp(err, resp, reject)) {
              return;
            }
            resolve(resp.getCsrfToken());
          });
        } catch (err) {
          reject(err);
        }
      });
    };

    Vue.prototype.apiUpdateDetailInfoRequest = function({
      nickName,
      phone,
      email,
      weChat,
      avatar
    }) {
      return new Promise((resolve, reject) => {
        try {
          Vue.prototype
            .apiGetCsrfToken()
            .then(csrfToken => {
              const req = new UpdateDetailInfoRequest();
              req.setCsrfToken(csrfToken);
              if (nickName !== undefined) {
                req.setNickName(nickName);
              }
              if (phone !== undefined) {
                req.setPhone(phone);
              }
              if (email !== undefined) {
                req.setEmail(email);
              }
              if (weChat !== undefined) {
                req.setWeChat(weChat);
              }
              if (avatar !== undefined) {
                req.setAvatar(avatar);
              }
              Vue.prototype.client.updateDetailInfo(req, {}, (err, resp) => {
                if (!Vue.prototype.__checkGRPCResp(err, resp, reject)) {
                  return;
                }
                resolve();
              });
            })
            .catch(err => {
              reject(err);
            });
        } catch (err) {
          reject(err);
        }
      });
    };

    Vue.prototype.apiChangePassword = function(password, newPassword) {
      return new Promise((resolve, reject) => {
        try {
          Vue.prototype
            .apiGetCsrfToken()
            .then(csrfToken => {
              const req = new ChangePasswordRequest();
              req.setCsrfToken(csrfToken);
              req.setPassword(password);
              req.setNewPassword(newPassword);
              Vue.prototype.client.changePassword(req, {}, (err, resp) => {
                if (!Vue.prototype.__checkGRPCResp(err, resp, reject)) {
                  return;
                }
                resolve();
              });
            })
            .catch(err => {
              reject(err);
            });
        } catch (err) {
          reject(err);
        }
      });
    };

    Vue.prototype.updateQueryStringParameter = function(uri, key, value) {
      if (!value) {
        return uri;
      }

      const re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
      const separator = uri.indexOf("?") !== -1 ? "&" : "?";
      if (uri.match(re)) {
        return uri.replace(re, "$1" + key + "=" + value + "$2");
      } else {
        return uri + separator + key + "=" + value;
      }
    };

    Vue.prototype.apiGetUserList = function (offset, pageSize) {
      return new Promise((resolve, reject) => {
        try {
          Vue.prototype.apiGetCsrfToken().then(csrfToken => {
            const req = new GetUserListRequest();
            req.setCsrfToken(csrfToken);
            req.setOffset(offset);
            req.setLimit(pageSize);
            Vue.prototype.client.getUserList(req, {}, (err, resp) => {
              if (!Vue.prototype.__checkGRPCResp(err, resp, reject)) {
                return
              }
              resolve({ 'cnt': resp.getCnt(), 'users': resp.getUsersList()});
            })
          }).catch(err => {
            reject(err);
          })
        } catch (err) {
          reject(err);
        }
      })
    };

    Vue.prototype.__managerUser = function (userID, mType, resetPasswordPayload) {
      return new Promise((resolve, reject) => {
        try {
          Vue.prototype.apiGetCsrfToken().then(csrfToken => {
            const req = new ManagerUserRequest();
            req.setCsrfToken(csrfToken);
            req.setUid(userID);
            req.setType(mType);
            if (resetPasswordPayload !== undefined && resetPasswordPayload != null) {
              req.setResetPassword(resetPasswordPayload);
            }
            Vue.prototype.client.managerUser(req, {}, (err, resp) => {
              if (!Vue.prototype.__checkGRPCResp(err, resp, reject)) {
                return
              }
              resolve()
            })
          }).catch(err => {
            reject(err);
          })
        } catch (err) {
          reject(err);
        }
      })
    };

    Vue.prototype.apiSetUserAdmin = function (userID) {
      return Vue.prototype.__managerUser(userID, ManagerUserType.MANAGER_USER_TYPE_SET_ADMIN_PRIVILEGE)
    };

    Vue.prototype.apiUnsetUserAdmin = function (userID) {
      return Vue.prototype.__managerUser(userID, ManagerUserType.MANAGER_USER_TYPE_UNSET_ADMIN_PRIVILEGE)
    };

    Vue.prototype.apiSwitchUserAdminPrivileges = function (userID) {
      return Vue.prototype.__managerUser(userID, ManagerUserType.MANAGER_USER_TYPE_SWITCH_ADMIN_PRIVILEGE)
    };

    Vue.prototype.apiDeleteUser = function (userID) {
      return Vue.prototype.__managerUser(userID, ManagerUserType.MANAGER_USER_TYPE_DELETE)
    };

    Vue.prototype.apiResetUserPassword = function (userID, newPassword) {
      const resetPasswordRequest = new ManagerUserResetPasswordRequest();
      resetPasswordRequest.setNewPassword(newPassword);
      return Vue.prototype.__managerUser(userID, ManagerUserType.MANAGER_USER_TYPE_RESET_PASSWORD, resetPasswordRequest)
    };
  }
};
