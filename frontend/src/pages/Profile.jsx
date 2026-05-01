import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { updateUserLocally } from '../store/authSlice';
import axios from 'axios';

function Profile() {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const updateProfile = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) return alert('Passwords do not match');

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put('/api/auth/profile', { name, password }, config);
      dispatch(updateUserLocally(data));
      alert('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating profile');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <header className="mb-6 border-b pb-4">
         <Link to="/" className="text-blue-500 hover:underline mb-2 inline-block">&larr; Back to Dashboard</Link>
         <h1 className="text-3xl font-bold">Your Profile</h1>
      </header>
      <form onSubmit={updateProfile} className="bg-white p-6 rounded shadow space-y-4">
         <div>
           <label className="block font-semibold mb-1">Email (Cannot be changed)</label>
           <input type="email" value={user?.email} disabled className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed" />
         </div>
         <div>
           <label className="block font-semibold mb-1">Name</label>
           <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full border p-2 rounded" />
         </div>
         <div>
           <label className="block font-semibold mb-1">New Password (leave blank to keep current)</label>
           <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border p-2 rounded" placeholder="New Password" />
         </div>
         {password && (
           <div>
             <label className="block font-semibold mb-1">Confirm New Password</label>
             <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full border p-2 rounded" placeholder="Confirm Password" />
           </div>
         )}
         <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Update Profile</button>
      </form>
    </div>
  );
}

export default Profile;
