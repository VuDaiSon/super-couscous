import "./Footer.scss";
import { FacebookOutlined, InstagramOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      {/* 🔥 TOP */}
      <div className="footer-top">
        <div className="footer-col">
          <h4>MENU</h4>

          <p onClick={() => navigate("/")}>Home</p>
          <p onClick={() => navigate("/products")}>Shop</p>
          <p onClick={() => navigate("/contact")}>Contact</p>
        </div>

        <div className="footer-col">
          <h4>FOLLOW US</h4>

          <div className="social">
            <a href="https://www.facebook.com/SayLessDoM0re" target="_blank">
              <FacebookOutlined />
            </a>

            <a href="https://www.instagram.com/68vds/" target="_blank">
              <InstagramOutlined />
            </a>
          </div>
        </div>

        {/* 🔥 NEWSLETTER */}
        <div className="footer-col">
          <h4>NEWSLETTER</h4>

          <p className="email">vudaison1222002@gmail.com</p>

          <div className="newsletter">
            <input placeholder="Enter your email..." />
            <button>Subscribe</button>
          </div>
        </div>
      </div>

      {/* 🔥 FADE DIVIDER */}
      <div className="divider" />

      {/* 🔥 BOTTOM */}
      <div className="footer-bottom">
        <div className="copyright">© 2025 THE SHOP</div>

        <div className="brand">
          <div className="main">THE SHOP</div>
          <div className="sub">VOO DY SERN</div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
