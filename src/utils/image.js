export const buildImageUrl = (path) => {
  if (!path) return "";

  // 🔥 FIX ở đây
  if (path.startsWith("http") || path.startsWith("blob")) {
    return path;
  }

  return `${process.env.REACT_APP_API_URL}${path}`;
};
