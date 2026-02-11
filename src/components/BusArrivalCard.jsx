/* src/components/BusArrivalCard.jsx */
import React from 'react';

const BusArrivalCard = ({ routeNo, arrTime, arrPrevStationCnt }) => {
    const minutes = Math.floor(arrTime / 60);
    const seconds = arrTime % 60;

    return (
        <div className="bus-card">
            <div className="bus-info-main">
                <div className="bus-route-no">{routeNo}</div>
                <div className="bus-station-info">{arrPrevStationCnt} 정류장 전</div>
            </div>
            <div className="bus-arrival-time">
                <div className="time-value">
                    {minutes > 0 ? `${minutes}분 ` : ''}
                    {seconds}초
                </div>
                <div className="time-unit">후 도착</div>
            </div>
        </div>
    );
};

export default BusArrivalCard;
