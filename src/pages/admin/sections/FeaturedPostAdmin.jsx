import { useEffect, useState, useRef } from "react";
import bannerApi from "../../../api/bannerApi";
import categoryApi from "../../../api/categoryApi";
import axios from "axios";
import { buildImageUrl } from "../../../utils/image";
import fileApi from "../../../api/fileApi";

const CLOUD_NAME = "dxohrnltp";
const UPLOAD_PRESET = "upload_public";

function FeaturedPostAdmin() {
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [list, setList] = useState([]);
  const [categories, setCategories] = useState([]);

  const [mode, setMode] = useState("list");
  const [selected, setSelected] = useState(null);

  const [loading, setLoading] = useState(false);
  const submitLock = useRef(false);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [toast, setToast] = useState(null);

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

  // ===== TOAST =====
  const showToast = (message, type = "success") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const resetForm = () => {
    setForm({
      url: "",
      categoryId: "",
    });
    setFile(null);
    setPreview(null);
  };

  const handleCreate = () => {
    resetForm();
    setMode("create");
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

  // ===== IMAGE =====
  const handleUpload = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  // ===== CLOUDINARY =====
  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);
    data.append("folder", "banners");

    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      data,
    );

    return res.data.secure_url;
  };

  // ===== SUBMIT =====
  const handleSubmit = async () => {
    if (submitLock.current) return;

    submitLock.current = true;
    setLoading(true);

    let uploadedImage = null;

    try {
      if (!preview) throw new Error("Chưa có ảnh");
      if (!form.categoryId) throw new Error("Chưa chọn danh mục");

      if (mode === "create") {
        const existed = list.find(
          (item) => item.category?.categoryId === form.categoryId,
        );
        if (existed) throw new Error("Category đã có banner");
      }

      // upload
      if (file) {
        uploadedImage = await uploadToCloudinary(file);
        setUploadedUrl(uploadedImage);
      }

      const payload = {
        ...form,
        url: uploadedImage || form.url,
      };

      await (mode === "create"
        ? bannerApi.create(payload)
        : bannerApi.update(selected.featuredPostId, payload));

      showToast("Thành công", "success");
      setMode("list");
      fetchData();
    } catch (err) {
      // ❗ IMPORTANT: nếu upload xong mà API fail
      // thì ảnh đã "rác" → chỉ có thể log hoặc cleanup backend

      if (uploadedImage) {
        console.warn("⚠️ Cleanup orphan image:", uploadedImage);

        try {
          await fileApi.delete(uploadedImage);
        } catch (cleanupErr) {
          console.error("❌ Cleanup failed:", cleanupErr);
        }
      }
      console.error("🔥 API ERROR:", err);

      let errorMessage = "Có lỗi xảy ra";

      if (err.response) {
        const data = err.response.data;

        if (typeof data === "string") {
          errorMessage = data;
        } else if (data?.message) {
          errorMessage = data.message;
        } else {
          errorMessage = "Dữ liệu không hợp lệ hoặc Danh mục này đã có banner";
        }
      }

      showToast(errorMessage, "error");
    } finally {
      submitLock.current = false;
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa?")) return;
    await bannerApi.delete(id);
    fetchData();
    showToast("Đã xóa banner", "success");
  };

  // ===== LIST =====
  if (mode === "list") {
    return (
      <div className="card">
        {/* TOAST */}
        {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}

        <h2>🖼️ Quản lý banner</h2>

        <button className="btn btn-primary" onClick={handleCreate}>
          + Thêm banner
        </button>

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
                  <img src={buildImageUrl(item.url)} width="120" />
                </td>
                <td>{item.category?.name || "-"}</td>
                <td>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleSelect(item)}
                  >
                    Sửa
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(item.featuredPostId)}
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

  // ===== FORM =====
  return (
    <div className="card">
      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}

      <h2>{mode === "create" ? "Thêm" : "Chỉnh sửa"} banner</h2>

      <div className="form-grid">
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

          <div style={{ fontSize: 12, color: "#64748b" }}>
            📏 Tỉ lệ: <b>16 : 5.5</b> (1920 x 660px)
          </div>

          <input type="file" onChange={handleUpload} />

          {preview && <img src={preview} width="200" />}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Submit"}
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

export default FeaturedPostAdmin;
