import React, { useState, useRef } from 'react';
import axios from 'axios';
import './ReportLostModal.css';

const ReportLostModal = ({ isOpen, onClose, refreshData }) => {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null); // Ref for mobile camera
  const [loading, setLoading] = useState(false);
  
  // Get current user ID from storage
  const userData = JSON.parse(localStorage.getItem('user'));
  const studentId = userData?.id || 1;

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

  // Handler specifically for the camera button
  const handleCameraClick = (e) => {
    e.preventDefault();
    cameraInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
  };

  const handleCloseModal = (e) => {
    if (e) e.stopPropagation();
    setFormData({ itemName: '', category: '', color: '', location: '', description: '', eventDate: '', image: null });
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); 
    setLoading(true);

    const data = new FormData();
    // Use dynamic studentId instead of static '1'
    data.append('user_id', studentId); 
    data.append('type', 'Lost'); 
    data.append('item_name', formData.itemName);
    data.append('category', formData.category);
    data.append('color', formData.color);
    data.append('location', formData.location);
    data.append('description', formData.description);
    data.append('event_date', formData.eventDate);

    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      const response = await axios.post('http://localhost/lostfound_backend/save_item.php', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        alert("Lost item reported successfully!");
        handleCloseModal(); 
        // Trigger the recount on the dashboard
        if (refreshData) {
          refreshData(); 
        }
      } else {
        alert("Failed: " + response.data.message);
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Error connecting to server. Please ensure XAMPP is running.");
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="modal-overlay" onClick={handleCloseModal}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Report Lost Item</h2>
          <button type="button" className="close-x" onClick={handleCloseModal}>&times;</button>
        </div>
        <p className="modal-subtitle">AI will automatically match your item.</p>

        <form onSubmit={handleSubmit} className="report-form">
          <div className="input-group">
            <label>Item Name *</label>
            <input 
              type="text" 
              name="itemName" 
              placeholder="e.g., iPhone 13, Blue Backpack" 
              value={formData.itemName}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="input-row">
            <div className="input-group">
              <label>Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} required>
                <option value="">Select category</option>
                <option value="Electronics">Electronics</option>
                <option value="Documents">Documents</option>
                <option value="Personal Items">Personal Items</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div className="input-group">
              <label>Color *</label>
              <select name="color" value={formData.color} onChange={handleChange} required>
                <option value="">Select color</option>
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

          <div className="input-row">
            <div className="input-group">
              <label>Date Lost *</label>
              <input 
                type="date" 
                name="eventDate" 
                value={formData.eventDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Location *</label>
              <input 
                type="text" 
                name="location" 
                placeholder="e.g., Library" 
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Description *</label>
            <textarea 
              name="description" 
              rows="2"
              placeholder="Provide unique details..."
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <div className="upload-section">
            <div className="upload-buttons">
              {/* Standard File Upload */}
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileChange}
                accept="image/*"
              />
              {/* Mobile Camera Upload */}
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
              {loading ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportLostModal;