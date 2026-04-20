import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Topbar from "../../components/Topbar/Topbar";
import Navbar from "../../components/Navbar/Navbar";
import authApi from "../../api/authApi";
import Footer from "../../components/footer/Footer";

import "./Login.scss";

function Login() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };
  const hasShown = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [loginLoading, setLoginLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔥 FORGOT PASSWORD STATE
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (location.state?.message && !hasShown.current) {
      hasShown.current = true;
      alert(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // 🔥 LOGIN
  const handleLogin = async () => {
    if (loginLoading) return; // 🔥 chặn spam

    try {
      setLoginLoading(true);

      const res = await authApi.login(email, password);

      const userId = res.data?.data?.userId;
      const roles = res.data?.data?.roles || [];

      localStorage.setItem("userId", userId);
      localStorage.setItem("roles", JSON.stringify(roles));

      alert("Đăng nhập thành công!");
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Sai email hoặc mật khẩu!";
      alert(msg);
    } finally {
      setLoginLoading(false); // 🔥 mở lại button
    }
  };

  // 🔥 FORGOT PASSWORD
  const handleForgot = async () => {
    try {
      setLoading(true);
      setMessage("");

      await authApi.forgotPassword(forgotEmail);

      setMessage("Đã gửi email! Hãy kiểm tra hộp thư của bạn.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Có lỗi xảy ra, thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Topbar />
      <Navbar />

      <div className="login-page">
        <div className="login-box">
          <h2>LOGIN</h2>

          <input
            type="text"
            placeholder="EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            disabled={loginLoading}
            className={loginLoading ? "loading" : ""}
          >
            {loginLoading && <span className="spinner"></span>}
            LOGIN
          </button>
          <div className="login-actions">
            <span onClick={() => navigate("/register")}>Tạo tài khoản</span>

            <span className="forgot" onClick={() => setShowForgot(true)}>
              Quên mật khẩu?
            </span>
          </div>
        </div>
      </div>

      {/* 🔥 MODAL QUÊN MẬT KHẨU */}
      {showForgot && (
        <div className="forgot-overlay">
          <div className="forgot-box">
            <h3>Quên mật khẩu</h3>

            <input
              type="email"
              placeholder="Nhập email của bạn"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
            />

            {message && <p className="msg">{message}</p>}

            <button onClick={handleForgot} disabled={loading}>
              {loading ? "Đang gửi..." : "Gửi link reset"}
            </button>

            <span className="close" onClick={() => setShowForgot(false)}>
              Đóng
            </span>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default Login;
