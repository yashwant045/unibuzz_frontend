import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {

  return (
    <div>
      <DashboardNavbar />

      <div className="bg-gray-100 min-h-screen p-10">
        <Outlet />
      </div>
    </div>
  );

}