
import React from 'react';
import { Info, Smartphone, CheckCircle, Bus } from 'lucide-react';
import './AboutPage.css';

const AboutPage = () => {
    return (
        <div className="about-container" style={{ paddingBottom: '80px' }}>
            <div className="info-card">
                <div className="header">
                    <Info className="icon" />
                    <h1>소개</h1>
                </div>
                <h2 className="app-title">
                    <Bus style={{ width: '1.5rem', height: '1.5rem', verticalAlign: 'middle', marginRight: '0.5rem' }} />
                    대구 버스 리얼타임
                </h2>
                <p className="description">
                    이 앱은 대구광역시의 시내버스 실시간 운행 정보를 제공합니다.
                    정류장 별 도착 정보와 노선 별 버스 위치를 확인할 수 있습니다.
                </p>
                <div className="version">
                    버전 1.0.0
                </div>
            </div>

            <div className="info-card" style={{ background: '#f9fafb' }}>
                <h3 className="feature-title">
                    <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: '#10b981' }} />
                    제공 기능
                </h3>
                <ul className="feature-list">
                    <li>실시간(5초간격) 도착 시간 조회</li>
                    <li>버스 노선별 실시간 위치 추적</li>
                    <li>상행/하행 노선 필터링</li>
                    <li>백그라운드 데이터 절약 모드</li>
                    <li><strong>New!</strong> 근무 달력 연동 (오전/오후 반별 시간 자동 입력)</li>
                    <li><strong>New!</strong> 달력 위젯을 통한 근무 일정 관리</li>
                </ul>
            </div>
        </div>
    );
};

export default AboutPage;
