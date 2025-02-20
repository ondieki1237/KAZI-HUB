import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PostJob from './pages/PostJob';
import Profile from './pages/Profile';
import Jobs from './pages/Jobs';
import Wallet from './pages/Wallet';
import CreateJob from './pages/CreateJob';
import SeeMyPostedJobs from './pages/SeeMyPostedJobs';
import CVMaker from './pages/CVMaker';
import JobDetail from './pages/JobDetail';
import MyProfile from './pages/MyProfile';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/post-job" element={<PostJob />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/jobs/create" element={<CreateJob />} />
        <Route path="/jobs/my-posted" element={<SeeMyPostedJobs />} />
        <Route path="/cv-maker" element={<CVMaker />} />
        <Route path="/jobs/:jobId" element={<JobDetail />} />
        <Route path="/profile/my-profile" element={<MyProfile />} />
      </Routes>
    </Router>
  );
}

export default App;