import React, { useState, useEffect } from 'react';
import { Trash2, Calendar, FileDown, List, Grid, Bus } from 'lucide-react';
import * as XLSX from 'xlsx';
import './CalendarTab.css';

const CalendarTab = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [schedules, setSchedules] = useState([]);
    const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'

    useEffect(() => {
        const loadSchedules = () => {
            const saved = JSON.parse(localStorage.getItem('busSchedules') || '[]');
            setSchedules(saved);
        };

        loadSchedules();

        window.addEventListener('busScheduleUpdated', loadSchedules);
        return () => window.removeEventListener('busScheduleUpdated', loadSchedules);
    }, []);

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const deleteSchedule = (id) => {
        const updated = schedules.filter(s => s.id !== id);
        localStorage.setItem('busSchedules', JSON.stringify(updated));
        setSchedules(updated);
        window.dispatchEvent(new Event('busScheduleUpdated'));
    };

    const handleExportExcel = () => {
        if (schedules.length === 0) {
            alert('저장된 일정이 없습니다.');
            return;
        }

        const dataToExport = schedules.map(s => ({
            '날짜': s.date,
            '노선': `${s.route}번`,
            '근무': s.shift === 'morning' ? '오전반' : '오후반',
            '순번': s.sequence,
            '차량번호': s.vehicleNumber ? `19${s.vehicleNumber.replace('19', '')}` : '',
            '교대자': s.reliefDriver || '',
            '시작 시간': s.startTime,
            '종료 시간': s.endTime
        }));

        // Sort by date
        dataToExport.sort((a, b) => new Date(a['날짜']) - new Date(b['날짜']));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "근무일정");

        XLSX.writeFile(wb, "버스근무일정.xlsx");
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const days = [];
    // Helper function to get schedules for a specific date
    const getEventsForDay = (day) => {
        if (!day) return []; // For empty cells
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return schedules.filter(s => s.date === dateStr);
    };

    const calendarDays = [];
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    // Empty cells before first day
    for (let i = 0; i < startDay; i++) {
        calendarDays.push(null); // Use null for empty cells
    }

    // Days of the month
    for (let d = 1; d <= totalDays; d++) {
        calendarDays.push(d);
    }

    return (
        <div className="calendar-tab-container">
            <div className="calendar-header">
                <div className="header-top">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                        <Calendar className="icon" />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <h1>근무 달력</h1>
                            <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: '500' }}>
                                오늘: {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                            </span>
                        </div>
                    </div>
                    <div className="header-actions">
                        <div className="view-toggle">
                            <button
                                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                            >
                                <List size={18} />
                            </button>
                            <button
                                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                            >
                                <Grid size={18} />
                            </button>
                        </div>
                        <button className="export-btn" onClick={handleExportExcel}>
                            <FileDown size={18} />
                            엑셀 저장
                        </button>
                    </div>
                </div>

                <div className="month-nav">
                    <button onClick={prevMonth}>&lt;</button>
                    <h2>{currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월</h2>
                    <button onClick={nextMonth}>&gt;</button>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <div className="calendar-grid">
                    {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                        <div key={d} className="weekday">{d}</div>
                    ))}
                    {(() => {
                        const days = [];
                        const totalDays = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
                        const startDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

                        for (let i = 0; i < startDay; i++) {
                            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
                        }

                        for (let d = 1; d <= totalDays; d++) {
                            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                            const daySchedules = schedules.filter(s => s.date === dateStr);

                            days.push(
                                <div key={d} className="calendar-day">
                                    <span className="day-number">{d}</span>
                                    <div className="day-events">
                                        {daySchedules.map(s => (
                                            <div key={s.id} className={`event-tag ${s.shift}`}>
                                                <div className="event-info">
                                                    {s.shift === 'off' ? (
                                                        <span className="event-route">휴무</span>
                                                    ) : (
                                                        <>
                                                            <span className="event-route">{s.route}번</span>
                                                            <span className="event-seq">{s.shift === 'morning' ? '오전' : '오후'} {s.sequence}번 ({s.dayType})</span>
                                                            {s.vehicleNumber && (
                                                                <span className="event-vehicle">
                                                                    {s.vehicleNumber}호
                                                                    {s.reliefDriver && ` (${s.reliefDriver})`}
                                                                </span>
                                                            )}
                                                            <span className="event-time-display">{s.startTime}~{s.endTime}</span>
                                                        </>
                                                    )}
                                                </div>
                                                {/* 삭제 버튼은 캘린더 형식에서 보이지 않도록 제거 */}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        }
                        return days;
                    })()}
                </div>
            ) : (
                <div className="calendar-list-view">
                    {(() => {
                        // Filter events for current month
                        const currentMonthEvents = schedules.filter(s => {
                            const d = new Date(s.date);
                            return d.getMonth() === currentDate.getMonth() &&
                                d.getFullYear() === currentDate.getFullYear();
                        });

                        // Sort events by date
                        currentMonthEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

                        if (currentMonthEvents.length === 0) {
                            return <div className="no-data">이 달의 근무 일정이 없습니다.</div>;
                        }

                        // Group by date
                        const eventsByDate = {};
                        currentMonthEvents.forEach(s => {
                            if (!eventsByDate[s.date]) eventsByDate[s.date] = [];
                            eventsByDate[s.date].push(s);
                        });

                        return Object.keys(eventsByDate).sort().map(dateStr => {
                            const dateObj = new Date(dateStr);
                            const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][dateObj.getDay()];
                            const events = eventsByDate[dateStr];

                            return (
                                <div key={dateStr} className="list-day-group">
                                    <div className={`list-date-header ${dayOfWeek === '일' ? 'sunday' : dayOfWeek === '토' ? 'saturday' : ''}`}>
                                        <span className="date-num">{dateObj.getDate()}</span>
                                        <span className="day-txt">({dayOfWeek})</span>
                                    </div>
                                    <div className="list-events-container">
                                        {events.map(s => (
                                            <div key={s.id} className={`list-event-card ${s.shift}`}>
                                                <div className="list-card-header">
                                                    {s.shift === 'off' ? (
                                                        <span className="route-badge" style={{ color: '#4b5563' }}>휴무</span>
                                                    ) : (
                                                        <>
                                                            <span className="route-badge">{s.route}번</span>
                                                            <span className="shift-badge">
                                                                {s.shift === 'morning' ? '오전' : '오후'} {s.sequence}번 ({s.dayType})
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="list-card-body">
                                                    {s.shift !== 'off' ? (
                                                        <>
                                                            <div className="info-row">
                                                                <span className="label">차량:</span>
                                                                <span className="value">
                                                                    {s.vehicleNumber}호
                                                                    {s.reliefDriver && ` (교대: ${s.reliefDriver})`}
                                                                </span>
                                                            </div>
                                                            <div className="info-row">
                                                                <span className="label">시간:</span>
                                                                <span className="value">{s.startTime} ~ {s.endTime}</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="info-row">
                                                            <span className="value" style={{ color: '#6b7280' }}>오늘은 휴무일입니다.</span>
                                                        </div>
                                                    )}

                                                    {s.memo && (
                                                        <div className="info-row" style={{ marginTop: '0.25rem', borderTop: '1px dashed rgba(0,0,0,0.1)', paddingTop: '0.25rem' }}>
                                                            <span className="label">메모:</span>
                                                            <span className="value">{s.memo}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <button className="list-del-btn" onClick={() => deleteSchedule(s.id)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        });
                    })()}
                </div>
            )}

            {schedules.length === 0 && (
                <div className="no-data">
                    <Bus size={48} className="empty-icon" />
                    <p>저장된 근무 일정이 없습니다.<br />시간표 탭에서 일정을 추가해보세요!</p>
                </div>
            )}
        </div>
    );
};

export default CalendarTab;
