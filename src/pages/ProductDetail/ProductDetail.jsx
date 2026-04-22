import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Topbar from "../../components/Topbar/Topbar";
import Navbar from "../../components/Navbar/Navbar";
import productApi from "../../api/productApi";
import cartApi from "../../api/cartApi";
import "./ProductDetail.scss";
import { buildImageUrl } from "../../utils/image";
import Footer from "../../components/footer/Footer";

function ProductDetail() {
  const [adding, setAdding] = useState(false);

  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState("");
  const [zoomStyle, setZoomStyle] = useState({});
  const [isHovering, setIsHovering] = useState(false);

  const imgRef = useRef();
  const currentIndexRef = useRef(0);

  // ================= FETCH =================
  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    const res = await productApi.getById(productId);
    const data = res.data;

    setProduct(data);
    setActiveImage(data.mainImage);

    const rel = await productApi.getByCategory(data.category.categoryId, 0);

    const filtered = (rel.data.data || []).filter(
      (p) => p.productId !== data.productId,
    );

    setRelated(filtered);
  };

  // ================= FORMAT =================
  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN").format(price) + " ₫";

  // 🔥 convert tuổi
  const getAgeGroup = (age) => {
    if (!age) return "Không xác định";

    if (age >= 2 && age <= 10) return "Trẻ em (2-10)";
    if (age >= 11 && age <= 17) return "Thiếu niên (11-17)";
    if (age >= 18 && age <= 34) return "Thanh niên (18-34)";
    if (age >= 35 && age <= 55) return "Trung niên (35-55)";
    if (age > 55) return "Cao tuổi (>55)";
    return "Không xác định";
  };

  // 🔥 convert giới tính
  const getSexLabel = (sex) => {
    if (sex === "MALE") return "Nam";
    if (sex === "FEMALE") return "Nữ";
    if (sex === "UNISEX") return "Unisex";
    return "Không rõ";
  };

  // ================= IMAGES =================
  const images = product ? [product.mainImage, ...(product.image || [])] : [];

  // ================= TRACK INDEX =================
  useEffect(() => {
    currentIndexRef.current = images.findIndex((img) => img === activeImage);
  }, [activeImage, images]);

  // ================= AUTO SLIDE =================
  useEffect(() => {
    if (!product || images.length <= 1) return;

    const interval = setInterval(() => {
      if (isHovering) return;

      const nextIndex = (currentIndexRef.current + 1) % images.length;

      setActiveImage(images[nextIndex]);
      currentIndexRef.current = nextIndex;
    }, 3000);

    return () => clearInterval(interval);
  }, [product, images, isHovering]);

  // ================= ZOOM =================
  const handleZoom = (e) => {
    if (!imgRef.current) return;

    const rect = imgRef.current.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(2)",
    });
  };

  const resetZoom = () => {
    setZoomStyle({
      transformOrigin: "center",
      transform: "scale(1)",
    });
  };

  // ================= CART =================
  const handleAddToCart = async () => {
    if (adding) return; // 🔥 chống spam

    try {
      setAdding(true);

      await cartApi.addToCart(productId, quantity);

      // 🔥 animation
      const btn = document.querySelector(".add");
      btn.classList.add("clicked");

      setTimeout(() => btn.classList.remove("clicked"), 400);

      // 🔥 toast đẹp
      showToast("Đã thêm vào giỏ hàng");
    } catch (err) {
      console.log(err);
      showToast("Bạn cần đăng nhập để thực hiện chức năng này!", "error");
    } finally {
      setAdding(false);
    }
  };

  // ================= LOADING =================
  if (!product) return <div className="loading">Loading...</div>;

  // ================= UI =================
  return (
    <div>
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === "success" ? "🛒" : "❌"} {toast.message}
        </div>
      )}
      <Topbar />
      <Navbar />

      <div className="product-page">
        {/* BREADCRUMB */}
        <div className="breadcrumb">
          HOME / {product.category?.name} / {product.name}
        </div>

        <div className="product-detail">
          {/* LEFT */}
          <div className="left">
            <div
              className="main-image"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => {
                setIsHovering(false);
                resetZoom();
              }}
              onMouseMove={handleZoom}
            >
              <img
                ref={imgRef}
                src={buildImageUrl(activeImage)}
                alt={product.name}
                style={zoomStyle}
              />
            </div>

            <div className="thumbs">
              {images.map((img) => (
                <img
                  key={img}
                  src={buildImageUrl(img)}
                  onClick={() => setActiveImage(img)}
                  className={activeImage === img ? "active" : ""}
                />
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="right">
            <div className="sticky">
              <h1>{product.name}</h1>

              <div className="price">{formatPrice(product.price)}</div>

              {product.quantity === 0 && (
                <div className="soldout">HẾT HÀNG</div>
              )}

              <div className="desc">{product.description}</div>

              {/* 🔥 META PRO */}
              <div className="meta">
                <div className="meta-item">
                  <b>Danh mục:</b> {product.category?.name}
                </div>

                <div className="meta-item">
                  <b>Giới tính:</b> {getSexLabel(product.sex)}
                </div>

                <div className="meta-item">
                  <b>Độ tuổi:</b> {getAgeGroup(product.age)}
                </div>

                <div className="meta-item">
                  <b>Tồn kho:</b> {product.quantity}
                </div>

                {/* 🔥 COLOR HEX */}
                <div className="meta-item">
                  <span>MÀU</span>

                  <div className="color-preview">
                    <div
                      className="color-box"
                      style={{ backgroundColor: product.color || "#000" }}
                      title={product.color} // hover sẽ thấy mã HEX
                    />
                  </div>
                </div>
              </div>

              {/* QUANTITY */}
              <div className="qty">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  -
                </button>

                <span>{quantity}</span>

                <button
                  onClick={() =>
                    setQuantity(Math.min(product.quantity, quantity + 1))
                  }
                >
                  +
                </button>
              </div>

              <button
                className={`add ${adding ? "loading" : ""}`}
                disabled={product.quantity === 0 || adding}
                onClick={handleAddToCart}
              >
                {adding && <span className="spinner"></span>}
                {adding ? "ĐANG THÊM..." : "THÊM VÀO GIỎ"}
              </button>
            </div>
          </div>
        </div>

        {/* RELATED */}
        <div className="related">
          <h3>SẢN PHẨM LIÊN QUAN</h3>

          <div className="grid">
            {related.map((p) => (
              <div
                key={p.productId}
                className="card"
                onClick={() => navigate(`/product/${p.productId}`)}
              >
                {/* IMAGE */}
                <div className="image-wrapper">
                  <img src={buildImageUrl(p.mainImage)} alt={p.name} />
                </div>

                {/* INFO */}
                <div className="info">
                  <div className="name">{p.name}</div>

                  <div className="price">{formatPrice(p.price)}</div>

                  <div className="bottom">
                    {/* COLOR */}
                    {p.color && (
                      <div
                        className="color-box"
                        style={{ "--color": p.color }}
                      />
                    )}

                    {/* CATEGORY */}
                    <div className="category">{p.category?.name || ""}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ProductDetail;
