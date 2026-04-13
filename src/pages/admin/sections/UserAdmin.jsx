import { useEffect, useState } from "react";
import userApi from "../../../api/userApi";
import userGroupApi from "../../../api/userGroupApi";

function UserAdmin() {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);

  const [mode, setMode] = useState("list");
  const [selected, setSelected] = useState(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    age: "",
    sex: "MALE",
    userGroupIds: [],
  });

  useEffect(() => {
    fetchUsers(page);
    fetchGroups();
  }, [page]);

  // ================= FETCH USERS =================
  const fetchUsers = async (page) => {
    const res = await userApi.admin.getAll(page);
    const data = res.data;

    setUsers(data?.data || []);
    setTotalPages(data?.totalPage || 1);
  };

  // ================= FETCH GROUP =================
  const fetchGroups = async () => {
    const res = await userGroupApi.getAll();

    // ✅ FIX BUG
    setGroups(res.data || []);
  };

  // ================= SELECT =================
  const handleSelect = (user) => {
    setSelected(user);

    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      password: "",
      age: user.age || "",
      sex: user.sex || "MALE",
      userGroupIds:
        user.userGroups?.map((ug) => {
          const found = groups.find((g) => g.name === ug.name);
          return found?.userGroupId;
        }) || [],
    });

    setMode("edit");
  };

  // ================= TOGGLE CHECKBOX =================
  const toggleGroup = (id) => {
    setForm((prev) => {
      const exists = prev.userGroupIds.includes(id);

      return {
        ...prev,
        userGroupIds: exists
          ? prev.userGroupIds.filter((x) => x !== id)
          : [...prev.userGroupIds, id],
      };
    });
  };

  // ================= UPDATE =================
  const handleSubmit = async () => {
    try {
      await userApi.admin.update(selected.userId, form);

      alert("Cập nhật thành công");

      setMode("list");
      fetchUsers(page);
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi hệ thống");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa?")) return;

    await userApi.admin.delete(id);
    fetchUsers(page);
  };

  // ================= LIST =================
  if (mode === "list") {
    return (
      <div className="card">
        <h2>👤 Quản lý người dùng</h2>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Nhóm</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.userId}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>{u.userGroups?.map((g) => g.name).join(", ")}</td>

                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleSelect(u)}
                  >
                    Sửa
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(u.userId)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div style={{ marginTop: 20 }}>
          <div className="pagination">
            {/* PREV */}
            <button
              className="nav-btn"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              ◀
            </button>

            {/* PAGE NUMBERS */}
            {(() => {
              const pages = [];
              const maxVisible = 5;

              let start = Math.max(0, page - 2);
              let end = Math.min(totalPages, start + maxVisible);

              if (end - start < maxVisible) {
                start = Math.max(0, end - maxVisible);
              }

              // dấu ... đầu
              if (start > 0) {
                pages.push(<span key="start-dots">...</span>);
              }

              for (let i = start; i < end; i++) {
                pages.push(
                  <button
                    key={i}
                    className={`page-number ${page === i ? "active" : ""}`}
                    onClick={() => setPage(i)}
                  >
                    {i + 1}
                  </button>,
                );
              }

              // dấu ... cuối
              if (end < totalPages) {
                pages.push(<span key="end-dots">...</span>);
              }

              return pages;
            })()}

            {/* NEXT */}
            <button
              className="nav-btn"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              ▶
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= EDIT =================
  return (
    <div className="card">
      <h2>✏️ Chỉnh sửa người dùng</h2>

      <div className="form-grid">
        <div className="form-group">
          <label>Tên</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>SĐT</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Địa chỉ</label>
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Mật khẩu</label>
          <input
            type="password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Tuổi</label>
          <input
            type="number"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Giới tính</label>
          <select
            value={form.sex}
            onChange={(e) => setForm({ ...form, sex: e.target.value })}
          >
            <option value="MALE">Nam</option>
            <option value="FEMALE">Nữ</option>
          </select>
        </div>
      </div>

      {/* ✅ CHECKBOX GROUP */}
      <div style={{ marginTop: 20 }}>
        <label style={{ fontWeight: 600 }}>Nhóm người dùng</label>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginTop: 10,
          }}
        >
          {groups.map((g) => (
            <label
              key={g.userGroupId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "#f1f5f9",
                padding: "6px 10px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={form.userGroupIds.includes(g.userGroupId)}
                onChange={() => toggleGroup(g.userGroupId)}
              />
              {g.name}
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <button className="btn btn-primary" onClick={handleSubmit}>
          Lưu
        </button>

        <button className="btn btn-secondary" onClick={() => setMode("list")}>
          Quay lại
        </button>
      </div>
    </div>
  );
}

export default UserAdmin;
