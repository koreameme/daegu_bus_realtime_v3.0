import React, { useState, useEffect } from 'react';
import RouteSearch from './RouteSearch.jsx';
import { getBusArrivals, getRouteId, getRouteLocations, getRouteStations } from '../services/api_service.js';
import '../styles/BusArrival.css';

const FIXED_STATIONS = [
    '대구역', '중앙로역', '반월당역', '명덕역', '교대역',
    '영대병원역', '현충로역', '안지랑역', '대명역', '서부정류장역'
];

const RealTimeDashboard = () => {
    const [viewType, setViewType] = useState('station'); // 'station' or 'route'
    const [activeRouteId, setActiveRouteId] = useState(null);
    const [isPageVisible, setIsPageVisible] = useState(true);
    const [isUserActive, setIsUserActive] = useState(true);
    const activityTimeoutRef = React.useRef(null);

    const resetInactivityTimeout = () => {
        setIsUserActive(true);
        if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
        activityTimeoutRef.current = setTimeout(() => {
            console.log("[App] Inactivity timeout reached (1m)");
            setIsUserActive(false);
        }, 60000); // 1 minute
    };

    // Handle User Activity
    useEffect(() => {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        const handleActivity = () => resetInactivityTimeout();

        events.forEach(event => document.addEventListener(event, handleActivity));
        resetInactivityTimeout(); // Initial start

        return () => {
            events.forEach(event => document.removeEventListener(event, handleActivity));
            if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
        };
    }, []);

    // Initial Search: Fetches everything (Stations + Locations)
    const handleSearch = async (routeNo, resetDirection = true) => {
        setLoading(true);
        setViewType('route');
        setActiveRoute(routeNo);

        try {
            const routeId = await getRouteId(routeNo);
            if (routeId) {
                setActiveRouteId(routeId); // Store ID for polling

                // Fetch both locations and the full station list for the route
                const [locations, stations] = await Promise.all([
                    getRouteLocations(routeId),
                    getRouteStations(routeId)
                ]);

                console.log(`[Debug] Found ${locations.length} buses, ${stations.length} stations`);

                setRouteStations(stations);
                if (resetDirection) {
                    setSelectedDirection('all'); // Reset direction filter only for new searches
                }
                setBusLocations(locations.map((loc, idx) => ({
                    id: idx,
                    vehNo: loc.vehNo,
                    stationId: loc.stationId,
                    moveDir: loc.moveDir,
                    arTime: loc.arTime,
                    stationIdx: idx
                })));
            }
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    };

    // Polling Update: Fetches ONLY Locations
    const updateRouteLocations = async () => {
        if (!activeRouteId) return;

        try {
            const locations = await getRouteLocations(activeRouteId);
            setBusLocations(locations.map((loc, idx) => ({
                id: idx,
                vehNo: loc.vehNo,
                stationId: loc.stationId,
                moveDir: loc.moveDir,
                arTime: loc.arTime,
                stationIdx: idx
            })));
        } catch (error) {
            console.error("Polling update failed:", error);
        }
    };

    const fetchArrivals = async () => {
        // Only show loading on initial fetch or manual reset, not periodic updates
        if (stationArrivals.length === 0) setLoading(true);

        try {
            const arrivals = await getBusArrivals('7001001400'); // 대구역 (dbmsapi02)
            setStationArrivals(arrivals.map(arr => ({
                routeNo: arr.routeNo,
                arrTime: parseInt(arr.arrTime),
                arrPrevStationCnt: parseInt(arr.arrPrevStationCnt)
            })));
        } catch (error) {
            console.error("Fetch arrivals failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setViewType('station');
        setActiveRoute(null);
        setActiveRouteId(null);
        fetchArrivals();
    };

    const handleDirectionChange = async (direction) => {
        setSelectedDirection(direction);
        // Direction change is client-side filter only, no API recall needed usually
        // But if we want to refresh data:
        if (activeRouteId) {
            updateRouteLocations();
        }
    };

    // Handle Visibility Change
    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsPageVisible(!document.hidden);
            if (!document.hidden) {
                console.log("[App] Tab active, resuming polling");
                // Immediate refresh when coming back
                if (viewType === 'station') fetchArrivals();
                else if (viewType === 'route' && activeRouteId) updateRouteLocations();
            } else {
                console.log("[App] Tab hidden, pausing polling");
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [viewType, activeRouteId]);

    // 5-second Auto-refresh (Smart Polling)
    useEffect(() => {
        if (!isPageVisible || !isUserActive) return; // Stop polling if hidden or inactive

        const interval = setInterval(() => {
            if (viewType === 'station') {
                fetchArrivals();
            } else if (viewType === 'route' && activeRouteId) {
                updateRouteLocations(); // Only fetch locations!
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [viewType, activeRouteId, isPageVisible, isUserActive]);

    useEffect(() => {
        fetchArrivals();
    }, []);

    return (
        <div className="bus-arrival-container">
            <div style={{ marginBottom: '20px' }}>
                <RouteSearch
                    onSearch={handleSearch}
                    showReset={viewType === 'route'}
                    onReset={handleReset}
                />
            </div>

            <div className="real-time-header">
                <h2>
                    {viewType === 'station' ? '반경 실시간 도착' : `${activeRoute}번 노선 추적`}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {viewType === 'route' && (
                        <div style={{ display: 'flex', gap: '8px', marginRight: '12px' }}>
                            <button
                                onClick={() => handleDirectionChange('all')}
                                className={`direction-btn ${selectedDirection === 'all' ? 'active' : ''}`}
                            >
                                전체
                            </button>
                            <button
                                onClick={() => handleDirectionChange('0')}
                                className={`direction-btn ${selectedDirection === '0' ? 'active' : ''}`}
                            >
                                상행선
                            </button>
                            <button
                                onClick={() => handleDirectionChange('1')}
                                className={`direction-btn ${selectedDirection === '1' ? 'active' : ''}`}
                            >
                                하행선
                            </button>
                        </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(52, 199, 89, 0.1)', padding: '6px 12px', borderRadius: '20px' }}>
                        <div className="live-pulse"></div>
                        <span style={{ fontSize: '0.75rem', color: '#34c759', fontWeight: '900', letterSpacing: '0.5px' }}>LIVE</span>
                    </div>
                </div>
            </div>

            {loading && stationArrivals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#86868b' }}>
                    실시간 데이터를 불러오는 중...
                </div>
            ) : viewType === 'station' ? (
                <div className="arrival-list">
                    {stationArrivals.length > 0 ? (
                        stationArrivals.map((bus, index) => (
                            <div key={index} className="bus-card">
                                <div className="bus-info-main">
                                    <div className="bus-route-no" style={{ color: '#ff3b30' }}>{bus.routeNo}</div>
                                    <div className="bus-station-info">{bus.arrPrevStationCnt} 정류장 전</div>
                                </div>
                                <div className="bus-arrival-time">
                                    <div className="time-value">{Math.floor(bus.arrTime / 60)}분</div>
                                    <div className="time-unit">후 도착</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(0,0,0,0.03)', borderRadius: '20px', color: '#86868b' }}>
                            현재 대구역 주변에 운행 중인 버스가 어둡습니다.
                        </div>
                    )}
                </div>
            ) : (
                <div className="route-map-container">
                    <div className="route-track"></div>
                    {routeStations.length > 0 ? (
                        routeStations
                            .filter(station => selectedDirection === 'all' || station.moveDir === selectedDirection)
                            .map((station, idx) => {
                                const busesAtThisStation = busLocations.filter(b =>
                                    b.stationId === station.bsId &&
                                    (selectedDirection === 'all' || b.moveDir === selectedDirection)
                                );
                                return (
                                    <div key={idx} className={`station-item ${busesAtThisStation.length > 0 ? 'active' : ''}`}>
                                        <div className="station-marker"></div>
                                        <div className="station-name">{station.stationNm}</div>
                                        <div className="bus-tags-container">
                                            {busesAtThisStation.map((bus, bIdx) => {
                                                const directionColor = bus.moveDir === '0' ? '#ff3b30' : '#007aff';
                                                return (
                                                    <div
                                                        key={`${bus.id}-${bIdx}`}
                                                        className="bus-label"
                                                        style={{ backgroundColor: directionColor }}
                                                    >
                                                        {bus.vehNo}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {busesAtThisStation.map((bus, bIdx) => {
                                            const directionColor = bus.moveDir === '0' ? '#ff3b30' : '#007aff';
                                            return (
                                                <div
                                                    key={`icon-${bus.id}-${bIdx}`}
                                                    className="bus-icon-marker"
                                                    style={{ color: directionColor }}
                                                >
                                                    🚌
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#86868b' }}>
                            정류장 정보를 불러올 수 없거나 노선 정보가 없습니다.
                        </div>
                    )}
                </div>
            )}

            <style>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.4; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default RealTimeDashboard;
