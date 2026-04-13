import axiosClient from "./axiosClient";

const roleApi = {
  getAll: () => axiosClient.get("/roles/"),

  create: (data) => axiosClient.post("/roles/", data),
};

export default roleApi;
