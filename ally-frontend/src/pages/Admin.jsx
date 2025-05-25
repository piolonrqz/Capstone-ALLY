import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import HeaderAdmin from '../components/HeaderAdmin';

const Admin = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-64">
        <HeaderAdmin />
        <main className="pt-20 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Admin;