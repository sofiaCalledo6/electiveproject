import React, { useState, useRef } from 'react';
import axios from 'axios';
import './ReportLostModal.css'; 

const ReportFoundModal = ({ isOpen, onClose, refreshData }) => {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null); // Ref for mobile camera
  const [loading, setLoading] = useState(false);
  
  // Get current user ID from storage
  const user = JSON.parse(localStorage.getItem('user'));
  const studentId = user?.id || 1;

  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    color: '',
    location: '',
    description: '',
    eventDate: '', 
    image: null
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileClick = (e) => {
    e.preventDefault();
    fileInputRef.current.click();
  };

  const handleCameraClick = (e) => {
    e.preventDefault();
    cameraInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFormData({ ...formData, image: file });
  };

  const handleCloseModal = () => {
    setFormData({ itemName: '', category: '', color: '', location: '', description: '', eventDate: '', image: null });
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); 
    setLoading(true);

    const data = new FormData();
    data.append('user_id', studentId); 
    data.append('item_name', formData.itemName);
    data.append('type', 'Found'); 
    data.append('category', formData.category);
    data.append('color', formData.color);
    data.append('location', formData.location);
    data.append('description', formData.description);
    data.append('event_date', formData.eventDate); 

    if (formData.image) {
      data.append('image', formData.image);
    }

    // UPDATED ERROR HANDLING LOGIC
    try {
      const response = await axios.post('http://localhost/lostfound_backend/save_item.php', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        alert("Found item reported successfully!");
        handleCloseModal(); 
        if (refreshData) refreshData(); 
      } else {
        // This catches errors sent back purposefully by PHP
        alert("Backend Error: " + response.data.message);
      }
    } catch (error) {
      // This catches server crashes or connection losses
      console.error("Critical Error:", error);
      const errorMessage = error.response?.data?.message || "Check your PHP error logs or XAMPP console.";
      alert("Failed to connect: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleCloseModal}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Report Found Item</h2>
          <button type="button" className="close-x" onClick={handleCloseModal}>&times;</button>
        </div>
        <p className="modal-subtitle">Found something? Help find the owner.</p>

        <form onSubmit={handleSubmit} className="report-form">
          <div className="input-row">
            <div className="input-group">
              <label>Item Name *</label>
              <input 
                type="text" 
                name="itemName" 
                placeholder="e.g., iPhone 13" 
                value={formData.itemName} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="input-group">
              <label>Date Found *</label>
              <input 
                type="date" 
                name="eventDate" 
                value={formData.eventDate} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div className="input-row">
            <div className="input-group">
              <label>Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="Electronics">Electronics</option>
                <option value="Documents">Documents</option>
                <option value="Personal Items">Personal Items</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div className="input-group">
              <label>Color *</label>
              <select name="color" value={formData.color} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="Black">Black</option>
                <option value="White">White</option>
                <option value="Blue">Blue</option>
                <option value="Red">Red</option>
                <option value="Red">Pink</option>
                <option value="Red">Yellow</option>
                <option value="Silver/Grey">Silver/Grey</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>Location (Where found) *</label>
            <input 
              type="text" 
              name="location" 
              placeholder="e.g., Library, Cafeteria" 
              value={formData.location} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Description *</label>
            <textarea 
              name="description" 
              rows="2"
              placeholder="Unique details..." 
              value={formData.description} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="upload-section">
            <div className="upload-buttons">
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileChange} 
                accept="image/*" 
              />
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                ref={cameraInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileChange} 
              />

              <button type="button" className="upload-btn" onClick={handleFileClick}>
                <span className="icon">📤</span> File
              </button>
              <button type="button" className="upload-btn" onClick={handleCameraClick}>
                <span className="icon">📷</span> Photo
              </button>
            </div>
            {formData.image && <p className="file-name">Selected: {formData.image.name}</p>}
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={handleCloseModal}>Cancel</button>
            <button type="submit" className="submit-report-btn" disabled={loading}>
              {loading ? "..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportFoundModal;