import { NavLink, useNavigate } from "react-router-dom";

export default function StudentNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // adjust if needed
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-md text-sm font-medium transition ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-white hover:bg-blue-500/30"
    }`;

  return (
    <nav className="bg-blue-700 px-6 py-3 flex items-center justify-between">
      {/* Left side - Logo */}
      <div className="text-white font-bold text-lg">
        Student Portal
      </div>

      {/* Center - Menu */}
      <div className="flex gap-2">
        <NavLink to="/student-dashboard" className={linkClass}>
          Dashboard
        </NavLink>

        <NavLink to="/student/courses" className={linkClass}>
          Courses
        </NavLink>

        <NavLink to="/student/assignments" className={linkClass}>
          Assignments
        </NavLink>

        <NavLink to="/student/profile" className={linkClass}>
          Profile
        </NavLink>
      </div>

      {/* Right side - Logout */}
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
      >
        Logout
      </button>
    </nav>
  );
}