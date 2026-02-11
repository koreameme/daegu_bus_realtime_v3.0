
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
        setSearchResult(null);
    };

    const handleAddToCalendar = () => {
        if (!searchResult || !selectedDate) return;

        // Vehicle Number Validation
        if (vehicleNumber.length !== 2) {
            alert('차량번호 뒷자리 2자리를 입력해주세요.');
            return;
        }

        const existingSchedules = JSON.parse(localStorage.getItem('busSchedules') || '[]');

        // Duplicate Date Check
        const isDuplicate = existingSchedules.some(s => s.date === selectedDate);
        if (isDuplicate) {
            alert('이미 해당 날짜에 일정이 저장되어 있습니다.');
            return;
        }

        const scheduleEntry = {
            id: Date.now(),
            date: selectedDate,
            route: selectedRoute,
            dayType: selectedDay,
            sequence: selectedNumber,
            shift: selectedShift,
            vehicleNumber: `19${vehicleNumber}`,
            reliefDriver: reliefDriver,
            startTime: selectedShift === 'morning' ? searchResult.detail.오전근무 : searchResult.detail.교대시간,
            endTime: selectedShift === 'morning' ? searchResult.detail.교대시간 : searchResult.detail.오후근무,
            fullDetail: searchResult.detail
        };

        const updatedSchedules = [...existingSchedules, scheduleEntry];
        localStorage.setItem('busSchedules', JSON.stringify(updatedSchedules));
        window.dispatchEvent(new Event('busScheduleUpdated'));

        alert(`${selectedDate} ${selectedShift === 'morning' ? '오전반' : '오후반'} (19${vehicleNumber}호)으로 달력에 추가되었습니다!`);
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
            </div>
            <div className="button-group">
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

                        <div className="calendar-options-inline">
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
                                <div className="shift-toggle">
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
                                </div>
                            </div>

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
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                // Allow only Korean characters, max 4 length
                                                if (/^[가-힣]*$/.test(val) && val.length <= 4) {
                                                    setReliefDriver(val);
                                                }
                                            }}
                                            placeholder="이름"
                                            className="text-input"
                                        />
                                    </div>
                                </div>
                            </div>


                        </div>

                        <div className="action-group">
                            <button className="add-calendar-btn" onClick={handleAddToCalendar}>
                                <Calendar style={{ width: '1.25rem', height: '1.25rem' }} />
                                {selectedDate} {selectedShift === 'morning' ? '오전반' : '오후반'} 달력에 추가
                            </button>
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
    );
};

export default HanilTimetable;
