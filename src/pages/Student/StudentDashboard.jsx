import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import axios from 'axios';

import './StudentDashboard.css';

import ReportLostModal from './ReportLostModal';

import ReportFoundModal from './ReportFoundModal';

import MatchDetailsModal from './MatchDetailsModal';



const StudentDashboard = () => {

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('All');

 

  // States for live data

  const [items, setItems] = useState([]);

  const [aiMatches, setAiMatches] = useState([]);

  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');

 

  // Modal states

  const [isLostModalOpen, setIsLostModalOpen] = useState(false);

  const [isFoundModalOpen, setIsFoundModalOpen] = useState(false);



  // Match Details Modal State

  const [selectedMatch, setSelectedMatch] = useState(null);

  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);



  // --- NEW: Profile Modal State ---

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const userData = JSON.parse(localStorage.getItem('user'));

  const studentId = userData?.id || 1;



  const [profileInfo, setProfileInfo] = useState({

    course: userData?.course || '',

    phone: userData?.phone || '',

    student_id_number: userData?.student_id_number || '2024-XXXX'

  });



  // --- REFRESH LOGIC ---

  const refreshDashboardData = async () => {

    try {

      const [itemsRes, matchesRes, notifRes] = await Promise.all([

        axios.get(`http://localhost/lostfound_backend/get_items.php?userId=${studentId}`),

        axios.get(`http://localhost/lostfound_backend/get_matches.php?userId=${studentId}`),

        axios.get(`http://localhost/lostfound_backend/get_notifications.php?userId=${studentId}`)

      ]);



      if (itemsRes.data.success) setItems(itemsRes.data.items);

      if (matchesRes.data.success) setAiMatches(matchesRes.data.matches);

      if (notifRes.data.success) setNotifications(notifRes.data.notifications);



    } catch (error) {

      console.error("Dashboard Refresh Error:", error);

    } finally {

      setLoading(false);

    }

  };



  // --- NEW: Save Profile Handler ---

  const handleSaveProfile = async () => {

    try {

      const response = await axios.post('http://localhost/lostfound_backend/update_profile.php', {

        user_id: studentId,

        ...profileInfo

      });

      if (response.data.success) {

        alert("Profile updated successfully!");

        localStorage.setItem('user', JSON.stringify({ ...userData, ...profileInfo }));

        setIsProfileModalOpen(false);

      }

    } catch (error) {

      console.error("Error updating profile:", error);

    }

  };



  // --- NOTIFICATION HANDLERS ---

  const handleNotificationClick = async (notifId) => {

    try {

      const response = await axios.post('http://localhost/lostfound_backend/update_notification_status.php', {

        notification_id: notifId

      });



      if (response.data.success) {

        setNotifications(prev =>

          prev.map(n => n.notification_id === notifId ? { ...n, status: 'read' } : n)

        );

      }

    } catch (error) {

      console.error("Error updating notification status:", error);

    }

  };



  const handleMarkAllRead = async () => {

    const unreadIds = notifications.filter(n => n.status === 'unread').map(n => n.notification_id);

    if (unreadIds.length === 0) return;



    try {

      await Promise.all(unreadIds.map(id =>

        axios.post('http://localhost/lostfound_backend/update_notification_status.php', { notification_id: id })

      ));

      setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));

    } catch (error) {

      console.error("Error marking all as read:", error);

    }

  };



  useEffect(() => {

    refreshDashboardData();

    const interval = setInterval(refreshDashboardData, 30000);

    return () => clearInterval(interval);

  }, []);



  const handleViewMatchDetails = (match) => {

    setSelectedMatch(match);

    setIsMatchModalOpen(true);

  };



  const filteredItems = (items || []).filter(item => {

    const matchesTab = activeTab === 'All' || (activeTab === 'Pending' ? item.status === 'Pending' : item.type === activeTab);

    const matchesSearch = (item?.item_name || "").toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;

  });



  const lostCount = items.filter(i => i.type === 'Lost').length;

  const foundCount = items.filter(i => i.type === 'Found').length;

  const unreadNotifCount = notifications.filter(n => n.status === 'unread').length;



  const handleLogout = () => {

    localStorage.removeItem('user');

    navigate('/');

  };



  return (

    <div className="dashboard-container">

      <header className="dashboard-header">

        <div className="header-left">

          <h1>LostFound AI</h1>

          <p>Campus Lost & Found System</p>

        </div>

        <div className="header-right">

          {/* UPDATED: Clickable Profile Trigger */}

          <div className="user-info" onClick={() => setIsProfileModalOpen(true)} style={{ cursor: 'pointer' }}>

            <span className="user-icon">👤</span>

            <div className="user-details">

              <p className="user-name">{userData?.firstName || "Hara"}</p>

              <p className="user-role">Student</p>

            </div>

          </div>

          <button className="logout-btn" onClick={handleLogout}>Logout</button>

        </div>

      </header>



      <main className="dashboard-content">

        {/* ... (Keep existing report-actions and stats-row sections) ... */}

        <section className="report-actions">

          <div className="action-card lost-card">

            <h3>Report Lost Item</h3>

            <button className="report-btn lost" onClick={() => setIsLostModalOpen(true)}>🔍 Report Lost Item</button>

          </div>

          <div className="action-card found-card">

            <h3>Report Found Item</h3>

            <button className="report-btn found" onClick={() => setIsFoundModalOpen(true)}>➕ Report Found Item</button>

          </div>

        </section>



        <section className="stats-row">

          <div className="stat-item"><span className="count lost-count">{lostCount}</span> Lost Items</div>

          <div className="stat-item"><span className="count found-count">{foundCount}</span> Found Items</div>

          <div className="stat-item"><span className="count match-count">{aiMatches.length}</span> AI Matches</div>

          <div className="stat-item">

            <span className="count notify-count">{unreadNotifCount}</span> Unread Notifs

          </div>

        </section>



        <div className="main-grid">

           {/* ... (Keep your existing items and matches grid code here) ... */}

           <div className="grid-column my-items">

            <div className="content-card">

              <h3>My Items</h3>

              <div className="filter-tabs">

                {['All', 'Lost', 'Found', 'Pending'].map(tab => (

                  <button key={tab} className={activeTab === tab ? 'tab active' : 'tab'} onClick={() => setActiveTab(tab)}>{tab}</button>

                ))}

              </div>

              <div className="items-grid">

                {loading ? <div className="empty-placeholder">Loading...</div> :

                 filteredItems.length > 0 ? filteredItems.map((item) => (

                  <div key={item.id} className="item-card">

                    <div className="item-image-wrapper">

                      {item.image_path ?

                        <img src={`http://localhost/lostfound_backend/uploads/${item.image_path}`} alt="item" className="item-photo" />

                        : <div className="no-image-placeholder">No Photo</div>}

                      <span className={`badge-overlay ${item.type?.toLowerCase()}`}>{item.type}</span>

                    </div>

                    <div className="item-card-details">

                      <h4 className="item-display-name">{item.item_name}</h4>

                      <p><strong>Loc:</strong> {item.location} | <strong>Status:</strong> {item.status}</p>

                    </div>

                  </div>

                )) : <div className="empty-placeholder">No items found for this filter.</div>}

              </div>

            </div>

          </div>



          <div className="grid-column ai-matches">

            <div className="content-card">

              <h3>🤖 AI Potential Matches</h3>

              <div className="matches-grid">

                {aiMatches.length > 0 ? aiMatches.map(match => (

                  <div key={match.match_id} className="ai-match-card">

                    <div className="match-score-badge">{Math.round(match.match_score)}% Match</div>

                    <div className="match-comparison-view">

                      <div className="match-side">

                        <div className="match-img-frame">

                          {match.found_item_image ? <img src={`http://localhost/lostfound_backend/uploads/${match.found_item_image}`} alt="Found" /> : <div className="no-img">No Image</div>}

                        </div>

                        <p className="side-label">Found: {match.found_item_name}</p>

                      </div>

                      <div className="match-vs">VS</div>

                      <div className="match-side">

                        <div className="match-img-frame">

                          {match.my_item_image ? <img src={`http://localhost/lostfound_backend/uploads/${match.my_item_image}`} alt="Lost" /> : <div className="no-img">No Image</div>}

                        </div>

                        <p className="side-label">Your Lost: {match.my_item_name}</p>

                      </div>

                    </div>

                    <button className="view-details-btn" onClick={() => handleViewMatchDetails(match)}>View Details</button>

                  </div>

                )) : <div className="empty-placeholder">Scanning for matches...</div>}

              </div>

            </div>



            <div className="content-card" style={{ marginTop: '20px' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>

                <h3>🔔 Notifications</h3>

                {unreadNotifCount > 0 && (

                  <button onClick={handleMarkAllRead} className="mark-read-link">Mark all as read</button>

                )}

              </div>

              <div className="notification-list">

                {notifications.length > 0 ? notifications.map(n => (

                  <div

                    key={n.notification_id}

                    onClick={() => handleNotificationClick(n.notification_id)}

                    className={`notif-item ${n.status}`}

                    style={{

                      padding: '12px',

                      borderBottom: '1px solid #eee',

                      cursor: 'pointer',

                      backgroundColor: n.status === 'unread' ? '#f0f7ff' : '#ffffff',

                      borderLeft: n.status === 'unread' ? '4px solid #007bff' : 'none'

                    }}

                  >

                    <p style={{ margin: '0 0 5px 0', fontSize: '0.95rem', fontWeight: n.status === 'unread' ? '600' : '400' }}>

                      {n.message}

                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                      <small style={{ color: '#888' }}>

                        {n.date_sent ? new Date(n.date_sent).toLocaleString() : "Just now"}

                      </small>

                      {n.status === 'unread' && <span className="unread-dot">●</span>}

                    </div>

                  </div>

                )) : <div className="empty-placeholder">No notifications yet</div>}

              </div>

            </div>

          </div>

        </div>

      </main>



      {/* --- NEW: Profile Modal Component --- */}

      {isProfileModalOpen && (

        <div className="modal-overlay">

          <div className="modal-content profile-modal">

            <div className="modal-header">

              <h2>Student Profile</h2>

              <button className="close-btn" onClick={() => setIsProfileModalOpen(false)}>×</button>

            </div>

            <div className="modal-body">

              <div className="profile-field">

                <label>Student Name</label>

                <input type="text" value={userData?.firstName || "Hara"} disabled />

              </div>

              <div className="profile-field">

                <label>Student ID Number</label>

                <input

                  type="text"

                  value={profileInfo.student_id_number}

                  onChange={(e) => setProfileInfo({...profileInfo, student_id_number: e.target.value})}

                />

              </div>

              <div className="profile-field">

                <label>Course & Year</label>

                <input

                  type="text"

                  placeholder="e.g. BSIT - 3"

                  value={profileInfo.course}

                  onChange={(e) => setProfileInfo({...profileInfo, course: e.target.value})}

                />

              </div>

              <div className="profile-field">

                <label>Contact Number</label>

                <input

                  type="text"

                  placeholder="09123456789"

                  value={profileInfo.phone}

                  onChange={(e) => setProfileInfo({...profileInfo, phone: e.target.value})}

                />

              </div>

              <div className="profile-stats">

                <p>Items Returned: <strong>{items.filter(i => i.status === 'Returned').length}</strong></p>

              </div>

            </div>

            <div className="modal-footer">

              <button className="save-btn" onClick={handleSaveProfile}>Update Profile</button>

            </div>

          </div>

        </div>

      )}



      <ReportLostModal isOpen={isLostModalOpen} onClose={() => setIsLostModalOpen(false)} refreshData={refreshDashboardData} />

      <ReportFoundModal isOpen={isFoundModalOpen} onClose={() => setIsFoundModalOpen(false)} refreshData={refreshDashboardData} />

      <MatchDetailsModal isOpen={isMatchModalOpen} onClose={() => setIsMatchModalOpen(false)} matchData={selectedMatch} />

    </div>

  );

};



export default StudentDashboard;