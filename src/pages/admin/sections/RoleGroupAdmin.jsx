import { useEffect, useState } from "react";
import roleGroupApi from "../../../api/roleGroupApi";
import roleApi from "../../../api/roleApi";

function RoleGroupAdmin() {
  const [groups, setGroups] = useState([]);
  const [roles, setRoles] = useState([]);

  const [mode, setMode] = useState("list");
  const [selected, setSelected] = useState(null);

  const [form, setForm] = useState({
    name: "",
    roleId: [],
  });

  useEffect(() => {
    fetchGroups();
    fetchRoles();
  }, []);

  const fetchGroups = async () => {
    const res = await roleGroupApi.getAll();
    setGroups(res.data || []);
  };

  const fetchRoles = async () => {
    const res = await roleApi.getAll();
    setRoles(res.data || []);
  };

  const handleSelect = async (g) => {
    setSelected(g);

    setForm({
      name: g.name,
      roleId: g.roles?.map((r) => r.roleId) || [],
    });

    setMode("edit");
  };

  const toggleRole = (id) => {
    setForm((prev) => {
      const exists = prev.roleId.includes(id);

      return {
        ...prev,
        roleId: exists
          ? prev.roleId.filter((x) => x !== id)
          : [...prev.roleId, id],
      };
    });
  };

  const handleSubmit = async () => {
    if (mode === "create") {
      await roleGroupApi.create(form);
    } else {
      await roleGroupApi.update(selected.roleGroupId, form);
    }

    setMode("list");
    fetchGroups();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa?")) return;
    await roleGroupApi.delete(id);
    fetchGroups();
  };

  if (mode === "list") {
    return (
      <div className="card">
        <h2>🛡️ Nhóm quyền</h2>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            setForm({ name: "", roleId: [] });
            setMode("create");
          }}
        >
          + Thêm
        </button>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Quyền</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {groups.map((g) => (
              <tr key={g.roleGroupId}>
                <td>{g.name}</td>
                <td>{g.roles?.map((r) => r.name).join(", ")}</td>

                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleSelect(g)}
                  >
                    Sửa
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(g.roleGroupId)}
                    style={{ marginLeft: 8 }}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>{mode === "create" ? "Tạo nhóm quyền" : "Sửa nhóm quyền"}</h2>

      <div className="form-group">
        <label>Tên</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <label>Danh sách quyền</label>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {roles.map((r) => (
            <label key={r.roleId}>
              <input
                type="checkbox"
                checked={form.roleId.includes(r.roleId)}
                onChange={() => toggleRole(r.roleId)}
              />
              {r.name}
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <button className="btn btn-primary" onClick={handleSubmit}>
          Lưu
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => setMode("list")}
          style={{ marginLeft: 10 }}
        >
          Quay lại
        </button>
      </div>
    </div>
  );
}

export default RoleGroupAdmin;
