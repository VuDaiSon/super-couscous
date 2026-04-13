import { hasPermission } from "../../../utils/permission";

function Sidebar({ tab, setTab }) {
  const Item = ({ id, label, icon }) => (
    <button className={tab === id ? "active" : ""} onClick={() => setTab(id)}>
      <span className="icon">{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="sidebar">
      <h3>⚡ ADMIN PANEL</h3>

      <Item id="dashboard" label="Tổng quan" icon="📊" />

      {hasPermission("add") && <Item id="product" label="Sản phẩm" icon="📦" />}

      {hasPermission("add") && (
        <Item id="category" label="Danh mục" icon="📂" />
      )}
      {hasPermission("add") && <Item id="banner" label="Banner" icon="🖼️" />}

      {hasPermission("ORDER_MANAGE") && (
        <Item id="order" label="Đơn hàng" icon="🧾" />
      )}

      {hasPermission("USER_MANAGE") && (
        <Item id="user" label="Người dùng" icon="👤" />
      )}

      {hasPermission("USER_GROUP_MANAGE") && (
        <Item id="userGroup" label="Nhóm user" icon="👥" />
      )}

      {hasPermission("ROLE_GROUP_MANAGE") && (
        <Item id="roleGroup" label="Nhóm quyền" icon="🛡️" />
      )}

      {hasPermission("ROLE_GROUP_MANAGE") && (
        <Item id="role" label="Quyền" icon="🔑" />
      )}
    </div>
  );
}

export default Sidebar;
