import Topbar from "../components/Topbar/Topbar";
import Navbar from "../components/Navbar/Navbar";
import HomeSlider from "../components/HomeSlider/HomeSlider";
import NewProducts from "../components/NewProducts/NewProducts";
import Footer from "../components/footer/Footer";
function Home() {
  return (
    <div>
      <Topbar />
      <Navbar />
      <HomeSlider />
      <NewProducts />
      <Footer />
    </div>
  );
}

export default Home;
