import { useEffect, useState } from "react";
import { buildImageUrl } from "../../utils/image";
import { useNavigate } from "react-router-dom";
import productApi from "../../api/productApi";
import "./NewProducts.scss";

function NewProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productApi.getAll();
      setProducts(res.data?.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return "LIÊN HỆ";
    return new Intl.NumberFormat("vi-VN").format(price) + " ₫";
  };

  return (
    <div className="new-products">
      <h2 className="title">NEW ARRIVALS</h2>

      <div className="grid">
        {loading
          ? Array(10)
              .fill(0)
              .map((_, i) => <div className="card skeleton" key={i} />)
          : products.map((p) => (
              <div
                key={p.productId}
                className="card fade-in"
                onClick={() => navigate(`/product/${p.productId}`)}
              >
                {/* 🔥 NEW (KHÔNG ĐÈ ẢNH) */}
                <div className="badge">NEW</div>

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
                    {p.color && (
                      <div
                        className="color-box"
                        style={{ "--color": p.color }}
                      />
                    )}

                    <div className="category">{p.category?.name || ""}</div>
                  </div>
                </div>
              </div>
            ))}
      </div>
      {/* 🔥 VIEW MORE */}
      <div className="view-more" onClick={() => navigate("/products")}>
        VIEW MORE
      </div>
    </div>
  );
}

export default NewProducts;
