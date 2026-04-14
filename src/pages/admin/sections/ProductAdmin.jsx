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

  // =============================
  // SELECT / CREATE
  // =============================
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

  const handleCreate = () => {
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

    setMainPreview(null);
    setImagesPreview([]);
    setMainFile(null);
    setImageFiles([]);

    setMode("create");
  };

  // =============================
  // IMAGE
  // =============================
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
    const oldImagesCount = form.image.length;

    if (index < oldImagesCount) {
      const newImages = form.image.filter((_, i) => i !== index);
      setForm((prev) => ({ ...prev, image: newImages }));
    } else {
      const fileIndex = index - oldImagesCount;
      setImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
    }

    setImagesPreview((prev) => prev.filter((_, i) => i !== index));
  };

  // =============================
  // CLOUDINARY UPLOAD
  // =============================
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

  // =============================
  // SUBMIT (🔥 FIX SPAM)
  // =============================
  const handleSubmit = async () => {
    // 🔥 CHẶN SPAM CỨNG
    if (submitLock.current || loading) return;

    submitLock.current = true;
    setLoading(true);

    try {
      if (!mainPreview) {
        alert("Thiếu ảnh chính");
        return;
      }

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

      alert(mode === "create" ? "Tạo thành công" : "Cập nhật thành công");

      setMode("list");
      setPage(0);
      fetchProducts(0);
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra");
    } finally {
      // 🔥 DELAY UNLOCK → CHẶN CLICK LIÊN HOÀN
      setTimeout(() => {
        submitLock.current = false;
        setLoading(false);
      }, 800);
    }
  };

  // =============================
  // DELETE
  // =============================
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa?")) return;
    await productApi.admin.delete(id);
    fetchProducts(page);
  };

  // =============================
  // LIST UI
  // =============================
  if (mode === "list") {
    return (
      <div className="card">
        <h2>📦 Quản lý sản phẩm</h2>

        <button onClick={handleCreate}>+ Thêm sản phẩm</button>

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
                  <img src={buildImageUrl(p.mainImage)} width="50" alt="" />
                </td>
                <td>
                  <button onClick={() => handleSelect(p.productId)}>Sửa</button>
                  <button onClick={() => handleDelete(p.productId)}>Xóa</button>
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

  // =============================
  // FORM UI
  // =============================
  return (
    <div className="card">
      <h2>{mode === "create" ? "Thêm" : "Chỉnh sửa"} sản phẩm</h2>

      <div className="form-grid">
        <input
          placeholder="Tên"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Mô tả"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <input
          type="number"
          placeholder="Giá"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
        />

        <input
          type="number"
          placeholder="Số lượng"
          value={form.quantity}
          onChange={(e) =>
            setForm({ ...form, quantity: Number(e.target.value) })
          }
        />

        <select
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
        >
          <option value="">Chọn danh mục</option>
          {categories.map((c) => (
            <option key={c.categoryId} value={c.categoryId}>
              {c.name}
            </option>
          ))}
        </select>

        <input type="file" onChange={handleMainImageUpload} />
        {mainPreview && <img src={mainPreview} width="100" />}

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

      <div style={{ marginTop: 20 }}>
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Đang xử lý..." : mode === "create" ? "Tạo" : "Cập nhật"}
        </button>

        <button onClick={() => setMode("list")} style={{ marginLeft: 10 }}>
          Quay lại
        </button>
      </div>
    </div>
  );
}

export default ProductAdmin;
