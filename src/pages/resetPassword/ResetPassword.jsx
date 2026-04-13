import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import authApi from "../../api/authApi";
import "./ResetPassword.scss";

function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = async () => {
    if (!password || !confirm) {
      return alert("Vui lòng nhập đầy đủ");
    }

    if (password !== confirm) {
      return alert("Mật khẩu không khớp");
    }

    try {
      await authApi.resetPassword(token, password);

      navigate("/login", {
        state: { message: "Bạn đã đổi mật khẩu thành công" },
      });
    } catch (err) {
      const msg =
        err.response?.data?.message || "Token không hợp lệ hoặc đã hết hạn";

      alert(msg);
    }
  };

  return (
    <div className="reset-page">
      <div className="reset-box">
        <h2>RESET PASSWORD</h2>

        <input
          type="password"
          placeholder="NEW PASSWORD"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="CONFIRM PASSWORD"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <button onClick={handleSubmit}>RESET</button>
      </div>
    </div>
  );
}

export default ResetPassword;
