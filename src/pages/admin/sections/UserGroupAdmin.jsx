import { useEffect, useState } from "react";
import userGroupApi from "../../../api/userGroupApi";
import roleGroupApi from "../../../api/roleGroupApi";

function UserGroupAdmin() {
  const [groups, setGroups] = useState([]);
  const [roleGroups, setRoleGroups] = useState([]);

  const [mode, setMode] = useState("list");
  const [selected, setSelected] = useState(null);

  const [form, setForm] = useState({
    name: "",
    roleGroupIds: [],
  });

  useEffect(() => {
    fetchGroups();
    fetchRoleGroups();
  }, []);

  const fetchGroups = async () => {
    const res = await userGroupApi.getAll();
    setGroups(res.data || []);
  };

  const fetchRoleGroups = async () => {
    const res = await roleGroupApi.getAll();
    setRoleGroups(res.data || []);
  };

  const handleSelect = (g) => {
    setSelected(g);

    const mappedIds =
      g.roleGroups?.map((rg) => {
        const found = roleGroups.find((r) => r.name === rg.name);
        return found?.roleGroupId;
      }) || [];

    setForm({
      name: g.name,
      roleGroupIds: mappedIds.filter(Boolean),
    });

    setMode("edit");
  };

  const toggle = (id) => {
    setForm((prev) => {
      const exists = prev.roleGroupIds.includes(id);

      return {
        ...prev,
        roleGroupIds: exists
          ? prev.roleGroupIds.filter((x) => x !== id)
          : [...prev.roleGroupIds, id],
      };
    });
  };

  const handleSubmit = async () => {
    if (mode === "create") {
      await userGroupApi.create(form);
    } else {
      await userGroupApi.update(selected.userGroupId, form);
    }

    setMode("list");
    fetchGroups();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa?")) return;
    await userGroupApi.delete(id);
    fetchGroups();
  };

  if (mode === "list") {
    return (
      <div className="card">
        <h2>👥 Nhóm người dùng</h2>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            setForm({ name: "", roleGroupIds: [] });
            setMode("create");
          }}
        >
          + Thêm
        </button>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Nhóm quyền</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {groups.map((g) => (
              <tr key={g.userGroupId}>
                <td>{g.name}</td>
                <td>{g.roleGroups?.map((r) => r.name).join(", ")}</td>

                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleSelect(g)}
                  >
                    Sửa
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(g.userGroupId)}
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
      <h2>{mode === "create" ? "Tạo nhóm user" : "Sửa nhóm user"}</h2>

      <div className="form-group">
        <label>Tên</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <label>Nhóm quyền</label>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {roleGroups.map((r) => (
            <label key={r.roleGroupId}>
              <input
                type="checkbox"
                checked={form.roleGroupIds.includes(r.roleGroupId)}
                onChange={() => toggle(r.roleGroupId)}
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

export default UserGroupAdmin;
