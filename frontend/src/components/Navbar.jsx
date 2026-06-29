import { NavLink  } from "react-router-dom";
const navClass = ({ isActive }) =>
  isActive
    ? "bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition"
    : "text-white hover:text-blue-300 px-4 py-2 transition";
function Navbar() {
  return (
    <nav className="bg-slate-900 px-6 py-4 flex items-center justify-between shadow-md">
      <div>
        <h2 className="text-white text-xl font-bold leading-tight">
          Umar Science Academy
        </h2>
        <p className="text-slate-400 text-sm">
          AI-Powered Educational Platform
        </p>
      </div>
      <ul className="flex items-center gap-6">
        <li>
          <NavLink to="/" className={navClass}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/courses" className={navClass}>
            Courses
          </NavLink>
        </li>
        <li>
          <NavLink to="/about" className={navClass}>
            About
          </NavLink>
        </li>
        <li>
          <NavLink to="/contact" className={navClass}>
            Contact
          </NavLink>
        </li>

        <li>
          <NavLink to="/login" className={navClass}>
            Login
          </NavLink>
        </li>
        <li>
          <NavLink to="/register" className={navClass}>
            Register
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;