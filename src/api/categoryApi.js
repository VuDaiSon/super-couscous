import axiosClient from "./axiosClient";

const categoryApi = {
  // ================= LIST (có pagination) =================
  getAll: (page = 0, size = 10) => {
    return axiosClient.get("/categories/", {
      params: {
        page,
        size,
      },
    });
  },

  // ================= DETAIL =================
  getById: (id) => {
    return axiosClient.get(`/categories/${id}`);
  },

  // ================= CREATE =================
  create: (data) => {
    return axiosClient.post("/categories/", data);
  },

  // ================= UPDATE =================
  update: (id, data) => {
    return axiosClient.patch(`/categories/${id}`, data);
  },

  // ================= DELETE =================
  delete: (id) => {
    return axiosClient.delete(`/categories/${id}`);
  },
};

export default categoryApi;
