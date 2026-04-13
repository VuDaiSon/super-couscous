import "./Dashboard.scss";

function Dashboard() {
  return (
    <div className="dashboard">
      <h2>📊 Tổng quan hệ thống</h2>

      <div className="dashboard-grid">
        <div className="card">
          <h3>Sản phẩm</h3>
          <p>120</p>
          <span>Tổng sản phẩm</span>
        </div>

        <div className="card">
          <h3>Đơn hàng</h3>
          <p>58</p>
          <span>Đơn hôm nay</span>
        </div>

        <div className="card">
          <h3>Người dùng</h3>
          <p>320</p>
          <span>Người dùng</span>
        </div>

        <div className="card">
          <h3>Doanh thu</h3>
          <p>12.5M</p>
          <span>VNĐ hôm nay</span>
        </div>
      </div>

      <div className="dashboard-welcome">
        <h3>Chào mừng bạn đến trang quản trị</h3>
        <p>Chọn chức năng bên trái để bắt đầu quản lý hệ thống.</p>
      </div>
    </div>
  );
}

export default Dashboard;
