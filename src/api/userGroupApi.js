import axiosClient from "./axiosClient";

const userGroupApi = {
  getAll: () => axiosClient.get("/userGroups/"),

  getById: (id) => axiosClient.get(`/userGroups/${id}`),

  create: (data) => axiosClient.post("/userGroups/", data),

  update: (id, data) => axiosClient.patch(`/userGroups/${id}`, data),

  delete: (id) => axiosClient.delete(`/userGroups/${id}`),
};

export default userGroupApi;
