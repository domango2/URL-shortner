import { NavLink, useNavigate } from "react-router-dom";

const NavBar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "text-white bg-blue-600 px-3 py-1 rounded-md"
      : "text-gray-700 hover:text-blue-600 px-3 py-1";

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-4">
            <span className="flex items-center text-2xl font-bold text-blue-600">
              URL-Shortner
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/shorten" className={linkClass}>
              Shorten
            </NavLink>
            <button
              onClick={handleLogout}
              className="ml-4 bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
