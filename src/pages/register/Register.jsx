import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/Topbar/Topbar";
import Navbar from "../../components/Navbar/Navbar";
import authApi from "../../api/authApi";
import "./Register.scss";
import Footer from "../../components/footer/Footer";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    age: "",
    sex: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  // 🔥 VALIDATE CHUẨN BACKEND
  const validate = () => {
    if (!form.name) return "Vui lòng nhập tên";
    if (!form.email) return "Vui lòng nhập email";

    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(form.email)) {
      return "Email phải là Gmail hợp lệ";
    }

    if (!form.password || form.password.length < 6) {
      return "Mật khẩu tối thiểu 6 ký tự";
    }

    if (!form.phone) return "Vui lòng nhập số điện thoại";
    if (!form.address) return "Vui lòng nhập địa chỉ";

    if (!form.age || form.age <= 0) {
      return "Tuổi không hợp lệ";
    }

    if (!form.sex) return "Vui lòng chọn giới tính";

    return null;
  };

  const handleRegister = async () => {
    const error = validate();
    if (error) {
      alert(error);
      return;
    }

    try {
      setLoading(true);

      await authApi.register({
        ...form,
        age: Number(form.age),
      });

      alert("Đăng ký thành công!");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi đăng ký");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Topbar />
      <Navbar />

      <div className="register-page">
        <div className="register-box">
          <h2>REGISTER</h2>

          <input
            placeholder="Tên"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />

          <input
            placeholder="Email (gmail)"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />

          <input
            type="password"
            placeholder="Mật khẩu"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
          />

          <input
            placeholder="Số điện thoại"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />

          <input
            placeholder="Địa chỉ"
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
          />

          <input
            type="number"
            placeholder="Tuổi"
            value={form.age}
            onChange={(e) => handleChange("age", e.target.value)}
          />

          {/* 🔥 SEX SELECT */}
          <select
            value={form.sex}
            onChange={(e) => handleChange("sex", e.target.value)}
          >
            <option value="">Chọn giới tính</option>
            <option value="MALE">Nam</option>
            <option value="FEMALE">Nữ</option>
            <option value="UNISEX">Khác</option>
          </select>

          <button onClick={handleRegister} disabled={loading}>
            {loading ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ"}
          </button>

          <div className="switch">
            Đã có tài khoản?{" "}
            <span onClick={() => navigate("/login")}>Đăng nhập</span>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Register;
