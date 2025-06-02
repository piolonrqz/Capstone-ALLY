const HeaderAdmin = ({ onMenuClick }) => {
  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white shadow-sm z-10">
      <div className="flex items-center justify-between h-full px-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-md text-gray-600 lg:hidden hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Profile Container */}
        <div className="flex items-center bg-gray-50 p-2 rounded-lg">
          {/* Profile Picture */}
          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-lg font-semibold">
            A
          </div>
          
          {/* Profile Info */}
          <div className="ml-3 pr-3">
            <h2 className="text-sm font-semibold text-gray-800">Admin User</h2>
            <p className="text-xs text-gray-500">admin@ally.com</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderAdmin;