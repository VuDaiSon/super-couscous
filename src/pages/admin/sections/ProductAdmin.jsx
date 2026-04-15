import { useEffect, useState, useRef } from "react";
import productApi from "../../../api/productApi";
import categoryApi from "../../../api/categoryApi";
import { buildImageUrl } from "../../../utils/image";
import axios from "axios";

const CLOUD_NAME = "dxohrnltp";
const UPLOAD_PRESET = "upload_public";

function ProductAdmin() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [mode, setMode] = useState("list");
  const [selected, setSelected] = useState(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const submitLock = useRef(false);

  const [mainFile, setMainFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);

  const [mainPreview, setMainPreview] = useState(null);
  const [imagesPreview, setImagesPreview] = useState([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    quantity: 0,
    price: 0,
    color: "",
    mainImage: "",
    image: [],
    age: 0,
    sex: "UNISEX",
    categoryId: "",
  });

  useEffect(() => {
    fetchProducts(page);
    fetchCategories();
  }, [page]);

  const fetchProducts = async (page) => {
    const res = await productApi.getAll(page);
    setProducts(res.data?.data || []);
    setTotalPages(res.data?.totalPage || 1);
  };

  const fetchCategories = async () => {
    const res = await categoryApi.getAll(0);
    setCategories(res.data?.data || []);
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      quantity: 0,
      price: 0,
      color: "",
      mainImage: "",
      image: [],
      age: 0,
      sex: "UNISEX",
      categoryId: "",
    });
    setMainFile(null);
    setImageFiles([]);
    setMainPreview(null);
    setImagesPreview([]);
  };

  const handleCreate = () => {
    resetForm();
    setMode("create");
  };

  const handleSelect = async (id) => {
    const res = await productApi.getById(id);
    const data = res.data;

    setSelected(data);

    setForm({
      name: data.name,
      description: data.description,
      quantity: data.quantity,
      price: data.price,
      color: data.color,
      mainImage: data.mainImage,
      image: data.image || [],
      age: data.age,
      sex: data.sex,
      categoryId: data.category?.categoryId || "",
    });

    setMainPreview(data.mainImage);
    setImagesPreview(data.image || []);
    setMainFile(null);
    setImageFiles([]);

    setMode("edit");
  };

  // ===== IMAGE HANDLER =====
  const handleMainImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMainFile(file);
    setMainPreview(URL.createObjectURL(file));
  };

  const handleImagesUpload = (e) => {
    const files = Array.from(e.target.files);

    setImageFiles((prev) => [...prev, ...files]);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagesPreview((prev) => [...prev, ...previews]);
  };

  const handleRemoveImage = (index) => {
    const oldCount = form.image.length;

    if (index < oldCount) {
      const newImages = form.image.filter((_, i) => i !== index);
      setForm((prev) => ({ ...prev, image: newImages }));
    } else {
      const fileIndex = index - oldCount;
      setImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
    }

    setImagesPreview((prev) => prev.filter((_, i) => i !== index));
  };

  // ===== CLOUDINARY =====
  const uploadToCloudinary = async (file, folder) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);
    data.append("folder", folder);

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

    try {
      if (!mainPreview) throw new Error("Thiếu ảnh chính");

      let mainImageUrl = form.mainImage;
      let imageUrls = form.image || [];

      if (mainFile) {
        mainImageUrl = await uploadToCloudinary(mainFile, "products");
      }

      if (imageFiles.length > 0) {
        const uploads = imageFiles.map((file) =>
          uploadToCloudinary(file, "products"),
        );

        const newUrls = await Promise.all(uploads);
        imageUrls = [...imageUrls, ...newUrls];
      }

      const payload = {
        ...form,
        mainImage: mainImageUrl,
        image: imageUrls,
      };

      if (mode === "create") {
        await productApi.admin.create(payload);
      } else {
        await productApi.admin.update(selected.productId, payload);
      }

      alert("Thành công");

      setMode("list");
      fetchProducts(0);
    } catch (err) {
      console.error(err);
      alert(err.message || "Lỗi");
    } finally {
      submitLock.current = false;
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa?")) return;
    await productApi.admin.delete(id);
    fetchProducts(page);
  };

  // ===== LIST =====
  if (mode === "list") {
    return (
      <div className="card">
        <h2>📦 Quản lý sản phẩm</h2>

        <button className="btn btn-primary" onClick={handleCreate}>
          + Thêm sản phẩm
        </button>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Giá</th>
              <th>Số lượng</th>
              <th>Ảnh</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p.productId}>
                <td>{p.name}</td>
                <td>{p.price}</td>
                <td>{p.quantity}</td>
                <td>
                  <img src={buildImageUrl(p.mainImage)} width="50" />
                </td>
                <td>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleSelect(p.productId)}
                  >
                    Sửa
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(p.productId)}
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
      <h2>{mode === "create" ? "Thêm" : "Chỉnh sửa"} sản phẩm</h2>

      <div className="form-grid">
        <div className="form-group">
          <label>Tên</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Giá</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Số lượng</label>
          <input
            type="number"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />
        </div>

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
          <label>Ảnh chính</label>
          <input type="file" onChange={handleMainImageUpload} />
          {mainPreview && <img src={mainPreview} width="100" />}
        </div>

        <div className="form-group">
          <label>Ảnh phụ</label>
          <input type="file" multiple onChange={handleImagesUpload} />
          <div>
            {imagesPreview.map((img, i) => (
              <div key={i}>
                <img src={img} width="80" />
                <button onClick={() => handleRemoveImage(i)}>X</button>
              </div>
            ))}
          </div>
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

export default ProductAdmin;
