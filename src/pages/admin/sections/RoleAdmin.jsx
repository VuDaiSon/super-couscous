import { useEffect, useState } from "react";
import roleApi from "../../../api/roleApi";

function RoleAdmin() {
  const [roles, setRoles] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    const res = await roleApi.getAll();
    setRoles(res.data || []);
  };

  const handleCreate = async () => {
    await roleApi.create({ name });
    setName("");
    fetchRoles();
  };

  return (
    <div className="card">
      <h2>🧩 Danh sách quyền</h2>

      <div style={{ display: "flex", gap: 10 }}>
        <input
          placeholder="Tên quyền"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleCreate}>
          Thêm
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
          </tr>
        </thead>

        <tbody>
          {roles.map((r) => (
            <tr key={r.roleId}>
              <td>{r.roleId}</td>
              <td>{r.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RoleAdmin;
