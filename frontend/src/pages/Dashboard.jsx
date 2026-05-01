import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../store/authSlice';
import axios from 'axios';

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchProjects();
    }
  }, [user, navigate]);

  const fetchProjects = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/projects', config);
      setProjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  const createProject = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/projects', { name: newProjectName }, config);
      setNewProjectName('');
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome, {user?.name} {user?.isSuperAdmin ? '(SuperAdmin)' : ''}</p>
        </div>
        <div className="flex gap-4 items-center">
          {user?.isSuperAdmin && (
            <Link to="/admin" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 font-semibold text-sm">
              Admin Panel
            </Link>
          )}
          <Link to="/profile" className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 font-semibold text-sm">
            Profile
          </Link>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Team/Project</h2>
        <form onSubmit={createProject} className="flex gap-2">
          <input
            type="text"
            className="border p-2 flex-grow rounded"
            placeholder="Project Name..."
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            required
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create</button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map(p => (
            <Link to={`/project/${p._id}`} key={p._id} className="bg-white p-6 rounded shadow hover:shadow-lg transition">
              <h3 className="font-bold text-lg mb-2 text-blue-600">{p.name}</h3>
              <p className="text-sm text-gray-500">{p.members.length} members</p>
            </Link>
          ))}
          {projects.length === 0 && <p>No projects found. Create one!</p>}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
