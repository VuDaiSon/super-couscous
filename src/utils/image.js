export const buildImageUrl = (url) => {
  if (!url) return "";

  return url.replace(
    "/upload/",
    "/upload/f_auto,q_auto,dpr_auto,c_fill,w_800,h_800/",
  );
};
