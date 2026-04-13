import axiosClient from "./axiosClient";

const roleGroupApi = {
  getAll: () => axiosClient.get("/roleGroups/"),

  getById: (id) => axiosClient.get(`/roleGroups/${id}`),

  create: (data) => axiosClient.post("/roleGroups/", data),

  update: (id, data) => axiosClient.patch(`/roleGroups/${id}`, data),

  delete: (id) => axiosClient.delete(`/roleGroups/${id}`),
};

export default roleGroupApi;
