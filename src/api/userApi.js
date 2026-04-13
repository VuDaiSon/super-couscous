import axiosClient from "./axiosClient";

const userApi = {
  admin: {
    getAll: (page = 0) =>
      axiosClient.get("/admin/", {
        params: { page, size: 10 },
      }),

    update: (userId, data) => axiosClient.patch(`/admin/${userId}`, data),

    delete: (userId) => axiosClient.delete(`/admin/${userId}`),
  },
};

export default userApi;
