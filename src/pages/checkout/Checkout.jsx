import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import orderApi from "../../api/orderApi";
import { ShoppingOutlined } from "@ant-design/icons";
import "./Checkout.scss";
import { buildImageUrl } from "../../utils/image";
import Footer from "../../components/footer/Footer";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [data] = useState(location.state || null);

  const [form, setForm] = useState({
    receiver: data?.user?.name || "",
    number: data?.user?.phone || "",
    address: data?.user?.address || "",
    paymentMethod: "",
  });

  const [error, setError] = useState("");

  if (!data) {
    return <div>Không có dữ liệu checkout</div>;
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    if (!form.receiver) return "Vui lòng nhập tên người nhận";
    if (!form.number) return "Vui lòng nhập số điện thoại";
    if (!form.address) return "Vui lòng nhập địa chỉ";
    if (!form.paymentMethod) return "Vui lòng chọn phương thức thanh toán";
    return "";
  };

  const handleConfirm = async () => {
    const errMsg = validate();
    if (errMsg) {
      setError(errMsg);
      return;
    }

    try {
      await orderApi.confirm({
        cartId: data.cart.cartId,
        userId: data.user.userId,
        totalValue: data.subtotal,
        shippingFee: data.shippingFee,
        receiver: form.receiver,
        number: form.number,
        address: form.address,
        paymentMethod: form.paymentMethod,
      });

      alert("Đặt hàng thành công!");
      navigate("/orders");
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <>
      {/* 🔥 TOPBAR CUSTOM */}
      <div className="checkout-topbar">
        <div className="logo" onClick={() => navigate("/")}>
          <div className="main">THE SHOP</div>
          <div className="sub">VOO DY SERN</div>
        </div>

        {/* 👜 ICON CUSTOM */}
        <div className="bag-icon" onClick={() => navigate("/cart")}>
          <ShoppingOutlined />
        </div>
      </div>

      {/* 🔥 CONTENT */}
      <div className="checkout-container">
        <h2>CHECKOUT</h2>

        {error && <div className="error">{error}</div>}

        {/* 🔥 PRODUCTS */}
        <div className="products">
          <h3>Products</h3>

          {data.cartDetails.map((item) => (
            <div key={item.cartDetailId} className="product-item">
              <div className="image-wrapper">
                <img src={buildImageUrl(item.product.mainImage)} alt="" />

                {/* 🔥 BADGE */}
                <div className="quantity-badge">{item.quantity}</div>
              </div>

              <div className="info">
                <p className="name">{item.product.name}</p>
                <p className="price">
                  {item.totalAmount.toLocaleString("vi-VN")}đ{" "}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 🔥 FORM */}
        <div className="form">
          <input
            name="receiver"
            value={form.receiver}
            placeholder="Tên người nhận"
            onChange={handleChange}
          />

          <input
            name="number"
            value={form.number}
            placeholder="Số điện thoại"
            onChange={handleChange}
          />

          <input
            name="address"
            value={form.address}
            placeholder="Địa chỉ"
            onChange={handleChange}
          />

          <select name="paymentMethod" onChange={handleChange}>
            <option value="">Chọn phương thức</option>
            <option value="COD">Thanh toán khi nhận hàng</option>
            <option value="BANK">Chuyển khoản</option>
          </select>
        </div>

        {/* 🔥 QR */}
        {form.paymentMethod === "BANK" && (
          <div className="qr">
            <p>Quét mã QR để thanh toán</p>
            <img src="/qr-demo.png" alt="QR Code" />
          </div>
        )}

        {/* 🔥 SUMMARY */}
        <div className="summary">
          <p>
            Tạm tính:
            <span>{data.subtotal.toLocaleString("vi-VN")}đ</span>
          </p>
          <p>
            Phí ship:
            <span>{data.shippingFee.toLocaleString("vi-VN")}đ</span>
          </p>
          <h3>
            Tổng:
            <span>
              {(data.subtotal + data.shippingFee).toLocaleString("vi-VN")}đ
            </span>
          </h3>
        </div>

        <button className="confirm-btn" onClick={handleConfirm}>
          CONFIRM ORDER
        </button>
      </div>
      <Footer />
    </>
  );
}

export default Checkout;
