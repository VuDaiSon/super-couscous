import { useEffect, useState } from "react";
import orderApi from "../../../api/orderApi";

function OrderAdmin() {
  const [orders, setOrders] = useState([]);
  const [mode, setMode] = useState("list");
  const [selected, setSelected] = useState(null);

  const [statuses, setStatuses] = useState([]);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [form, setForm] = useState({
    status: "",
  });

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  // ================= LIST =================
  const fetchOrders = async (page) => {
    try {
      const res = await orderApi.admin.getAll(page);
      const data = res.data;

      setOrders(data?.data || []);
      setTotalPages(data?.totalPage || 1);
    } catch (err) {
      console.log(err);
      alert("Không tải được danh sách đơn");
    }
  };

  // ================= SELECT =================
  const handleSelect = async (id) => {
    try {
      const res = await orderApi.admin.getDetail(id);

      const order = res.data?.order;
      const statuses = res.data?.orderStatuses; // ✅ FIX KEY

      setSelected(order);
      setStatuses(statuses || []);

      setForm({
        status: order?.status || "",
      });

      setMode("edit");
    } catch (err) {
      console.log(err);
      alert("Không load được chi tiết đơn");
    }
  };

  // ================= UPDATE =================
  const handleSubmit = async () => {
    try {
      const updated = {
        orderId: selected.orderId,
        status: form.status,
        address: selected.address,
        number: selected.number,
        receiver: selected.receiver,
        paymentMethod: selected.paymentMethod,
        totalValue: selected.totalValue,
        shippingFee: selected.shippingFee,
      };

      await orderApi.admin.update(selected.orderId, updated);

      alert("Cập nhật thành công");

      setMode("list");
      fetchOrders(page);
    } catch (err) {
      console.log(err);
      alert("Cập nhật thất bại");
    }
  };

  // ================= LIST VIEW =================
  if (mode === "list") {
    return (
      <div className="card">
        <h2>📦 Quản lý đơn hàng</h2>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Người nhận</th>
              <th>SĐT</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => (
              <tr key={o.orderId}>
                <td>{o.orderId.slice(0, 8)}...</td>
                <td>{o.receiver}</td>
                <td>{o.number}</td>
                <td>{o.totalValue}</td>
                <td>{o.status}</td>

                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleSelect(o.orderId)}
                  >
                    Chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div style={{ marginTop: 20 }}>
          {/* PAGINATION */}
          <div className="pagination">
            <button
              className="nav-btn"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              ◀
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`page-number ${page === i ? "active" : ""}`}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="nav-btn"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              ▶
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= EDIT VIEW =================
  return (
    <div className="card">
      <h2>📋 Chi tiết đơn hàng</h2>

      <div className="form-grid">
        <div className="form-group">
          <label>Mã đơn</label>
          <input value={selected?.orderId || ""} disabled />
        </div>

        <div className="form-group">
          <label>Người nhận</label>
          <input value={selected?.receiver || ""} disabled />
        </div>

        <div className="form-group">
          <label>SĐT</label>
          <input value={selected?.number || ""} disabled />
        </div>

        <div className="form-group">
          <label>Địa chỉ</label>
          <input value={selected?.address || ""} disabled />
        </div>

        <div className="form-group">
          <label>Tổng tiền</label>
          <input value={selected?.totalValue || ""} disabled />
        </div>

        <div className="form-group">
          <label>Phí ship</label>
          <input value={selected?.shippingFee || ""} disabled />
        </div>

        <div className="form-group">
          <label>Phương thức thanh toán</label>
          <input value={selected?.paymentMethod || ""} disabled />
        </div>

        <div className="form-group">
          <label>Trạng thái</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ================= PRODUCTS ================= */}
      <h3 style={{ marginTop: 25 }}>🛒 Sản phẩm</h3>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Ảnh</th>
            <th>Tên</th>
            <th>Số lượng</th>
            <th>Giá</th>
          </tr>
        </thead>
        <tbody>
          {selected?.cart?.cartDetails?.map((c) => (
            <tr key={c.cartDetailId}>
              <td>
                <img src={c.product.image} width="50" alt="" />
              </td>
              <td>{c.product.name}</td>
              <td>{c.quantity}</td>
              <td>{c.product.price}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 20 }}>
        <button className="btn btn-primary" onClick={handleSubmit}>
          Cập nhật
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

export default OrderAdmin;
