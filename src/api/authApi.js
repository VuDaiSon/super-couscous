import axiosClient from "./axiosClient";

const authApi = {
  login: (email, password) => {
    return axiosClient.post("/user/login", {
      email,
      password,
    });
  },

  logout: () => {
    return axiosClient.post("/user/logout");
  },

  getProfile: (userId) => {
    return axiosClient.get(`/user/${userId}`);
  },

  updateProfile: (userId, data) => {
    return axiosClient.put(`/user/${userId}`, data);
  },

  changePassword: (userId, data) => {
    return axiosClient.put(`/user/${userId}/change-password`, data);
  },

  register: (data) => {
    return axiosClient.post("/user/register", data);
  },

  // 1. Gửi email reset password
  forgotPassword: (email) => {
    return axiosClient.post("/user/forgot-password", { email });
  },

  // 2. Reset password bằng token
  resetPassword: (token, newPassword) => {
    return axiosClient.post("/user/reset-password", {
      token,
      newPassword,
    });
  },
};

export default authApi;
