import ProductAdmin from "../sections/ProductAdmin";
import CategoryAdmin from "../sections/CategoryAdmin";
import OrderAdmin from "../sections/OrderAdmin";
import UserAdmin from "../sections/UserAdmin";
import UserGroupAdmin from "../sections/UserGroupAdmin";
import RoleGroupAdmin from "../sections/RoleGroupAdmin";
import DashboardAdmin from "../sections/DashboardAdmin";
import RoleAdmin from "../sections/RoleAdmin";
import FeaturedPostAdmin from "../sections/FeaturedPostAdmin";

function Content({ tab }) {
  let content;

  switch (tab) {
    case "dashboard":
      content = <DashboardAdmin />;
      break;

    case "product":
      content = <ProductAdmin />;
      break;

    case "category":
      content = <CategoryAdmin />;
      break;

    case "order":
      content = <OrderAdmin />;
      break;

    case "user":
      content = <UserAdmin />;
      break;

    case "userGroup":
      content = <UserGroupAdmin />;
      break;

    case "roleGroup":
      content = <RoleGroupAdmin />;
      break;
    case "role":
      content = <RoleAdmin />;
      break;
    case "banner":
      content = <FeaturedPostAdmin />;
      break;
    default:
      content = <div>Chọn chức năng</div>;
  }

  return <div className="admin-content">{content}</div>;
}
export default Content;
