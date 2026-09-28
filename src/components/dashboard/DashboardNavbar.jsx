import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function DashboardNavbar() {
  const navigate = useNavigate();
  let userName = "User";
  let role = "";
  try {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userName = payload.name || payload.username || payload.sub || 'User';
      role = payload.role;
    }
  } catch {}

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="bg-[#0f1f3d] text-white px-8 py-4 flex justify-between items-center shadow">
      {/* LEFT */}
      {role === 'STUDENT' ? (
        <NavLink to="/events" className="text-xl font-bold hover:text-orange-400 transition-colors">
          UniBuzz
        </NavLink>
      ) : (
        <h1 className="text-xl font-bold">UniBuzz</h1>
      )}

      {/* CENTER MENU */}
      <div className="flex gap-8">
        <NavLink 
          to={role === 'FACULTY' ? "/dashboard/faculty" : "/profile"} 
          className={({ isActive }) =>
            isActive ? "text-orange-400 font-bold" : "hover:text-orange-400"
          }
        >
          Profile
        </NavLink>

        {role === 'STUDENT' && (
          <>
            <NavLink 
              to="/dashboard/student" 
              className={({ isActive }) =>
                isActive ? "text-orange-400 font-bold" : "hover:text-orange-400"
              }
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/dashboard/certificates" 
              className={({ isActive }) =>
                isActive ? "text-orange-400 font-bold" : "hover:text-orange-400"
              }
            >
              Certificates
            </NavLink>
          </>
        )}

        {role === 'FACULTY' && (
          <NavLink 
            to="/dashboard/create-event" 
            className={({ isActive }) =>
              isActive ? "text-orange-400 font-bold" : "hover:text-orange-400"
            }
          >
            Create Event
          </NavLink>
        )}

        <NavLink 
          to="/dashboard/my-events" 
          className={({ isActive }) =>
            isActive ? "text-orange-400 font-bold" : "hover:text-orange-400"
          }
        >
          My Events
        </NavLink>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <NavLink
          to={role === 'FACULTY' ? "/dashboard/faculty" : "/profile"}
          className="bg-yellow-500 w-10 h-10 rounded-full flex items-center justify-center text-black font-bold hover:bg-yellow-400 transition"
        >
          👤
        </NavLink>
      </div>
    </div>
  );
}
