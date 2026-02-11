
import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, X, Clock } from 'lucide-react';

const RouteSearch = ({ onSearch, showReset, onReset }) => {
    const [query, setQuery] = useState('');
    const [history, setHistory] = useState([]);

    // Load history on mount
    useEffect(() => {
        const saved = localStorage.getItem('recent_bus_routes');
        if (saved) {
            setHistory(JSON.parse(saved));
        }
    }, []);

    const saveToHistory = (routeNo) => {
        const newHistory = [routeNo, ...history.filter(item => item !== routeNo)].slice(0, 5);
        setHistory(newHistory);
        localStorage.setItem('recent_bus_routes', JSON.stringify(newHistory));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            const trimmedQuery = query.trim();
            saveToHistory(trimmedQuery);
            onSearch(trimmedQuery);
        }
    };

    const handleHistoryClick = (routeNo) => {
        setQuery(routeNo);
        saveToHistory(routeNo);
        onSearch(routeNo);
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem('recent_bus_routes');
    };

    const handleReset = () => {
        setQuery('');
        if (onReset) onReset();
    };

    return (
        <div className="route-search-wrapper">
            <form onSubmit={handleSubmit} className="search-grid">
                <div className="form-group">
                    <label>노선 번호</label>
                    <input
                        type="text"
                        placeholder="예: 401, 급행1"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="search-input"
                    />
                </div>
            </form>

            <div className="button-group" style={{ marginTop: '1rem' }}>
                <button
                    type="submit"
                    className="search-btn"
                    onClick={handleSubmit}
                    disabled={!query.trim()}
                >
                    <Search style={{ width: '1.25rem', height: '1.25rem' }} />
                    조회하기
                </button>
                {showReset && (
                    <button
                        type="button"
                        className="reset-button reset-btn"
                        onClick={handleReset}
                    >
                        <RotateCcw style={{ width: '1.25rem', height: '1.25rem' }} />
                        초기화
                    </button>
                )}
            </div>

            {history.length > 0 && (
                <div className="recent-searches">
                    <div className="recent-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock style={{ width: '1rem', height: '1rem' }} />
                            <span>최근 검색</span>
                        </div>
                        <button onClick={clearHistory} className="clear-history">지우기</button>
                    </div>
                    <div className="recent-tags">
                        {history.map((route, index) => (
                            <button
                                key={index}
                                onClick={() => handleHistoryClick(route)}
                                className="recent-tag"
                            >
                                {route}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RouteSearch;
