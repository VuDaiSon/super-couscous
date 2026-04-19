import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar/Topbar";
import Navbar from "../../components/Navbar/Navbar";
import authApi from "../../api/authApi";
import "./Profile.scss";
import { useNavigate } from "react-router-dom";
import { canAccessAdmin } from "../../utils/permission";
import { buildImageUrl } from "../../utils/image";
import Footer from "../../components/footer/Footer";
import axios from "axios";

const CLOUD_NAME = "dxohrnltp";
const UPLOAD_PRESET = "upload_public";

function Profile() {
  const [fileName, setFileName] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const isAdmin = canAccessAdmin();

  const [form, setForm] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [loading, setLoading] = useState(false); // 🔥 NEW

  const [password, setPassword] = useState({
    oldPassword: "",
    newPassword: "",
  });

  // ===== CLOUDINARY =====
  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);
    data.append("folder", "users"); // 🔥 IMPORTANT

    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      data,
    );

    return res.data.secure_url;
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") closeModal();
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
      setFileName("");
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
    setFileName(file.name);

    e.target.value = "";
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    if (loading) return; // 🔥 chống spam

    const userId = localStorage.getItem("userId");

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

    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(form.email)) {
      return alert("Email phải là gmail");
    }

    let uploadedAvatar = null;
    let avatarUrl = form.avatar;

    try {
      setLoading(true);

      // 🔥 upload avatar
      if (avatarFile) {
        avatarUrl = await uploadToCloudinary(avatarFile);
        uploadedAvatar = avatarUrl;
      }

      const payload = {
        ...form,
        avatar: avatarUrl,
        age: Number(form.age),
      };

      await authApi.updateProfile(userId, payload);

      alert("Cập nhật thành công!");

      // 🔥 cleanup preview
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

      // 🔥 rollback ảnh nếu lỗi
      if (uploadedAvatar) {
        try {
          await fetch(`/files?url=${encodeURIComponent(uploadedAvatar)}`, {
            method: "DELETE",
          });
        } catch (e) {
          console.log("Không xóa được ảnh rác");
        }
      }

      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }

      setAvatarPreview(form.avatar);
      setAvatarFile(null);
    } finally {
      setLoading(false);
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
            />

            <input type="file" onChange={handleAvatarChange} />

            {fileName && <div className="file-name">📁 {fileName}</div>}
            <div className="hint">📏 Khuyến nghị: 1:1</div>
          </div>

          <div className="form-group">
            <label>Tên</label>
            <input
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>SĐT</label>
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

          <button
            className="btn primary"
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? "Đang cập nhật..." : "Cập nhật"}
          </button>
        </div>

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

      {showPasswordModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>🔐 Đổi mật khẩu</h3>

            <input
              type="password"
              placeholder="Mật khẩu cũ"
              onChange={(e) =>
                setPassword({ ...password, oldPassword: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Mật khẩu mới"
              onChange={(e) =>
                setPassword({ ...password, newPassword: e.target.value })
              }
            />

            <button onClick={handleChangePassword}>Xác nhận</button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Profile;
