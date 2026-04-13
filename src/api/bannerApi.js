import axiosClient from "./axiosClient";

const bannerApi = {
  getAll: () => axiosClient.get("/featuredPosts/"),

  create: (data) => axiosClient.post("/featuredPosts/", data),

  update: (id, data) => axiosClient.put(`/featuredPosts/${id}`, data),

  delete: (id) => axiosClient.delete(`/featuredPosts/${id}`),
};

export default bannerApi;
