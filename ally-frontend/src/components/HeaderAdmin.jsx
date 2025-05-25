const HeaderAdmin = () => {
  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] bg-white border-b border-gray-200 z-10 mb-4">
      <div className="flex items-center justify-between px-6 py-3">
        
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