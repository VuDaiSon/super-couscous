import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import categoryApi from "../../api/categoryApi";
import "./Navbar.scss";

function Navbar() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const location = useLocation(); // 🔥 lấy URL hiện tại

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getAll();
        const list = res.data?.data || [];
        setCategories(list);
      } catch (err) {
        console.log("ERROR:", err);
      }
    };

    fetchCategories();
  }, []);

  // 🔥 check active NEW ARRIVALS
  const isNewArrivals = location.pathname === "/products";

  return (
    <div className="navbar">
      {/* NEW ARRIVALS */}
      <div
        className={`navbar__item highlight ${isNewArrivals ? "active" : ""}`}
        onClick={() => navigate("/products")}
      >
        NEW ARRIVALS
      </div>

      {/* CATEGORY LIST */}
      {categories.map((c) => {
        // 🔥 check active category
        const isActive = location.pathname.includes(
          `/category/${c.categoryId}`,
        );

        return (
          <div
            key={c.categoryId}
            className={`navbar__item ${isActive ? "active" : ""}`}
            onClick={() => navigate(`/category/${c.categoryId}`)}
          >
            {c.name}
          </div>
        );
      })}
    </div>
  );
}

export default Navbar;
