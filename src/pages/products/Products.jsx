import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/Topbar/Topbar";
import Navbar from "../../components/Navbar/Navbar";
import productApi from "../../api/productApi";
import "./Products.scss";
import { buildImageUrl } from "../../utils/image";
import Footer from "../../components/footer/Footer";

function Products() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const [sortBy, setSortBy] = useState("date");
  const [sortDirection, setSortDirection] = useState("DESC");

  useEffect(() => {
    fetchProducts();
  }, [page, sortBy, sortDirection]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productApi.getAll(page, sortBy, sortDirection);
      const data = res.data;

      setProducts(data.data || []);
      setTotalPage(data.totalPage || 1);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const isNew = (date) => {
    if (!date) return false;
    const diff = new Date() - new Date(date);
    return diff <= 7 * 24 * 60 * 60 * 1000;
  };

  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN").format(price) + " ₫";
  };

  return (
    <div>
      <Topbar />
      <Navbar />

      <div className="products-page">
        {/* HEADER */}
        <div className="header">
          <div className="title">NEW ARRIVALS</div>

          <div className="sort">
            <span
              className={sortBy === "date" ? "active" : ""}
              onClick={() => {
                setSortBy("date");
                setSortDirection("DESC");
                setPage(0);
              }}
            >
              NEWEST
            </span>

            <span
              className={
                sortBy === "price" && sortDirection === "DESC" ? "active" : ""
              }
              onClick={() => {
                setSortBy("price");
                setSortDirection("DESC");
                setPage(0);
              }}
            >
              PRICE ↓
            </span>

            <span
              className={
                sortBy === "price" && sortDirection === "ASC" ? "active" : ""
              }
              onClick={() => {
                setSortBy("price");
                setSortDirection("ASC");
                setPage(0);
              }}
            >
              PRICE ↑
            </span>
          </div>
        </div>

        {/* GRID */}
        <div className="grid">
          {loading ? (
            Array(10)
              .fill(0)
              .map((_, i) => <div className="card skeleton" key={i}></div>)
          ) : products.length === 0 ? (
            <div className="empty">Không có sản phẩm</div>
          ) : (
            products.map((p) => (
              <div
                key={p.productId}
                className="card fade-in"
                onClick={() => navigate(`/product/${p.productId}`)}
              >
                {/* NEW */}
                {isNew(p.date) && <div className="badge">NEW</div>}

                {/* IMAGE */}
                <div className="image-wrapper">
                  <img
                    src={buildImageUrl(p.mainImage)}
                    alt={p.name}
                    loading="lazy"
                    onError={(e) => (e.target.src = "/images/no-image.png")}
                  />
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
            ))
          )}
        </div>

        {/* PAGINATION */}
        <div className="pagination">
          {Array.from({ length: totalPage }).map((_, i) => (
            <span
              key={i}
              className={page === i ? "active" : ""}
              onClick={() => setPage(i)}
            >
              {i + 1}
            </span>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Products;
