
import React, { useState, useMemo } from 'react';
import { Bus, Calendar, Search, Clock, MapPin } from 'lucide-react';
import { busScheduleData, detailedScheduleData } from '../data/scheduleData';
import './HanilTimetable.css';

const HanilTimetable = () => {
    const [selectedRoute, setSelectedRoute] = useState('');
    const [selectedDay, setSelectedDay] = useState('');
    const [selectedNumber, setSelectedNumber] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedShift, setSelectedShift] = useState('morning'); // 'morning' or 'afternoon'
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [reliefDriver, setReliefDriver] = useState('');
    const [memo, setMemo] = useState('');
    const [searchResult, setSearchResult] = useState(null);

    // Get unique routes
    const routes = useMemo(() => {
        return [...new Set(busScheduleData.map(item => item.노선번호))];
    }, []);

    // Get days for selected route
    const days = useMemo(() => {
        if (!selectedRoute) return [];
        return busScheduleData
            .filter(item => item.노선번호 === selectedRoute)
            .map(item => item.요일);
    }, [selectedRoute]);

    // Get numbers for selected route and day
    const numbers = useMemo(() => {
        if (!selectedRoute || !selectedDay) return [];
        const schedule = busScheduleData.find(
            item => item.노선번호 === selectedRoute && item.요일 === selectedDay
        );
        return schedule ? schedule.상세운행.map(item => item.순번) : [];
    }, [selectedRoute, selectedDay]);

    const handleRouteChange = (e) => {
        setSelectedRoute(e.target.value);
        setSelectedDay('');
        setSelectedNumber('');
        setSearchResult(null);
    };

    const handleDayChange = (e) => {
        setSelectedDay(e.target.value);
        setSelectedNumber('');
        setSearchResult(null);
    };

    const handleNumberChange = (e) => {
        setSelectedNumber(e.target.value);
        setSearchResult(null);
    };

    const handleSearch = () => {
        if (!selectedRoute || !selectedDay || !selectedNumber) return;

        const schedule = busScheduleData.find(
            item => item.노선번호 === selectedRoute && item.요일 === selectedDay
        );

        if (schedule) {
            const detail = schedule.상세운행.find(item => item.순번 === parseInt(selectedNumber));
            const dayMapping = {
                '평일': '평일',
                '토요일,방학': '토요일',
                '휴일': '휴일',
                '평,토,휴일': '평,토,휴일'
            };
            const mappedDay = dayMapping[selectedDay] || selectedDay;
            const routeSchedule = detailedScheduleData[selectedRoute];
            let detailedInfo = null;

            if (routeSchedule && routeSchedule[mappedDay]) {
                const scheduleForNumber = routeSchedule[mappedDay].배차_데이터.find(
                    item => item.순번 === parseInt(selectedNumber)
                );
                if (scheduleForNumber) {
                    detailedInfo = {
                        stops: routeSchedule[mappedDay].정류장_목록,
                        turns: scheduleForNumber.회차
                    };
                }
            }

            setSearchResult({
                detail,
                detailedInfo
            });
        }
    };

    const handleReset = () => {
        setSelectedRoute('');
        setSelectedDay('');
        setSelectedNumber('');
        setSelectedDate(new Date().toISOString().split('T')[0]);
        setSelectedShift('morning');
        setVehicleNumber('');
        setReliefDriver('');
        setMemo('');
        setSearchResult(null);
    };

    const handleAddToCalendar = () => {
        if (!selectedDate) {
            alert('날짜를 선택해주세요.');
            return;
        }

        // Vehicle Number & Relief Driver Validation (Only if NOT 'Day Off')
        if (selectedShift !== 'off') {
            if (vehicleNumber.length !== 2) {
                alert('차량번호 뒷자리 2자리를 입력해주세요.');
                return;
            }
            if (reliefDriver && !/^[가-힣]+$/.test(reliefDriver)) {
                alert('교대자 이름은 한글로 입력해주세요.');
                return;
            }
        }

        const existingSchedules = JSON.parse(localStorage.getItem('busSchedules') || '[]');

        // Duplicate Date Check
        const isDuplicate = existingSchedules.some(s => s.date === selectedDate);
        if (isDuplicate) {
            // Optional: Ask for overwrite or just alert. For now, alert as per existing logic.
            alert('이미 해당 날짜에 일정이 저장되어 있습니다.');
            return;
        }

        // Logic to determine entry details
        // If 'off', we might not have route/sequence info if they didn't search first.
        // But the user might just want to save 'off' without searching.
        // We should allow saving 'off' even if searchResult is null.

        // However, if they DID search, we can include route info even for 'off' if we want,
        // but 'off' usually implies no work. Let's keep it simple: 'off' = no route info needed.

        const scheduleEntry = {
            id: Date.now(),
            date: selectedDate,
            shift: selectedShift,
            memo: memo,
            // Conditional fields
            route: selectedShift !== 'off' ? selectedRoute : '',
            dayType: selectedShift !== 'off' ? selectedDay : '',
            sequence: selectedShift !== 'off' ? selectedNumber : '',
            vehicleNumber: selectedShift !== 'off' ? `19${vehicleNumber}` : '',
            reliefDriver: selectedShift !== 'off' ? reliefDriver : '',
            startTime: (selectedShift !== 'off' && searchResult) ? (selectedShift === 'morning' ? searchResult.detail.오전근무 : searchResult.detail.교대시간) : '',
            endTime: (selectedShift !== 'off' && searchResult) ? (selectedShift === 'morning' ? searchResult.detail.교대시간 : searchResult.detail.오후근무) : '',
            fullDetail: (selectedShift !== 'off' && searchResult) ? searchResult.detail : null
        };

        const updatedSchedules = [...existingSchedules, scheduleEntry];
        localStorage.setItem('busSchedules', JSON.stringify(updatedSchedules));
        window.dispatchEvent(new Event('busScheduleUpdated'));

        const msg = selectedShift === 'off'
            ? `${selectedDate} 휴무가 달력에 저장되었습니다!`
            : `${selectedDate} ${selectedShift === 'morning' ? '오전반' : '오후반'} (19${vehicleNumber}호)으로 달력에 추가되었습니다!`;

        alert(msg);
    };

    return (
        <div className="hanil-timetable-container">
            <div className="search-card">
                <div className="header">
                    <Bus className="icon" />
                    <h1>한일 버스 운행 시간표</h1>
                </div>

                <div className="search-grid">
                    <div className="form-group">
                        <label>노선 선택</label>
                        <select value={selectedRoute} onChange={handleRouteChange}>
                            <option value="">선택하세요</option>
                            {routes.map(route => (
                                <option key={route} value={route}>{route}번</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>
                            <Calendar style={{ width: '1rem', height: '1rem' }} />
                            요일
                        </label>
                        <select
                            value={selectedDay}
                            onChange={handleDayChange}
                            disabled={!selectedRoute}
                        >
                            <option value="">선택하세요</option>
                            {days.map(day => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>순번</label>
                        <select
                            value={selectedNumber}
                            onChange={handleNumberChange}
                            disabled={!selectedDay}
                        >
                            <option value="">선택하세요</option>
                            {numbers.map(num => (
                                <option key={num} value={num}>{num}번</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="button-group-inline">
                    <button
                        className="search-btn"
                        onClick={handleSearch}
                        disabled={!selectedRoute || !selectedDay || !selectedNumber}
                    >
                        <Search style={{ width: '1.25rem', height: '1.25rem' }} />
                        조회하기
                    </button>
                    {searchResult && (
                        <button className="reset-btn" onClick={handleReset}>
                            초기화
                        </button>
                    )}
                </div>
            </div>

            <div className="content-wrapper">
                {/* 1. Save to Calendar Section (Persistent) */}
                <div className="save-calendar-card">
                    <div className="header">
                        <Calendar style={{ width: '1.5rem', height: '1.5rem', color: '#f59e0b' }} />
                        <h2 className="result-title">달력에 저장하기</h2>
                    </div>

                    <div className="form-group">
                        <label>
                            <Calendar style={{ width: '1rem', height: '1rem' }} />
                            근무 날짜
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>근무 반 선택</label>
                        <div className="shift-toggle three-way">
                            <button
                                className={`shift-btn ${selectedShift === 'morning' ? 'active' : ''}`}
                                onClick={() => setSelectedShift('morning')}
                            >
                                오전반
                            </button>
                            <button
                                className={`shift-btn ${selectedShift === 'afternoon' ? 'active' : ''}`}
                                onClick={() => setSelectedShift('afternoon')}
                            >
                                오후반
                            </button>
                            <button
                                className={`shift-btn ${selectedShift === 'off' ? 'active off' : ''}`}
                                onClick={() => setSelectedShift('off')}
                            >
                                휴무
                            </button>
                        </div>
                    </div>

                    {selectedShift !== 'off' && (
                        <div className="form-row-2col">
                            <div className="form-group">
                                <label>차량 번호</label>
                                <div className="vehicle-input-group">
                                    <span className="prefix">19</span>
                                    <input
                                        type="text"
                                        value={vehicleNumber}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^0-9]/g, '');
                                            if (val.length <= 2) setVehicleNumber(val);
                                        }}
                                        placeholder="XX"
                                        className="vehicle-input"
                                    />
                                    <span className="suffix">호</span>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>교대자 이름</label>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        value={reliefDriver}
                                        maxLength={4}
                                        onChange={(e) => setReliefDriver(e.target.value)}
                                        placeholder="이름"
                                        className="text-input"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label>메모 (선택)</label>
                        <input
                            type="text"
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            placeholder="간단한 메모 입력"
                            className="text-input full-width"
                        />
                    </div>

                    <div className="action-group">
                        <button className="add-calendar-btn" onClick={handleAddToCalendar}>
                            <Calendar style={{ width: '1.25rem', height: '1.25rem' }} />
                            저장하기
                        </button>
                    </div>
                </div>

                {/* 2. Schedule Result Section */}
                {searchResult && (
                    <div className="result-section">
                        <div className="result-card animate-fadeIn">
                            <div className="header">
                                <Clock style={{ width: '1.5rem', height: '1.5rem', color: '#4f46e5' }} />
                                <h2 className="result-title">근무 시간 정보</h2>
                            </div>
                            <div className="info-cards">
                                <div className={`info-card blue ${selectedShift === 'morning' ? 'highlight' : ''}`}>
                                    <div className="info-card-label">오전 근무</div>
                                    <div className="info-card-time">{searchResult.detail.오전근무}</div>
                                </div>
                                <div className="info-card amber highlight">
                                    <div className="info-card-label">교대 시간</div>
                                    <div className="info-card-time">{searchResult.detail.교대시간}</div>
                                </div>
                                <div className={`info-card purple ${selectedShift === 'afternoon' ? 'highlight' : ''}`}>
                                    <div className="info-card-label">오후 근무</div>
                                    <div className="info-card-time">{searchResult.detail.오후근무}</div>
                                </div>
                            </div>

                            <div className="meta-info">
                                <span>노선:</span> {selectedRoute}번 |
                                <span>요일:</span> {selectedDay} |
                                <span>순번:</span> {selectedNumber}번
                            </div>
                        </div>

                        {searchResult.detailedInfo && (
                            <div className="detail-table-card animate-fadeIn">
                                <div className="header">
                                    <MapPin style={{ width: '1.5rem', height: '1.5rem', color: '#10b981' }} />
                                    <h2 className="result-title">상세 시간표</h2>
                                </div>
                                <div className="table-wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>회차</th>
                                                {searchResult.detailedInfo.stops.map((stop, idx) => (
                                                    <th key={idx}>{stop}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {searchResult.detailedInfo.turns.map((turn, idx) => (
                                                <tr key={idx}>
                                                    <td className="turn-number">{turn.번호}회</td>
                                                    {turn.시간.map((time, tIdx) => (
                                                        <td key={tIdx} className={`time-cell ${time === '-' ? 'empty' : ''}`}>
                                                            {time}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="notice">
                                    <span>💡 안내:</span> 각 회차별로 정류장을 거쳐가는 시간이 표시됩니다.
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HanilTimetable;
