import { Carousel } from "antd";
import { useState, useRef, useEffect } from "react";
import bannerApi from "../../api/bannerApi";
import productApi from "../../api/productApi";
import "./HomeSlider.scss";
import { useNavigate } from "react-router-dom";
import { buildImageUrl } from "../../utils/image";

const DURATION = 3000;

function HomeSlider() {
  const [active, setActive] = useState(0);
  const [banners, setBanners] = useState([]);
  const [dragging, setDragging] = useState(false); // 🔥 detect drag

  const navigate = useNavigate();
  const carouselRef = useRef();

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await bannerApi.getAll();
      setBanners(res.data || []);
    } catch (err) {
      console.error("Lỗi load banner", err);
    }
  };

  // 🔥 detect drag
  const handleStart = () => setDragging(false);
  const handleMove = () => setDragging(true);

  // 👉 CLICK BANNER
  const handleClickBanner = async (banner) => {
    if (dragging) return; // 🔥 nếu đang kéo thì không click

    const categoryId = banner.category?.categoryId;
    if (!categoryId) return;

    try {
      await productApi.getByCategory(categoryId);
      navigate(`/category/${categoryId}`);
    } catch (err) {
      console.error("Category lỗi", err);
    }
  };

  if (!banners.length) return null;

  return (
    <div className="home-slider">
      <Carousel
        autoplay
        autoplaySpeed={DURATION}
        dots={false}
        ref={carouselRef}
        afterChange={(current) => setActive(current)}
        draggable
        swipeToSlide
        pauseOnHover
        speed={600}
        easing="ease-out"
      >
        {banners.map((b) => (
          <div
            key={b.featuredPostId}
            className="slide"
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
          >
            <img
              src={buildImageUrl(b.url)}
              alt=""
              onClick={() => handleClickBanner(b)}
            />
          </div>
        ))}
      </Carousel>

      {/* PROGRESS */}
      <div className="progress-container">
        {banners.map((_, index) => (
          <div
            key={index}
            className={`progress-item ${active === index ? "active" : ""}`}
            onClick={() => {
              carouselRef.current.goTo(index);
              setActive(index);
            }}
          >
            <div className="progress-bar" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomeSlider;
