export const buildImageUrl = (url) => {
  if (!url) return "";

  return url.replace("/upload/", "/upload/f_auto,q_auto,c_limit,w_800/");
};
