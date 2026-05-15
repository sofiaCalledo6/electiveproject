import React from 'react';
import './ReportLostModal.css';

const MatchDetailsModal = ({ isOpen, onClose, matchData }) => {
  if (!isOpen || !matchData) return null;

  // BASE URL for your local PHP backend uploads folder
  const uploadPath = "http://localhost/lostfound_backend/uploads/";

  // Fallback logic: Checks every possible name your backend might use
  const foundImage = matchData.found_image || matchData.found_item_image || matchData.image_path;
  const lostImage = matchData.my_image || matchData.lost_item_image || matchData.user_image;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="report-modal match-detail-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>AI Match: {Math.round(matchData.match_score)}% Confidence</h2>
          <button type="button" className="close-x" onClick={onClose}>&times;</button>
        </div>

        <div className="match-comparison-container">
          {/* Found Item Column */}
          <div className="match-column">
            <h3 className="label-found">Found Item</h3>
            <div className="match-pic-box">
              <img 
                src={`${uploadPath}${foundImage}`} 
                alt="Found Item" 
                onError={(e) => {
                  console.error("Found image failed at:", e.target.src);
                  e.target.src = 'https://via.placeholder.com/200?text=Check+Uploads+Folder';
                }}
              />
            </div>
            <p><strong>Name:</strong> {matchData.found_item_name}</p>
            <p><strong>Loc:</strong> {matchData.found_location}</p>
            <p><strong>Finder:</strong> {matchData.finder_name || 'Admin'}</p>
          </div>

          {/* Your Lost Item Column */}
          <div className="match-column">
            <h3 className="label-lost">Your Lost Item</h3>
            <div className="match-pic-box">
              <img 
                src={`${uploadPath}${lostImage}`} 
                alt="Your Lost Item" 
                onError={(e) => {
                  console.error("Lost image failed at:", e.target.src);
                  e.target.src = 'https://via.placeholder.com/200?text=Check+Uploads+Folder';
                }}
              />
            </div>
            <p><strong>Name:</strong> {matchData.my_item_name}</p>
            <p><strong>Loc:</strong> {matchData.my_location || "Not specified"}</p>
            <p><strong>Username:</strong> You</p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="submit-report-btn" onClick={() => alert("Claim request sent!")}>
            This is mine!
          </button>
          <button className="cancel-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default MatchDetailsModal;