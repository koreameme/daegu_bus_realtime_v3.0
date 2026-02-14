
import React from 'react';
import { Info, Smartphone, CheckCircle, Bus } from 'lucide-react';
import './AboutPage.css';

const AboutPage = () => {
    return (
        <div className="about-container" style={{ paddingBottom: '140px' }}>
            <div className="info-card">
                <div className="header">
                    <Info className="icon" />
                    <h1>소개</h1>
                </div>
                <h2 className="app-title">
                    <Bus style={{ width: '1.5rem', height: '1.5rem', verticalAlign: 'middle', marginRight: '0.5rem' }} />
                    대구버스(한일)
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
                    주요 기능 안내
                </h3>

                <div className="feature-group">
                    <h4><Bus style={{ width: '1rem', height: '1rem', marginRight: '0.4rem' }} /> 실시간 버스 정보</h4>
                    <ul className="feature-list">
                        <li>대구 시내버스 실시간(5초 간격) 도착 정보 조회</li>
                        <li>노선별 버스 실시간 위치 및 운행 현황 추적</li>
                        <li>상행/하행 노선 필터링 기능</li>
                        <li>사용자 활동 감지 및 탭 활성화 상태에 따른 데이터 절약 모드</li>
                    </ul>
                </div>

                <div className="feature-group" style={{ marginTop: '1.5rem' }}>
                    <h4>🕒 한일버스 운행 시간표</h4>
                    <ul className="feature-list">
                        <li>노선, 요일, 순번별 정밀 시간표 조회</li>
                        <li>회차별 주요 정류장 통과 예정 시간 확인</li>
                        <li>조회된 시간을 근무 달력에 즉시 연동 및 저장</li>
                    </ul>
                </div>

                <div className="feature-group" style={{ marginTop: '1.5rem' }}>
                    <h4>📅 근무 일정 및 달력</h4>
                    <ul className="feature-list">
                        <li>오전/오후/휴무 등 교대 근무 일정 관리</li>
                        <li>차량 번호(19XX) 및 교대자 성명 입력/검증 기능</li>
                        <li>일정별 메모 기록 및 상세 정보 모달 보기</li>
                        <li>저장된 전체 근무 일정 엑셀(Excel) 파일 내보내기</li>
                        <li>달력 뷰(그리드/리스트) 전환 및 실시간 데이터 업데이트</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
