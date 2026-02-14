import React, { useState, useEffect, useRef } from 'react';
import StationArrivals from './components/StationArrivals.jsx';
import BusRouteTracker from './components/BusRouteTracker.jsx';
import AboutPage from './components/AboutPage.jsx';
import CalendarTab from './components/CalendarTab.jsx';
import BottomNav from './components/BottomNav.jsx';
import GoogleAd from './components/GoogleAd.jsx';
import './App.css';

function App() {
    const [activeTab, setActiveTab] = useState('timetable');
    const containerRef = useRef(null);
    const touchStart = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleTouchStart = (e) => {
            touchStart.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
                time: Date.now()
            };
        };

        const handleTouchEnd = (e) => {
            if (!touchStart.current) return;

            const touchEnd = {
                x: e.changedTouches[0].clientX,
                y: e.changedTouches[0].clientY,
                time: Date.now()
            };

            const dx = touchStart.current.x - touchEnd.x;
            const dy = touchStart.current.y - touchEnd.y;
            const dt = touchEnd.time - touchStart.current.time;

            // Thresholds
            const minDistance = 50;
            const maxTime = 300; // Swipe must be fast

            if (dt < maxTime && Math.abs(dx) > minDistance && Math.abs(dx) > Math.abs(dy) * 1.5) {
                const tabOrder = ['timetable', 'calendar', 'realtime', 'about'];
                const currentIndex = tabOrder.indexOf(activeTab);

                if (dx > 0 && currentIndex < tabOrder.length - 1) {
                    setActiveTab(tabOrder[currentIndex + 1]);
                } else if (dx < 0 && currentIndex > 0) {
                    setActiveTab(tabOrder[currentIndex - 1]);
                }
            }

            touchStart.current = null;
        };

        // Use native listeners to bypass React's event pooling and potential scroll conflicts
        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, [activeTab]);

    console.log('[App] Current Active Tab:', activeTab);

    return (
        <div className="App">
            <div className="content-container" ref={containerRef}>
                <div className={`tabs-slider ${activeTab}`}>
                    <div className="tab-pane">
                        <StationArrivals />
                    </div>
                    <div className="tab-pane">
                        <CalendarTab />
                    </div>
                    <div className="tab-pane">
                        <BusRouteTracker />
                    </div>
                    <div className="tab-pane">
                        <AboutPage />
                    </div>
                </div>
            </div>
            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
            <GoogleAd />
        </div>
    );
}

export default App;
