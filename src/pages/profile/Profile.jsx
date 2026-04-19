import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar/Topbar";
import Navbar from "../../components/Navbar/Navbar";
import authApi from "../../api/authApi";
import axiosClient from "../../api/axiosClient";
import "./Profile.scss";
import { useNavigate } from "react-router-dom";
import { canAccessAdmin } from "../../utils/permission";
import { buildImageUrl } from "../../utils/image";
import Footer from "../../components/footer/Footer";

function Profile() {
  const [fileName, setFileName] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const isAdmin = canAccessAdmin();

  const [form, setForm] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [password, setPassword] = useState({
    oldPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  // 🔥 ESC đóng modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, []);
  const closeModal = () => {
    setShowPasswordModal(false);
    setPassword({ oldPassword: "", newPassword: "" });
  };

  const fetchProfile = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await authApi.getProfile(userId);

      setUser(res.data);
      setForm(res.data);
      setAvatarPreview(res.data.avatar);
    } catch (err) {
      alert("Bạn chưa đăng nhập!");
    }
  };

  // ================= AVATAR =================
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setAvatarFile(null);
      setAvatarPreview(form.avatar || null);
      setFileName(""); // reset name
      e.target.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      return alert("File phải là ảnh");
    }

    if (avatarPreview && avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setAvatarFile(file);
    setAvatarPreview(previewUrl);
    setFileName(file.name); // 🔥 LƯU TÊN FILE

    e.target.value = ""; // vẫn giữ
  };
  // ================= UPDATE =================
  const handleUpdate = async () => {
    const userId = localStorage.getItem("userId");

    // 🔥 validate trước khi upload
    if (
      !form.name ||
      !form.email ||
      !form.phone ||
      !form.address ||
      !form.age ||
      !form.sex
    ) {
      return alert("Vui lòng nhập đầy đủ thông tin");
    }

    // 🔥 validate email gmail
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(form.email)) {
      return alert("Email phải là gmail");
    }

    let uploadedAvatar = null;
    let avatarUrl = form.avatar;

    try {
      // 🔥 CHỈ upload khi chắc chắn form hợp lệ
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);

        const res = await axiosClient.post("/files/upload", formData);
        avatarUrl = res.data;
        uploadedAvatar = res.data;
      }

      const payload = {
        ...form,
        avatar: avatarUrl,
        age: Number(form.age),
      };

      await authApi.updateProfile(userId, payload);

      alert("Cập nhật thành công!");
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }

      setAvatarFile(null);
      setAvatarPreview(avatarUrl);

      setForm({
        ...form,
        avatar: avatarUrl,
      });
    } catch (err) {
      console.log(err);
      alert("Cập nhật thất bại");

      // 🔥 rollback ảnh NGAY LẬP TỨC
      if (uploadedAvatar) {
        try {
          await axiosClient.delete(
            `/files?url=${encodeURIComponent(uploadedAvatar)}`,
          );
        } catch (e) {
          console.log("Không xóa được ảnh rác");
        }
      }
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }

      setAvatarPreview(form.avatar);
      setAvatarFile(null);
    }
  };

  const handleChangePassword = async () => {
    try {
      const userId = localStorage.getItem("userId");
      await authApi.changePassword(userId, password);
      alert("Đổi mật khẩu thành công!");
      closeModal();
    } catch (err) {
      alert("Sai mật khẩu cũ!");
    }
  };

  const handleLogout = async () => {
    await authApi.logout();
    localStorage.clear();
    window.location.href = "/";
  };

  if (!user) return <div className="profile-loading">Loading...</div>;

  return (
    <div>
      <Topbar />
      <Navbar />

      <div className="profile-page">
        <h2>My Account</h2>

        <div className="quick-actions">
          <button onClick={() => navigate("/orders")}>
            📦 Xem đơn hàng của tôi
          </button>

          {isAdmin && (
            <button className="admin-btn" onClick={() => navigate("/admin")}>
              ⚙️ Trang quản lý
            </button>
          )}
        </div>

        {/* PROFILE */}
        <div className="card">
          <h3>Thông tin cá nhân</h3>

          <div className="avatar-box">
            <img
              src={
                avatarPreview
                  ? avatarPreview.startsWith("blob:")
                    ? avatarPreview
                    : buildImageUrl(avatarPreview)
                  : "/images/default-avatar.jpg"
              }
              alt="avatar"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/images/default-avatar.jpg";
              }}
            />

            <input type="file" onChange={handleAvatarChange} />

            {fileName && <div className="file-name">📁 {fileName}</div>}
            <div className="hint">📏 Khuyến nghị: 1:1 (500x500px)</div>
          </div>

          <div className="form-group">
            <label>Tên</label>
            <input
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              value={form.phone || ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Địa chỉ</label>
            <input
              value={form.address || ""}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              value={form.email || ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Tuổi</label>
            <input
              type="number"
              value={form.age || ""}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Giới tính</label>
            <select
              value={form.sex || ""}
              onChange={(e) => setForm({ ...form, sex: e.target.value })}
            >
              <option value="">-- chọn --</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="UNISEX">Unisex</option>
            </select>
          </div>
          <button className="btn primary" onClick={handleUpdate}>
            Cập nhật
          </button>
        </div>

        {/* 🔥 PASSWORD BUTTON */}
        <div className="card">
          <h3>Bảo mật</h3>

          <button
            className="btn primary"
            onClick={() => setShowPasswordModal(true)}
          >
            🔒 Đổi mật khẩu
          </button>
        </div>

        <button className="btn logout" onClick={handleLogout}>
          Đăng xuất
        </button>
      </div>

      {/* 🔥 MODAL */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>🔐 Đổi mật khẩu</h3>

            <div className="form-group">
              <label>Mật khẩu cũ</label>
              <input
                type="password"
                onChange={(e) =>
                  setPassword({
                    ...password,
                    oldPassword: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Mật khẩu mới</label>
              <input
                type="password"
                onChange={(e) =>
                  setPassword({
                    ...password,
                    newPassword: e.target.value,
                  })
                }
              />
            </div>

            <div className="modal-actions">
              <button className="btn primary" onClick={handleChangePassword}>
                Xác nhận
              </button>

              <button className="btn cancel" onClick={closeModal}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default Profile;
