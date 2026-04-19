import axiosClient from "./axiosClient";

const fileApi = {
  delete: (url) => {
    return axiosClient.post("/files/delete", { url });
  },
};

export default fileApi;
