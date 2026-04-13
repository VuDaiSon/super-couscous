import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Topbar from "../../components/Topbar/Topbar"; // 🔥 thêm
import Navbar from "../../components/Navbar/Navbar"; // 🔥 thêm
import orderApi from "../../api/orderApi";
import "./OrderDetail.scss";
import { buildImageUrl } from "../../utils/image";
import Footer from "../../components/footer/Footer";

function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, []);

  const fetchDetail = async () => {
    try {
      const res = await orderApi.getOrderDetail(orderId);
      setData(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi load chi tiết");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Bạn chắc chắn muốn hủy đơn?")) return;

    try {
      await orderApi.cancelOrder(orderId);
      alert("Đã hủy đơn hàng");
      fetchDetail();
    } catch (err) {
      const message = err.response?.data?.message;

      if (message?.includes("48 giờ")) {
        alert("❌ Đơn hàng đã quá 2 ngày, không thể hủy");
      } else {
        alert(message || "Không thể hủy đơn");
      }
    }
  };

  const formatPrice = (value) => value?.toLocaleString("vi-VN") + "đ";

  if (loading)
    return (
      <>
        <Topbar />
        <Navbar />
        <div className="order-detail-loading">Loading...</div>
      </>
    );

  if (!data)
    return (
      <>
        <Topbar />
        <Navbar />
        <div>Không có dữ liệu</div>
      </>
    );

  return (
    <>
      {/* 🔥 THÊM HEADER */}
      <Topbar />
      <Navbar />

      <div className="order-detail-container">
        <h2>Chi tiết đơn hàng</h2>

        {/* USER */}
        <div className="box">
          <h3>Thông tin người nhận</h3>
          <p>
            <b>Tên:</b> {data.user.name}
          </p>
          <p>
            <b>SĐT:</b> {data.user.phone}
          </p>
          <p>
            <b>Email:</b> {data.user.email}
          </p>
          <p>
            <b>Địa chỉ:</b> {data.user.address}
          </p>
        </div>

        {/* PRODUCTS */}
        <div className="box">
          <h3>Sản phẩm</h3>

          {data.cartDetails.map((item) => (
            <div key={item.cartDetailId} className="product-item">
              <img src={buildImageUrl(item.product.mainImage)} alt="" />
              <div className="info">
                <p className="name">{item.product.name}</p>
                <p>Số lượng: {item.quantity}</p>
                <p>{formatPrice(item.product.price)}</p>
              </div>
              <div className="total">
                {formatPrice(item.quantity * item.product.price)}
              </div>
            </div>
          ))}
        </div>

        {/* SUMMARY */}
        <div className="box summary">
          <p>
            Tạm tính:
            <span>{formatPrice(data.subtotal)}</span>
          </p>
          <p>
            Phí ship:
            <span>{formatPrice(data.shippingFee)}</span>
          </p>
          <p className="total">
            Tổng:
            <span>{formatPrice(data.subtotal + data.shippingFee)}</span>
          </p>
        </div>

        {/* ACTION */}
        <div className="actions">
          <button onClick={() => navigate("/orders")}>← Quay lại</button>

          <button className="cancel" onClick={handleCancel}>
            Hủy đơn
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default OrderDetail;
