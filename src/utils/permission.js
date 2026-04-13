export const getRoles = () => {
  return JSON.parse(localStorage.getItem("roles") || "[]");
};

export const hasPermission = (permission) => {
  const roles = getRoles();
  return roles.includes(permission);
};

export const canAccessAdmin = () => {
  const roles = getRoles();

  return roles.some((role) =>
    [
      "add",
      "update",
      "delete",
      "ORDER_MANAGE",
      "USER_MANAGE",
      "USER_GROUP_MANAGE",
      "ROLE_GROUP_MANAGE",
    ].includes(role),
  );
};
