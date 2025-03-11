import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users as UsersIcon } from 'lucide-react';

const Users: React.FC = () => {
  const navigate = useNavigate();

  const usersData = [
    { name: 'John Doe', role: 'Job Seeker', status: 'Active' },
    { name: 'Jane Smith', role: 'Employer', status: 'Inactive' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '2rem' }}>
      <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#26a69a' }}>Users List</h1>
          <button
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', color: '#1976d2', padding: '0.5rem' }}
          >
            <UsersIcon style={{ marginRight: '0.5rem' }} /> Back
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '0.5rem', textAlign: 'left', backgroundColor: '#1976d2', color: 'white' }}>Name</th>
              <th style={{ padding: '0.5rem', textAlign: 'left', backgroundColor: '#1976d2', color: 'white' }}>Role</th>
              <th style={{ padding: '0.5rem', textAlign: 'left', backgroundColor: '#1976d2', color: 'white' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {usersData.map((user, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #ddd', backgroundColor: '#fff' }}>
                <td style={{ padding: '0.5rem' }}>{user.name}</td>
                <td style={{ padding: '0.5rem' }}>{user.role}</td>
                <td style={{ padding: '0.5rem' }}>{user.status}</td>
            </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;