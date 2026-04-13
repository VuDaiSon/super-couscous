import { useEffect, useState } from "react";
import categoryApi from "../../../api/categoryApi";
import axiosClient from "../../../api/axiosClient";
import { buildImageUrl } from "../../../utils/image";

function CategoryAdmin() {
  const [categories, setCategories] = useState([]);

  const [mode, setMode] = useState("list");
  const [selected, setSelected] = useState(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // 🔥 FILE thật
  const [imageFile, setImageFile] = useState(null);

  // 🔥 preview
  const [preview, setPreview] = useState(null);

  const [form, setForm] = useState({
    name: "",
    image: "",
  });

  useEffect(() => {
    fetchCategories(page);
  }, [page]);

  const fetchCategories = async (page) => {
    const res = await categoryApi.getAll(page);
    setCategories(res.data?.data || []);
    setTotalPages(res.data?.totalPage || 1);
  };

  // ================= SELECT =================
  const handleSelect = async (id) => {
    const res = await categoryApi.getById(id);
    const data = res.data;

    setSelected(data);

    setForm({
      name: data.name,
      image: data.image,
    });

    setPreview(data.image);
    setImageFile(null);

    setMode("edit");
  };

  const handleCreate = () => {
    setForm({ name: "", image: "" });
    setPreview(null);
    setImageFile(null);
    setMode("create");
  };

  // ================= IMAGE =================
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    let imageUrl = form.image;

    // 🔥 chỉ upload nếu có file mới
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);

      const res = await axiosClient.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      imageUrl = res.data;
    }

    const payload = {
      ...form,
      image: imageUrl,
    };

    if (mode === "create") {
      await categoryApi.create(payload);
      alert("Tạo thành công");
    } else {
      await categoryApi.update(selected.categoryId, payload);
      alert("Cập nhật thành công");
    }

    setMode("list");
    setPage(0);
    fetchCategories(0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa?")) return;
    await categoryApi.delete(id);
    fetchCategories(page);
  };

  // ================= LIST =================
  if (mode === "list") {
    return (
      <div className="card">
        <h2>📂 Danh mục</h2>

        <button onClick={handleCreate}>+ Thêm</button>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Ảnh</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {categories.map((c) => (
              <tr key={c.categoryId}>
                <td>{c.name}</td>
                <td>
                  <img src={buildImageUrl(c.image)} width="50" alt="" />
                </td>
                <td>
                  <button onClick={() => handleSelect(c.categoryId)}>
                    Sửa
                  </button>
                  <button onClick={() => handleDelete(c.categoryId)}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 20 }}>
          <button disabled={page === 0} onClick={() => setPage(page - 1)}>
            ◀ Prev
          </button>

          <span style={{ margin: "0 10px" }}>
            Page {page + 1} / {totalPages}
          </span>

          <button
            disabled={page + 1 >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next ▶
          </button>
        </div>
      </div>
    );
  }

  // ================= FORM =================
  return (
    <div className="card">
      <h2>{mode === "create" ? "Thêm" : "Sửa"} danh mục</h2>

      <input
        placeholder="Tên"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <input type="file" onChange={handleImageUpload} />

      {preview && <img src={preview} width="120" alt="" />}

      <div style={{ marginTop: 10 }}>
        <button onClick={handleSubmit}>Lưu</button>
        <button onClick={() => setMode("list")} style={{ marginLeft: 10 }}>
          Quay lại
        </button>
      </div>
    </div>
  );
}

export default CategoryAdmin;
