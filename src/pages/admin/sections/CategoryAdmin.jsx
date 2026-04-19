import { useEffect, useState, useRef } from "react";
import categoryApi from "../../../api/categoryApi";
import axiosClient from "../../../api/axiosClient";
import { buildImageUrl } from "../../../utils/image";
import axios from "axios";
import fileApi from "../../../api/fileApi";

const CLOUD_NAME = "dxohrnltp";
const UPLOAD_PRESET = "upload_public";

function CategoryAdmin() {
  // ===== CLOUDINARY =====
  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);
    data.append("folder", "categories");

    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      data,
    );

    return {
      url: res.data.secure_url,
      publicId: res.data.public_id,
    };
  };
  const [loading, setLoading] = useState(false);
  const submitLock = useRef(false);

  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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

    // ❗ nếu user cancel → reset
    if (!file) {
      setImageFile(null);
      setPreview(null);
      return;
    }

    // ❗ revoke URL cũ để tránh leak memory
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (submitLock.current) return;

    submitLock.current = true;
    setLoading(true);

    let uploadedImage = null;

    try {
      if (!form.name) throw new Error("Thiếu tên danh mục");

      let imageUrl = form.image;

      // ✅ upload 1 lần duy nhất
      if (imageFile) {
        uploadedImage = await uploadToCloudinary(imageFile);
        imageUrl = uploadedImage.url;
      }

      const payload = {
        ...form,
        image: imageUrl,
      };

      if (mode === "create") {
        await categoryApi.create(payload);
      } else {
        await categoryApi.update(selected.categoryId, payload);
      }

      showToast("Thành công");

      setMode("list");
      setPage(0);
      fetchCategories(0);
    } catch (err) {
      // 🔥 CLEANUP ẢNH RÁC (QUAN TRỌNG NHẤT)
      if (uploadedImage?.url) {
        try {
          await fileApi.delete(uploadedImage.url); // ✅ gửi URL cho BE
        } catch (cleanupErr) {
          console.error("❌ Cleanup fail", cleanupErr);
        }
      }

      let msg = "Có lỗi xảy ra";

      if (err.response?.data) {
        msg =
          typeof err.response.data === "string"
            ? err.response.data
            : err.response.data.message || msg;
      } else {
        msg = err.message || msg;
      }

      showToast(msg, "error");
    } finally {
      submitLock.current = false;
      setLoading(false);
    }
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
        {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
        <h2>📂 Danh mục</h2>

        <button className="btn btn-primary" onClick={handleCreate}>
          + Thêm
        </button>
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
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleSelect(c.categoryId)}
                  >
                    Sửa
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(c.categoryId)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button
            className="nav-btn"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            ◀
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`page-number ${i === page ? "active" : ""}`}
              onClick={() => setPage(i)}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="nav-btn"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            ▶
          </button>
        </div>
      </div>
    );
  }

  // ================= FORM =================
  return (
    <div className="card">
      <h2>{mode === "create" ? "Thêm" : "Sửa"} danh mục</h2>

      <div className="form-grid">
        <div className="form-group">
          <label>Tên danh mục</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Ảnh</label>
          <input type="file" onChange={handleImageUpload} />
          {preview && <img src={preview} width="120" />}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Lưu"}
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

export default CategoryAdmin;
