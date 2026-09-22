import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {

  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  let role = "";
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      role = payload.role;
    } catch (e) {}
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0f1f3d] text-white shadow-md">

      <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-4">

        {/* Logo */}
        {role === 'STUDENT' ? (
          <Link to="/events" className="text-2xl font-bold tracking-wide hover:text-yellow-400 transition">
            UniBuzz
          </Link>
        ) : (
          <Link to="/" className="text-2xl font-bold tracking-wide hover:text-yellow-400 transition">
            UniBuzz
          </Link>
        )}

        {/* Menu */}
        <div className="flex items-center gap-8">

          <Link
            to="/events"
            className="hover:text-yellow-400 transition"
          >
            Events
          </Link>

          {token && (
            <Link
              to="/dashboard/my-events"
              className="hover:text-yellow-400 transition"
            >
              My Events
            </Link>
          )}

          {!token ? (
            <Link
              to="/auth"
              className="hover:text-yellow-400 transition"
            >
              Login
            </Link>
          ) : (
            <Link
              to={role === 'FACULTY' ? "/dashboard/faculty" : "/profile"}
              className="bg-yellow-500 w-10 h-10 rounded-full flex items-center justify-center text-black font-bold hover:bg-yellow-400 transition"
            >
              👤
            </Link>
          )}

        </div>

      </div>

    </nav>
  );
}