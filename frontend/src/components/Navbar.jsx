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
          <a href="/" className="text-slate-200 hover:text-white font-medium transition">
            Home
          </a>
        </li>
        <li>
          <a href="/login" className="text-slate-200 hover:text-white font-medium transition">
            Login
          </a>
        </li>
        <li>
          <a href="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition">
            Register
          </a>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;