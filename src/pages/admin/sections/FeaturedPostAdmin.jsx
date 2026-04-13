import { useEffect, useState } from "react";
import bannerApi from "../../../api/bannerApi";
import axiosClient from "../../../api/axiosClient";
import categoryApi from "../../../api/categoryApi";
import { buildImageUrl } from "../../../utils/image";

function FeaturedPostAdmin() {
  const [list, setList] = useState([]);
  const [categories, setCategories] = useState([]);

  const [mode, setMode] = useState("list");
  const [selected, setSelected] = useState(null);

  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  const [form, setForm] = useState({
    url: "",
    categoryId: "",
  });

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  const fetchData = async () => {
    const res = await bannerApi.getAll();
    setList(res.data || []);
  };

  const fetchCategories = async () => {
    const res = await categoryApi.getAll(0);
    setCategories(res.data?.data || []);
  };

  const handleSelect = (item) => {
    setSelected(item);

    setForm({
      url: item.url,
      categoryId: item.category?.categoryId || "",
    });

    setPreview(item.url);
    setFile(null);

    setMode("edit");
  };

  const handleCreate = () => {
    setForm({
      url: "",
      categoryId: "",
    });

    setPreview(null);
    setFile(null);

    setMode("create");
  };

  // 🔥 chỉ preview
  const handleUpload = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!preview) return alert("Chưa có ảnh");

    try {
      // 🔥 STEP 1: CHECK TRƯỚC (QUAN TRỌNG NHẤT)
      if (mode === "create") {
        const existed = list.find(
          (item) => item.category?.categoryId === form.categoryId,
        );

        if (existed) {
          return alert("❌ Category này đã có banner rồi!");
        }
      }

      let imageUrl = form.url;

      // 🔥 STEP 2: CHỈ upload khi chắc chắn OK
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await axiosClient.post("/files/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        imageUrl = res.data;
      }

      // 🔥 STEP 3: CALL API
      const payload = {
        ...form,
        url: imageUrl,
      };

      if (mode === "create") {
        await bannerApi.create(payload);
        alert("Tạo thành công");
      } else {
        await bannerApi.update(selected.featuredPostId, payload);
        alert("Cập nhật thành công");
      }

      setMode("list");
      fetchData();
    } catch (err) {
      console.log(err);
      alert("❌ Lỗi tạo banner");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa banner?")) return;
    await bannerApi.delete(id);
    fetchData();
  };

  // ================= LIST =================
  if (mode === "list") {
    return (
      <div className="card">
        <h2>🖼️ Banners</h2>

        <button onClick={handleCreate}>+ Thêm banner</button>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Danh mục</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {list.map((item) => (
              <tr key={item.featuredPostId}>
                <td>
                  <img src={buildImageUrl(item.url)} width="120" alt="" />
                </td>
                <td>{item.category?.name || "-"}</td>
                <td>
                  <button onClick={() => handleSelect(item)}>Sửa</button>
                  <button onClick={() => handleDelete(item.featuredPostId)}>
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

  // ================= FORM =================
  return (
    <div className="card">
      <h2>{mode === "create" ? "Thêm" : "Sửa"} banner</h2>

      <div className="form-group">
        <label>Danh mục</label>
        <select
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
        >
          <option value="">-- chọn --</option>
          {categories.map((c) => (
            <option key={c.categoryId} value={c.categoryId}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Ảnh banner</label>

        <div className="upload-hint">
          📏 Tỉ lệ quy định: <b>16 : 5.5</b> (1920 x 660px)
        </div>

        <input type="file" onChange={handleUpload} />

        {preview && <img src={preview} width="200" alt="" />}
      </div>

      <button onClick={handleSubmit}>
        {mode === "create" ? "Tạo" : "Cập nhật"}
      </button>

      <button onClick={() => setMode("list")}>Quay lại</button>
    </div>
  );
}

export default FeaturedPostAdmin;
