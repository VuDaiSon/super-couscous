import { useEffect, useState } from "react";
import cartApi from "../../api/cartApi";
import orderApi from "../../api/orderApi";
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/Topbar/Topbar";
import Navbar from "../../components/Navbar/Navbar";
import "./Cart.scss";
import { buildImageUrl } from "../../utils/image";
import Footer from "../../components/footer/Footer";

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await cartApi.getCart();
      setCart(res.data || { cartDetails: [] });
    } catch (err) {
      console.log(err);
      setCart({ cartDetails: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleIncrease = async (id) => {
    await cartApi.updateCart(id, 1);
    fetchCart();
  };

  const handleDecrease = async (id) => {
    await cartApi.updateCart(id, -1);
    fetchCart();
  };

  const handleDelete = async (id) => {
    await cartApi.deleteCart(id);
    fetchCart();
  };

  const handleCheckout = async () => {
    try {
      setLoadingCheckout(true);
      const res = await orderApi.checkout();
      const checkoutData = res.data.data;
      navigate("/checkout", { state: checkoutData });
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi checkout");
    } finally {
      setLoadingCheckout(false);
    }
  };

  // ✅ FORMAT TIỀN
  const formatPrice = (value) => {
    return value?.toLocaleString("vi-VN") + "đ";
  };

  // ✅ LOGIC SHIPPING GIỐNG BE
  const calculateShippingFee = (totalValue) => {
    if (totalValue < 3000000) return 15000;
    else if (totalValue < 5000000) return 20000;
    else if (totalValue < 7500000) return 30000;
    else return 0;
  };

  if (loading) return <div className="cart-loading">Loading...</div>;

  // ✅ SUBTOTAL
  const subtotal =
    cart?.cartDetails?.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    ) || 0;

  // ✅ SHIPPING (tự tính FE)
  const shipping = subtotal > 0 ? calculateShippingFee(subtotal) : 0;

  // ✅ TOTAL
  const total = subtotal + shipping;

  return (
    <div>
      <Topbar />
      <Navbar />

      {/* HEADER */}
      <div className="cart-header">
        <h1>VOO DY SERN - CART</h1>
      </div>

      <div className="cart-container">
        {/* LEFT */}
        <div className="cart-left">
          {!cart?.cartDetails?.length ? (
            <p className="empty">🛒 Giỏ hàng trống</p>
          ) : (
            cart.cartDetails.map((item) => (
              <div key={item.cartDetailId} className="cart-item">
                <img
                  src={buildImageUrl(item.product.mainImage)}
                  alt={item.product.name}
                  className="cart-image"
                />

                <div className="cart-info">
                  <h4>{item.product.name}</h4>

                  <p className="price">{formatPrice(item.product.price)}</p>

                  <p className="total">
                    Tổng: {formatPrice(item.product.price * item.quantity)}
                  </p>

                  <div className="quantity">
                    <button onClick={() => handleDecrease(item.cartDetailId)}>
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button onClick={() => handleIncrease(item.cartDetailId)}>
                      +
                    </button>
                  </div>
                </div>

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(item.cartDetailId)}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* RIGHT */}
        <div className="cart-right">
          <h3>ORDER SUMMARY</h3>

          <div className="row">
            <span>Tạm tính</span>
            <b>{formatPrice(subtotal)}</b>
          </div>

          <div className="row">
            <span>Phí vận chuyển</span>
            <b>{formatPrice(shipping)}</b>
          </div>

          <hr />

          <div className="row total">
            <span>Tổng</span>
            <b>{formatPrice(total)}</b>
          </div>

          <button
            className="checkout-btn"
            onClick={handleCheckout}
            disabled={loadingCheckout || !cart?.cartDetails?.length}
          >
            {loadingCheckout ? "PROCESSING..." : "CHECKOUT"}
          </button>

          <button className="continue-btn" onClick={() => navigate("/")}>
            ← CONTINUE SHOPPING
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Cart;
