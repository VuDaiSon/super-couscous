import axiosClient from "./axiosClient";

const cartApi = {
  addToCart: (productId, quantity) =>
    axiosClient.post("/carts/addToCart", {
      productId,
      quantity,
    }),

  // 🔥 FIX CHÍNH Ở ĐÂY
  getCart: async () => {
    try {
      const res = await axiosClient.get("/carts");

      // 👉 nếu backend trả null → convert sang cart rỗng
      return {
        ...res,
        data: res.data || { cartDetails: [] },
      };
    } catch (err) {
      console.log("getCart error:", err);

      // 👉 nếu lỗi → vẫn trả cart rỗng (không throw nữa)
      return {
        data: { cartDetails: [] },
      };
    }
  },

  updateCart: (cartDetailId, quantity) => {
    return axiosClient.patch("/carts/updateCart", {
      cartDetailId: cartDetailId,
      quantity: quantity,
    });
  },

  deleteCart: (cartDetailId) => axiosClient.delete(`/carts/${cartDetailId}`),
};

export default cartApi;
