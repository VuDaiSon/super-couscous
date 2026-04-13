import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Search from "./pages/Search/Search";
import Category from "./pages/category/Category";
import Products from "./pages/products/Products";
import ProductDetail from "./pages/ProductDetail/ProductDetail";
import Login from "./pages/login/Login";
import Profile from "./pages/profile/Profile";
import Cart from "./pages/cart/Cart";
import Checkout from "./pages/checkout/Checkout";
import OrderList from "./pages/orders/OrderList";
import OrderDetail from "./pages/orders/OrderDetail";
import Register from "./pages/register/Register";
import Admin from "./pages/admin/Admin";
import ResetPassword from "./pages/resetPassword/ResetPassword";
import Contact from "./pages/contact/Contact";

// 🔒 kiểm tra login
const PrivateRoute = ({ children }) => {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    return (
      <Navigate
        to="/login"
        state={{ message: "Bạn cần đăng nhập để tiếp tục!" }}
        replace
      />
    );
  }

  return children;
};
const AdminRoute = ({ children }) => {
  const userId = localStorage.getItem("userId");
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");

  // ❌ chưa login → đá về login
  if (!userId) {
    return (
      <Navigate to="/login" state={{ message: "Bạn cần đăng nhập!" }} replace />
    );
  }

  // ❌ không có quyền → đá về home
  const canAccess = roles.some((role) =>
    [
      "add",
      "update",
      "delete",
      "ORDER_MANAGE",
      "USER_MANAGE",
      "USER_GROUP_MANAGE",
      "ROLE_GROUP_MANAGE",
    ].includes(role),
  );

  if (!canAccess) {
    return <Navigate to="/" replace />;
  }

  return children;
};
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/category/:categoryId" element={<Category />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:productId" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<OrderList />} />
        <Route path="/orders/:orderId" element={<OrderDetail />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />{" "}
        <Route
          path="/cart"
          element={
            <PrivateRoute>
              <Cart />
            </PrivateRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <PrivateRoute>
              <Checkout />
            </PrivateRoute>
          }
        />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
