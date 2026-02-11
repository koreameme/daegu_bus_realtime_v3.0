import React from 'react';

const BottomNav = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'timetable', label: '시간표', icon: '🕒' },
        { id: 'calendar', label: '달력', icon: '📅' },
        { id: 'realtime', label: '실시간 버스', icon: '🚌' },
        { id: 'about', label: '소개', icon: 'ℹ️' }
    ];

    return (
        <nav className="bottom-nav">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => onTabChange(tab.id)}
                >
                    <span className="nav-icon">{tab.icon}</span>
                    <span className="nav-label">{tab.label}</span>
                </button>
            ))}
            <style>{`
                .bottom-nav {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 80px; /* Increased height */
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    border-top: 1px solid rgba(0,0,0,0.1);
                    z-index: 1000;
                    padding-bottom: 20px; /* Safe area padding */
                }
                .nav-item {
                    border: none;
                    background: none;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px; /* Increased gap */
                    color: #8e8e93;
                    cursor: pointer;
                    padding: 8px;
                    transition: all 0.2s ease;
                }
                .nav-item.active {
                    color: #007aff;
                    transform: translateY(-2px);
                }
                .nav-icon {
                    font-size: 1.6rem; /* Larger icons */
                }
                .nav-label {
                    font-size: 0.8rem; /* Larger text */
                    font-weight: 600;
                }
            `}</style>
        </nav>
    );
};

export default BottomNav;
