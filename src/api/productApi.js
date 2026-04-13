import axiosClient from "./axiosClient";

const productApi = {
  // ================= USER =================
  getAll: (page = 0, sortBy = "date", sortDirection = "DESC") => {
    return axiosClient.get("/products", {
      params: {
        page: page,
        size: 10,
        orderBy: sortBy,
        orderDirection: sortDirection,
      },
    });
  },

  search: (keyword, page = 0, sortBy = "date", sortDirection = "DESC") => {
    return axiosClient.get("/products/search", {
      params: {
        keyword: keyword,
        page: page,
        size: 10,
        orderBy: sortBy,
        orderDirection: sortDirection,
      },
    });
  },

  getByCategory: (
    categoryId,
    page = 0,
    sortBy = "date",
    sortDirection = "DESC",
  ) => {
    return axiosClient.get(`/products/category/${categoryId}`, {
      params: {
        page: page,
        size: 10,
        orderBy: sortBy,
        orderDirection: sortDirection,
      },
    });
  },

  getById: (productId) => {
    return axiosClient.get(`/products/${productId}`);
  },

  // ================= ADMIN =================
  admin: {
    getAll: (page = 0) => {
      return axiosClient.get("/products", {
        params: { page, size: 10 },
      });
    },

    create: (data) => {
      return axiosClient.post("/products/add", data);
    },

    update: (id, data) => {
      return axiosClient.put(`/products/${id}`, data);
    },

    delete: (id) => {
      return axiosClient.delete(`/products/${id}`);
    },
  },
};

export default productApi;
