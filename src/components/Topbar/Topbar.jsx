import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  SearchOutlined,
  UserOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { Drawer } from "antd";
import categoryApi from "../../api/categoryApi";
import authApi from "../../api/authApi";
import "./Topbar.scss";

function Topbar() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  const [country, setCountry] = useState("VN"); // ✅ default safe

  const handleSearch = () => {
    if (!keyword.trim()) return;
    navigate(`/search?keyword=${keyword}`);
  };

  // ✅ DETECT COUNTRY (production safe + cache)
  useEffect(() => {
    const cached = localStorage.getItem("country");

    if (cached) {
      setCountry(cached);
      return;
    }

    fetch("https://ipapi.co/json")
      .then((res) => res.json())
      .then((data) => {
        const code = data?.country_code || "VN";
        setCountry(code);
        localStorage.setItem("country", code); // cache
      })
      .catch(() => {
        setCountry("VN");
      });
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getAll();
        setCategories(res.data.data || []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchCategories();
  }, []);

  const handleUserClick = async () => {
    try {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        navigate("/login");
        return;
      }

      await authApi.getProfile(userId);
      navigate("/profile");
    } catch {
      localStorage.removeItem("userId");
      navigate("/login");
    }
  };

  const countryCode = (country || "VN").toLowerCase(); // ✅ anti crash

  return (
    <>
      <div className="topbar">
        {/* MENU BUTTON */}
        <div
          className={`menu-btn ${open ? "active" : ""}`}
          onClick={() => setOpen(!open)}
        >
          <span></span>
          <span></span>
        </div>

        {/* LOGO */}
        <div className="topbar__logo" onClick={() => navigate("/")}>
          <div className="main">THE SHOP</div>
          <div className="sub">VU DAI SON</div>
        </div>

        {/* RIGHT */}
        <div className="topbar__right">
          {/* 🌍 FLAG */}
          <div className="country">
            <img
              src={`https://flagcdn.com/w40/${countryCode}.png`}
              alt={countryCode}
              onError={(e) => {
                e.target.src = "https://flagcdn.com/w40/vn.png";
              }}
            />
            <span>{country}</span>
          </div>

          <SearchOutlined
            className="topbar__icon"
            onClick={() => setSearchOpen(!searchOpen)}
          />

          <UserOutlined className="topbar__icon" onClick={handleUserClick} />

          <ShoppingCartOutlined
            className="topbar__icon"
            onClick={() => navigate("/cart")}
          />
        </div>
      </div>

      {/* SEARCH */}
      {searchOpen && (
        <>
          <div
            className="search-overlay"
            onClick={() => setSearchOpen(false)}
          />
          <div className="search-panel">
            <input
              type="text"
              placeholder="SEARCH..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
            <SearchOutlined onClick={handleSearch} />
          </div>
        </>
      )}

      {/* DRAWER */}
      <Drawer
        title="Danh mục"
        placement="left"
        onClose={() => setOpen(false)}
        open={open}
      >
        {categories.length === 0 ? (
          <div>Loading...</div>
        ) : (
          categories.map((c) => (
            <div
              key={c.categoryId}
              className="category-item"
              onClick={() => {
                navigate(`/category/${c.categoryId}`);
                setOpen(false);
              }}
            >
              {c.name}
            </div>
          ))
        )}
      </Drawer>
    </>
  );
}

export default Topbar;
