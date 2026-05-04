import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Navbar from "./Navbar.jsx";

const Layout = ({ children, showSidebar = false }) => {
  const location = useLocation();
  const isChatPage = location.pathname.includes("/chat");
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {showSidebar && <Sidebar />}
<main className={`flex-1 ${isChatPage ? "overflow-hidden" : "overflow-y-auto"} p-0 bg-base-100 relative`}>{children}</main>
      </div>
    </div>
  );
};
export default Layout;
