import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

function AdminPanel() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (!user || !user.isSuperAdmin) {
      navigate('/');
    } else {
      fetchUsers();
      fetchProjects();
    }
  }, [user, navigate]);

  const config = { headers: { Authorization: `Bearer ${user?.token}` } };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('/api/users', config);
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get('/api/projects?all=true', config);
      setProjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`/api/users/${id}`, config);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting user');
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await axios.delete(`/api/projects/${id}`, config);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting project');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-6 flex justify-between items-center border-b pb-4">
        <div>
          <Link to="/" className="text-blue-500 hover:underline mb-2 inline-block">&larr; Back to Dashboard</Link>
          <h1 className="text-3xl font-bold text-gray-800">SuperAdmin Panel</h1>
        </div>
        <div>
          <Link to="/profile" className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 font-semibold text-sm">
            Profile
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Manage Users</h2>
          <ul className="space-y-3">
            {users.map(u => (
              <li key={u._id} className="flex justify-between items-center text-sm border-b pb-2">
                <div>
                  <p className="font-semibold">{u.name} {u.isSuperAdmin && <span className="text-red-500 text-xs">(SuperAdmin)</span>}</p>
                  <p className="text-gray-500">{u.email}</p>
                </div>
                {!u.isSuperAdmin && (
                  <button 
                    onClick={() => deleteUser(u._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                  >
                    Delete
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Manage Projects / Teams</h2>
          <ul className="space-y-3">
            {projects.map(p => (
              <li key={p._id} className="flex justify-between items-center text-sm border-b pb-2">
                <div>
                  <Link to={`/project/${p._id}`} className="font-semibold text-blue-600 hover:underline">{p.name}</Link>
                  <p className="text-gray-500">{p.members.length} members</p>
                </div>
                <button 
                  onClick={() => deleteProject(p._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default AdminPanel;
