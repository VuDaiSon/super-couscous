export const buildImageUrl = (url, maxWidth = 1200) => {
  if (!url) return "";

  return url.replace(
    "/upload/",
    `/upload/f_auto,q_auto,dpr_auto,c_limit,w_${maxWidth}/`,
  );
};
