import { useState } from "react";
import Topbar from "../../components/Topbar/Topbar";
import Content from "./components/Content";
import Sidebar from "./components/Sidebar";

import "./Admin.scss";

function Admin() {
  const [tab, setTab] = useState("dashboard");
  return (
    <div>
      <Topbar />

      <div className="admin-layout">
        <Sidebar tab={tab} setTab={setTab} />
        <Content tab={tab} />
      </div>
    </div>
  );
}

export default Admin;
