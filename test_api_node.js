import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import dotenv from 'dotenv';

dotenv.config();

const SERVICE_KEY = process.env.VITE_DAEGU_BUS_SERVICE_KEY;
const STATION_URL = 'https://apis.data.go.kr/6270000/dgBusStationService/getStationList';

async function findStation() {
    console.log('--- Step 1: Finding Station ID for "대구역" ---');
    const encodedNm = encodeURIComponent('대구역');
    const url = `${STATION_URL}?serviceKey=${SERVICE_KEY}&stationNm=${encodedNm}&pageNo=1&numOfRows=10`;

    try {
        const res = await axios.get(url);
        const parser = new XMLParser();
        const jsonObj = parser.parse(res.data);

        console.log('Search Result Header:', jsonObj.response?.header);
        const items = jsonObj.response?.body?.items?.item;

        if (items) {
            const list = Array.isArray(items) ? items : [items];
            list.forEach(item => {
                console.log(`- Station: ${item.stationNm}, ID: ${item.stationId}, No: ${item.stationNo}`);
            });
            return list[0].stationId;
        } else {
            console.log('No stations found matching "대구역".');
            return null;
        }
    } catch (err) {
        console.error('Station search failed:', err.message);
        if (err.response) console.error('Response:', err.response.data);
        return null;
    }
}

async function testArrive(stationId) {
    if (!stationId) return;
    console.log(`\n--- Step 2: Testing Arrival for ID ${stationId} ---`);
    const ARRIVAL_URL = 'https://apis.data.go.kr/6270000/dgBusArriveService/getBusArriveInfoList';
    const url = `${ARRIVAL_URL}?serviceKey=${SERVICE_KEY}&stopId=${stationId}&pageNo=1&numOfRows=10`;

    try {
        const res = await axios.get(url);
        const parser = new XMLParser();
        const jsonObj = parser.parse(res.data);
        console.log('Arrival Result Header:', jsonObj.response?.header);
    } catch (err) {
        console.error('Arrival test failed:', err.message);
        if (err.response) console.error('Response:', err.response.data);
    }
}

async function run() {
    const sid = await findStation();
    await testArrive(sid);
}

run();
