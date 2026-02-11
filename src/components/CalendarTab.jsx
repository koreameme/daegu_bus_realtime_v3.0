import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Trash2, Clock, Bus } from 'lucide-react';
import './CalendarTab.css';

const CalendarTab = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [schedules, setSchedules] = useState([]);

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
        if (window.confirm('이 일정을 삭제하시겠습니까?')) {
            const updated = schedules.filter(s => s.id !== id);
            setSchedules(updated);
            localStorage.setItem('busSchedules', JSON.stringify(updated));
            window.dispatchEvent(new Event('busScheduleUpdated'));
        }
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const days = [];
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    // Empty cells before first day
    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let d = 1; d <= totalDays; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const daySchedules = schedules.filter(s => s.date === dateStr);

        days.push(
            <div key={d} className={`calendar-day ${daySchedules.length > 0 ? 'has-event' : ''}`}>
                <span className="day-number">{d}</span>
                <div className="day-events">
                    {daySchedules.map(s => (
                        <div key={s.id} className={`event-tag ${s.shift}`}>
                            <div className="event-info">
                                <span className="event-route">{s.route}번</span>
                                <span className="event-seq">{s.shift === 'morning' ? '오전' : '오후'} {s.sequence}번</span>
                                {s.vehicleNumber && <span className="event-vehicle">{s.vehicleNumber}호</span>}
                                <span className="event-time-display">{s.startTime}~{s.endTime}</span>
                            </div>
                            <button className="del-btn" onClick={() => deleteSchedule(s.id)}>
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="calendar-tab-container">
            <div className="calendar-header">
                <div className="header-top">
                    <CalendarIcon className="icon" />
                    <h1>근무 달력</h1>
                </div>
                <div className="month-nav">
                    <button onClick={prevMonth}><ChevronLeft /></button>
                    <h2>{year}년 {month + 1}월</h2>
                    <button onClick={nextMonth}><ChevronRight /></button>
                </div>
            </div>

            <div className="calendar-grid">
                <div className="weekday">일</div>
                <div className="weekday">월</div>
                <div className="weekday">화</div>
                <div className="weekday">수</div>
                <div className="weekday">목</div>
                <div className="weekday">금</div>
                <div className="weekday">토</div>
                {days}
            </div>

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
