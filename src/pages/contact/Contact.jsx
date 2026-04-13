import "./Contact.scss";
import { useNavigate } from "react-router-dom";

function Contact() {
  const navigate = useNavigate();

  return (
    <div className="contact">
      <div className="contact-wrapper">
        {/* LEFT TEXT */}
        <div className="contact-info">
          <h1>Contact</h1>

          <div className="line" />

          <p>
            <span>Name</span> Vũ Đại Sơn
          </p>
          <p>
            <span>Birth</span> 12 / 02 / 2002
          </p>
          <p>
            <span>Phone</span> 0961812002
          </p>

          <p>
            <span>Location</span> 221 Cầu Bây, Hà Nội
          </p>

          <button className="back-btn" onClick={() => navigate("/")}>
            ← Back to Home
          </button>
        </div>

        {/* MAP */}
        <div className="contact-map">
          <iframe
            src="https://www.google.com/maps?q=221%20C%E1%BA%A7u%20B%C3%A2y%2C%20Ph%C3%BAc%20L%E1%BB%A3i%2C%20H%C3%A0%20N%E1%BB%99i&output=embed"
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  );
}

export default Contact;
