import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const RAW_KEY = process.env.VITE_DAEGU_BUS_SERVICE_KEY;
const STATION_URL = 'https://apis.data.go.kr/6270000/dgBusStationService/getStationList';

async function testEncoding(key, label) {
    console.log(`--- Testing with ${label} ---`);
    const encodedNm = encodeURIComponent('대구역');
    const url = `${STATION_URL}?serviceKey=${key}&stationNm=${encodedNm}&pageNo=1&numOfRows=1`;

    try {
        const res = await axios.get(url);
        console.log(`[${label}] Success! Status: ${res.status}`);
        console.log(`[${label}] Snippet: ${String(res.data).substring(0, 100)}`);
    } catch (err) {
        console.log(`[${label}] Failed: ${err.message}`);
        if (err.response) console.log(`[${label}] Error Data:`, err.response.data);
    }
    console.log('\n');
}

async function runTests() {
    // Test 1: Raw as provided
    await testEncoding(RAW_KEY, 'Raw Key');

    // Test 2: Encoded once
    await testEncoding(encodeURIComponent(RAW_KEY), 'Encoded Key');
}

runTests();
