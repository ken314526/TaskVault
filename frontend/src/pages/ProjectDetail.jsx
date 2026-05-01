import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const STATUSES = ['TODO', 'IN-DEV', 'DEV-DONE', 'CODE-REVIEW', 'CODE-DONE', 'COMPLETED'];

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  
  // Member States
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('Member');
  
  // Task Creation States
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignees, setNewTaskAssignees] = useState([]);

  // Task Editing States
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskAssignees, setEditTaskAssignees] = useState([]);
  
  // Edit Name State
  const [isEditingName, setIsEditingName] = useState(false);
  const [editProjectName, setEditProjectName] = useState('');

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');

  const config = { headers: { Authorization: `Bearer ${user?.token}` } };

  useEffect(() => {
    if (!user) return navigate('/login');
    fetchProject();
    fetchTasks();
  }, [id, user]);

  const fetchProject = async () => {
    try {
      const { data } = await axios.get(`/api/projects/${id}`, config);
      setProject(data);
      setEditProjectName(data.name);
    } catch (err) {
      console.error(err);
      navigate('/');
    }
  };

  const fetchTasks = async () => {
    try {
      const { data } = await axios.get(`/api/tasks?project=${id}`, config);
      setTasks(data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateProjectName = async () => {
    try {
      await axios.put(`/api/projects/${id}`, { name: editProjectName }, config);
      setIsEditingName(false);
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating project name');
    }
  };

  const addMember = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/projects/${id}/members`, { email: newEmail, role: newRole }, config);
      setNewEmail('');
      setNewRole('Member');
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding member');
    }
  };

  const removeMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await axios.delete(`/api/projects/${id}/members/${userId}`, config);
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.message || 'Error removing member');
    }
  };

  const toggleMemberRole = async (userId, currentRole) => {
    const newMemberRole = currentRole === 'Admin' ? 'Member' : 'Admin';
    try {
      await axios.put(`/api/projects/${id}/members/${userId}`, { role: newMemberRole }, config);
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating role');
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/tasks', { title: newTaskTitle, project: id, assignedTo: newTaskAssignees }, config);
      setNewTaskTitle('');
      setNewTaskAssignees([]);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating task');
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.put(`/api/tasks/${taskId}/status`, { status: newStatus }, config);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating task');
    }
  };

  const startEditTask = (task) => {
    setEditingTaskId(task._id);
    setEditTaskTitle(task.title);
    setEditTaskAssignees(task.assignedTo ? task.assignedTo.map(a => a._id) : []);
  };

  const cancelEditTask = () => {
    setEditingTaskId(null);
  };

  const saveEditTask = async (taskId) => {
    try {
      await axios.put(`/api/tasks/${taskId}`, { title: editTaskTitle, assignedTo: editTaskAssignees }, config);
      setEditingTaskId(null);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating task');
    }
  };

  const removeTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await axios.delete(`/api/tasks/${taskId}`, config);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting task');
    }
  };

  if (!project) return <div>Loading...</div>;

  const isAdmin = user.isSuperAdmin || project.members.find(m => m.user._id === user._id)?.role === 'Admin';

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAssignee = filterAssignee ? t.assignedTo?.some(a => a._id === filterAssignee) : true;
    return matchesSearch && matchesAssignee;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-6 flex justify-between items-center border-b pb-4">
        <div>
          <Link to="/" className="text-blue-500 hover:underline mb-2 inline-block">&larr; Back to Dashboard</Link>
          {isEditingName ? (
            <div className="flex gap-2 items-center">
              <input 
                value={editProjectName} 
                onChange={(e) => setEditProjectName(e.target.value)} 
                className="text-3xl font-bold border rounded p-1"
              />
              <button onClick={updateProjectName} className="bg-green-500 text-white px-3 py-1 rounded text-sm">Save</button>
              <button onClick={() => setIsEditingName(false)} className="bg-gray-300 px-3 py-1 rounded text-sm">Cancel</button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              {isAdmin && (
                <button onClick={() => setIsEditingName(true)} className="text-blue-500 text-sm hover:underline">Edit Name</button>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-3">
          {user?.isSuperAdmin && (
            <Link to="/admin" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 font-semibold text-sm">
              Admin Panel
            </Link>
          )}
          <Link to="/profile" className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 font-semibold text-sm">
            Profile
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="col-span-1 bg-white p-4 rounded shadow">
          <h2 className="font-bold text-lg mb-4">Team Members</h2>
          <ul className="mb-4 space-y-3">
            {project.members.map(m => (
              <li key={m.user._id} className="text-sm border-b pb-2 flex flex-col gap-1">
                <div>
                  <span className="font-semibold">{m.user.name}</span> <span className="text-gray-500 text-xs">({m.user.email})</span>
                  <span className={`ml-2 px-2 py-0.5 rounded text-xs text-white ${m.role === 'Admin' ? 'bg-red-500' : 'bg-gray-400'}`}>
                    {m.role}
                  </span>
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => toggleMemberRole(m.user._id, m.role)}
                      className="text-blue-500 text-xs hover:underline"
                    >
                      Make {m.role === 'Admin' ? 'Member' : 'Admin'}
                    </button>
                    <button 
                      onClick={() => removeMember(m.user._id)}
                      className="text-red-500 text-xs hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
          {isAdmin && (
            <form onSubmit={addMember} className="flex flex-col gap-2 mt-4">
              <h3 className="font-bold text-sm text-gray-700">Add New Member</h3>
              <input 
                type="email" 
                placeholder="User Email" 
                className="border p-1 w-full text-sm rounded" 
                value={newEmail} onChange={e => setNewEmail(e.target.value)} required 
              />
              <div className="flex gap-2">
                <select 
                  value={newRole} 
                  onChange={e => setNewRole(e.target.value)} 
                  className="border p-1 text-sm rounded flex-grow"
                >
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                </select>
                <button className="bg-green-500 text-white px-3 py-1 text-sm rounded hover:bg-green-600">Add</button>
              </div>
            </form>
          )}
        </div>

        <div className="col-span-2 bg-white p-4 rounded shadow">
          <h2 className="font-bold text-lg mb-4">Add Task</h2>
          {isAdmin ? (
            <form onSubmit={addTask} className="flex flex-col gap-3">
              <input 
                type="text" 
                placeholder="Task Title" 
                className="border p-2 w-full text-sm rounded" 
                value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} required 
              />
              <div className="border p-2 rounded max-h-32 overflow-y-auto">
                <span className="text-xs font-semibold text-gray-600 block mb-2">Assign To (Select multiple):</span>
                <div className="grid grid-cols-2 gap-2">
                  {project.members.map(m => (
                    <label key={m.user._id} className="text-sm flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input 
                        type="checkbox" 
                        checked={newTaskAssignees.includes(m.user._id)}
                        onChange={(e) => {
                          if(e.target.checked) setNewTaskAssignees([...newTaskAssignees, m.user._id]);
                          else setNewTaskAssignees(newTaskAssignees.filter(id => id !== m.user._id));
                        }}
                      /> {m.user.name}
                    </label>
                  ))}
                </div>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 text-sm rounded hover:bg-blue-700 w-max">Create Task</button>
            </form>
          ) : (
             <p className="text-gray-500 text-sm">Only Admins can create tasks.</p>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h2 className="font-bold text-xl">Kanban Board</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="border p-2 rounded text-sm min-w-[200px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="border p-2 rounded text-sm min-w-[150px]"
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
          >
            <option value="">All Assignees</option>
            {project.members.map(m => (
              <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUSES.map(status => (
          <div key={status} className="bg-gray-200 p-4 rounded w-72 flex-shrink-0 min-h-[300px]">
            <h3 className="font-bold text-gray-700 mb-4">{status}</h3>
            <div className="space-y-3">
              {filteredTasks.filter(t => t.status === status).map(task => (
                editingTaskId === task._id ? (
                  <div key={task._id} className="bg-white p-3 rounded shadow text-sm border-l-4 border-yellow-500">
                    <input 
                      value={editTaskTitle} 
                      onChange={e => setEditTaskTitle(e.target.value)} 
                      className="border p-1 w-full mb-2 rounded" 
                    />
                    <div className="text-xs mb-2">
                      <span className="font-semibold block mb-1">Assignees:</span>
                      <div className="max-h-24 overflow-y-auto border p-1 rounded">
                        {project.members.map(m => (
                          <label key={m.user._id} className="flex items-center gap-1 mb-1 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={editTaskAssignees.includes(m.user._id)}
                              onChange={(e) => {
                                if(e.target.checked) setEditTaskAssignees([...editTaskAssignees, m.user._id]);
                                else setEditTaskAssignees(editTaskAssignees.filter(id => id !== m.user._id));
                              }}
                            /> {m.user.name}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => saveEditTask(task._id)} className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600">Save</button>
                      <button onClick={cancelEditTask} className="bg-gray-300 px-2 py-1 rounded text-xs hover:bg-gray-400">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div key={task._id} className="bg-white p-3 rounded shadow text-sm border-l-4 border-blue-500">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold flex-grow pr-2">{task.title}</p>
                      {isAdmin && (
                        <div className="flex gap-2">
                          <button onClick={() => startEditTask(task)} className="text-blue-500 hover:text-blue-700" title="Edit">✎</button>
                          <button onClick={() => removeTask(task._id)} className="text-red-500 hover:text-red-700" title="Delete">✕</button>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      <span className="font-semibold block mb-1">Assignees:</span>
                      <div className="flex flex-wrap gap-1">
                        {task.assignedTo && task.assignedTo.length > 0 
                          ? task.assignedTo.map(a => (
                              <span key={a._id} className="bg-gray-100 border px-1.5 py-0.5 rounded">
                                {a.name}
                              </span>
                            ))
                          : <span className="italic">None</span>
                        }
                      </div>
                    </div>
                    <select 
                      value={task.status} 
                      onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                      className="w-full border text-xs p-1 mt-2 rounded bg-gray-50 cursor-pointer"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectDetail;
