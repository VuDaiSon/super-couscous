import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/Topbar/Topbar";
import Navbar from "../../components/Navbar/Navbar";
import orderApi from "../../api/orderApi";
import "./OrderList.scss";
import Footer from "../../components/footer/Footer";

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]); // 🔥 lưu full list
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loaderRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders(0, true);
  }, []);

  useEffect(() => {
    applyFilter();
  }, [statusFilter, allOrders]);

  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        fetchOrders(page);
      }
    });

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [page, hasMore, loading]);

  const fetchOrders = async (pageNumber = 0, isReset = false) => {
    try {
      if (isReset) setLoading(true);

      const res = await orderApi.getOrders({
        page: pageNumber,
        size: 5,
      });

      const data = res.data.data || [];

      const newList = isReset ? data : [...allOrders, ...data];

      setAllOrders(newList);
      setPage(pageNumber + 1);

      if (data.length < 5) setHasMore(false);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FILTER LOCAL (chuẩn 100%)
  const applyFilter = () => {
    if (statusFilter === "ALL") {
      setOrders(allOrders);
    } else {
      setOrders(allOrders.filter((o) => o.status === statusFilter));
    }
  };

  const formatPrice = (value) => value?.toLocaleString("vi-VN") + "đ";

  const getStatusClass = (status) => {
    if (status === "Chờ xác nhận") return "status pending";
    if (status === "Đã nhận hàng") return "status success";
    if (status === "Đã hủy") return "status cancel";
    return "status shipping";
  };

  const statusTabs = [
    "ALL",
    "Chờ xác nhận",
    "Đã xác nhận",
    "Đang đóng gói",
    "Đã bàn giao cho đơn vị vân chuyển",
    "Đang giao hàng",
    "Đã nhận hàng",
    "Đã hủy",
  ];

  return (
    <>
      <Topbar />
      <Navbar />

      <div className="order-container">
        <h2>Đơn hàng của tôi</h2>

        {/* FILTER */}
        <div className="filter-tabs">
          {statusTabs.map((s) => (
            <button
              key={s}
              className={statusFilter === s ? "active" : ""}
              onClick={() => setStatusFilter(s)}
            >
              {s === "ALL" ? "Tất cả" : s}
            </button>
          ))}
        </div>

        {/* SKELETON */}
        {loading && allOrders.length === 0 && (
          <div className="skeleton-list">
            {[...Array(3)].map((_, i) => (
              <div className="skeleton-card" key={i}></div>
            ))}
          </div>
        )}

        {/* LIST */}
        {orders.map((order) => (
          <div
            key={order.orderId}
            className="order-card"
            onClick={() => navigate(`/orders/${order.orderId}`)}
          >
            <div className="order-header">
              <span className="order-id">#{order.orderId}</span>
              <span className={getStatusClass(order.status)}>
                {order.status}
              </span>
            </div>

            <div className="order-body">
              <div className="left">
                <p>
                  <b>Người nhận:</b> {order.receiver}
                </p>
                <p>
                  <b>SĐT:</b> {order.number}
                </p>
                <p>
                  <b>Địa chỉ:</b> {order.address}
                </p>
              </div>

              <div className="right">
                <p className="total">{formatPrice(order.totalValue)}</p>
                <p className="date">{order.date}</p>
              </div>
            </div>
          </div>
        ))}

        {hasMore && (
          <div ref={loaderRef} className="loading-more">
            Loading...
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default OrderList;
