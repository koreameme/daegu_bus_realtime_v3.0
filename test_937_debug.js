import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SERVICE_KEY = process.env.VITE_DAEGU_BUS_SERVICE_KEY;
const BASE_URL = 'https://apis.data.go.kr/6270000/dbmsapi02';

async function testRoute937() {
    console.log('Testing route 937...\n');

    // Step 1: Get route ID
    const basicUrl = `${BASE_URL}/getBasic02?serviceKey=${SERVICE_KEY}&pageNo=1&numOfRows=10000`;
    const basicResponse = await axios.get(basicUrl);
    const routes = basicResponse.data.body?.items?.route || [];
    const route937 = { routeId: '3000937000' };

    if (!route937) {
        console.log('❌ Route 937 not found!');
        return;
    }

    console.log('✅ Route 937 found:', route937);
    console.log('Route ID:', route937.routeId);
    console.log('');

    // Step 2: Get bus locations
    const posUrl = `${BASE_URL}/getPos02?serviceKey=${SERVICE_KEY}&routeId=${route937.routeId}`;
    const posResponse = await axios.get(posUrl);
    const locations = posResponse.data.body?.items || [];

    const now = new Date();
    const nowStr = now.getHours().toString().padStart(2, '0') +
        now.getMinutes().toString().padStart(2, '0') +
        now.getSeconds().toString().padStart(2, '0');
    console.log('Current System Time:', nowStr);

    locations.forEach((loc, idx) => {
        console.log(`  Bus ${idx + 1}: vehNo=${loc.vhcNo2}, arTime=${loc.arTime}, diff=${parseInt(loc.arTime) - parseInt(nowStr)}`);
    });
}

testRoute937().catch(console.error);
