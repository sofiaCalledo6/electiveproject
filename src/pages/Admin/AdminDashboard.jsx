import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [items, setItems] = useState([]); 
  const [pendingMatches, setPendingMatches] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0); 
  const [studentList, setStudentList] = useState([]); 
  const [showUserList, setShowUserList] = useState(false); 
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Items');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'Admin') {
      navigate('/auth');
    } else {
      setAdminData(user);
      fetchAdminDataset();

      // 🔄 AUTO-UPDATE: Fetch fresh data every 30 seconds
      const interval = setInterval(() => {
        fetchAdminDataset();
      }, 30000); 

      return () => clearInterval(interval);
    }
  }, [navigate]);

  const fetchAdminDataset = async () => {
    try {
      const response = await axios.get('http://localhost/lostfound_backend/get_all_reports.php');
      if (response.data.success) {
        setItems(response.data.items);
        if (response.data.users) {
          const studentsOnly = response.data.users.filter(u => u.role === 'Student');
          setTotalStudents(studentsOnly.length);
          setStudentList(studentsOnly);
        }
      }
      const matchRes = await axios.get('http://localhost/lostfound_backend/get_admin_pending.php');
      if (matchRes.data.success) {
        setPendingMatches(matchRes.data.matches);
      }
    } catch (error) {
      console.error("Dashboard Sync Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchAction = async (matchId, action) => {
    try {
      const res = await axios.post('http://localhost/lostfound_backend/admin_confirm.php', {
        match_id: matchId,
        action: action
      });
      if (res.data.success) fetchAdminDataset();
    } catch (err) {
      console.error("Action Error:", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/auth');
  };

  // --- 🛠️ UPDATED FILTER LOGIC ---
  const filteredItems = items.filter(item => {
    const itemName = (item?.item_name || "").toLowerCase();
    const searchMatch = itemName.includes(searchTerm.toLowerCase());
    
    // If the "Returns" tab is active, ONLY show items with 'Returned' status
    if (activeTab === 'Returns') {
      return searchMatch && item.status === 'Returned';
    }
    
    // Otherwise, apply category filters for "All Items"
    const categoryMatch = selectedCategory === 'All' || item.type === selectedCategory;
    return searchMatch && categoryMatch;
  });

  if (!adminData) return null;

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="header-left">
          <h1>LostFound AI</h1>
          <p>Campus Lost & Found System</p>
        </div>
        <div className="header-right">
          <div className="admin-profile">
            <div className="profile-info">
              <span className="admin-name">{adminData.firstName} {adminData.lastName}</span>
              <span className="admin-label">{adminData.role}</span>
            </div>
            <div className="admin-icon-shield">🛡️</div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* --- STATS GRID --- */}
      <div className="stats-grid">
        <div className="stat-card clickable-stat" onClick={() => setShowUserList(true)}>
          <div className="stat-title">Total Students</div>
          <div className="stat-value"><span className="icon">👥</span> {totalStudents}</div>
          <div className="stat-sub-text"></div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Total Items</div>
          <div className="stat-value"><span className="icon-box">📦</span> {items.length}</div>
          <div className="stat-sub">
            <span className="tag-mini lost"> Lost: {items.filter(i => i.type === 'Lost').length}</span>
            <span className="tag-mini found"> Found: {items.filter(i => i.type === 'Found').length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-title">AI Matches</div>
          <div className="stat-value"><span className="icon-trend">📈</span> {pendingMatches.length}</div>
          <div className="stat-sub-text">{pendingMatches.length} pending review</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Returned Items</div>
          <div className="stat-value"><span className="icon-check">✅</span> {items.filter(i => i.status === 'Returned').length}</div>
        </div>
      </div>

      {/* --- STUDENT DATABASE MODAL --- */}
      {showUserList && (
        <div className="modal-overlay" onClick={() => setShowUserList(false)}>
          <div className="student-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Student Database</h2>
              <button className="close-btn" onClick={() => setShowUserList(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Gender</th>
                  </tr>
                </thead>
                <tbody>
                  {studentList.length > 0 ? studentList.map(student => (
                    <tr key={student.id}>
                      <td>{student.id}</td>
                      <td>{student.first_name}</td>
                      <td>{student.last_name}</td>
                      <td>{student.gender || 'N/A'}</td>
                    </tr>
                  )) : <tr><td colSpan="4">No students registered.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- MANAGEMENT SECTION --- */}
      <div className="management-section">
        <div className="tab-navigation">
          {['All Items', 'Matches', 'Returns'].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab} {tab === 'Matches' && pendingMatches.length > 0 && `(${pendingMatches.length})`}
            </button>
          ))}
        </div>

        <div className="table-controls">
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search items..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Hide category filter on Returns tab for cleaner UI */}
          {activeTab !== 'Returns' && (
            <select 
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Lost">Lost</option>
              <option value="Found">Found</option>
            </select>
          )}
        </div>

        <div className="admin-items-grid">
          {loading ? (
            <p className="loading-msg">Loading dataset...</p>
          ) : activeTab === 'Matches' ? (
            pendingMatches.length > 0 ? pendingMatches.map(match => (
              <div key={match.match_id} className="item-card match-review-card" style={{border: '2px solid #3498db'}}>
                <div className="item-card-details">
                  <h3 style={{color: '#2980b9'}}>🤖 Potential Match</h3>
                  <p><strong>Lost:</strong> {match.lost_item_name}</p>
                  <p><strong>Found:</strong> {match.found_item_name}</p>
                  <p><strong>AI Score:</strong> {Math.round(match.match_score)}%</p>
                  <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                    <button onClick={() => handleMatchAction(match.match_id, 'Confirm')} style={{backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', flex: 1, cursor: 'pointer'}}>Confirm</button>
                    <button onClick={() => handleMatchAction(match.match_id, 'Reject')} style={{backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', flex: 1, cursor: 'pointer'}}>Reject</button>
                  </div>
                </div>
              </div>
            )) : <p className="no-data">No AI matches to review.</p>
          ) : filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item.id} className="item-card">
                <div className="item-image-wrapper">
                  {item.image_path ? (
                    <img src={`http://localhost/lostfound_backend/uploads/${item.image_path}`} alt={item.item_name} />
                  ) : (
                    <div className="no-photo">No Photo</div>
                  )}
                  <span className={`badge ${item.type.toLowerCase()}`}>{item.type}</span>
                </div>
                <div className="item-card-details">
                  <h3>{item.item_name}</h3>
                  <p className="item-meta">Loc: {item.location}</p>
                  <span className="status-tag">{item.status}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data-container">
              <p className="no-data">No {activeTab === 'Returns' ? 'returned' : ''} items found</p>
            </div>
          )}
        </div>
      </div>

      <footer className="admin-footer">
        <p>LostFound AI - Powered by Smart Matching</p>
      </footer>
    </div>
  );
};

export default AdminDashboard;
