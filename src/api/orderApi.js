import axiosClient from "./axiosClient";

const orderApi = {
  // user
  checkout: () => axiosClient.get("/orders/"),
  confirm: (data) => axiosClient.post("/orders/confirm", data),
  getOrders: (params) => axiosClient.get("/orders", { params }),
  getOrderDetail: (orderId) => axiosClient.get(`/orders/api/${orderId}`),
  cancelOrder: (orderId) => axiosClient.put(`/orders/cancel/${orderId}`),

  // ================= ADMIN =================
  admin: {
    getAll: (page = 0) =>
      axiosClient.get("/orders/adminIndex", {
        params: { page, size: 10 },
      }),

    getDetail: (orderId) => axiosClient.get(`/orders/admin/edit/${orderId}`),

    update: (orderId, data) =>
      axiosClient.post(`/orders/adminEdit/${orderId}`, data),
  },
};

export default orderApi;
