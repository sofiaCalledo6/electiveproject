import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MatchesDisplay = () => {
    const [matches, setMatches] = useState([]);
    const userData = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchMatches = async () => {
            if (!userData?.id) return;
            
            try {
                // Fetch matches where one of the items belongs to the logged-in user
                const res = await axios.get(`http://localhost/lostfound_backend/get_matches.php?userId=${userData.id}`);
                if (res.data.success) {
                    setMatches(res.data.matches);
                }
            } catch (err) {
                console.error("Failed to fetch matches", err);
            }
        };

        fetchMatches();
    }, [userData?.id]);

    return (
        <div className="matches-container">
            <h3>🤖 AI Potential Matches</h3>
            <div className="matches-list">
                {matches.length > 0 ? matches.map((match) => (
                    <div key={match.match_id} className="match-card">
                        <div className="match-score-badge">
                            {Math.round(match.match_score)}% Match
                        </div>
                        <p>Your <strong>{match.my_item}</strong> matches a <strong>{match.partner_item}</strong>!</p>
                        <button className="view-details-btn">View Match</button>
                    </div>
                )) : (
                    <div className="empty-placeholder">Scanning for matches...</div>
                )}
            </div>
        </div>
    );
};

export default MatchesDisplay;