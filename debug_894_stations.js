import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SERVICE_KEY = process.env.VITE_DAEGU_BUS_SERVICE_KEY;
const BASE_URL = 'https://apis.data.go.kr/6270000/dbmsapi02';

async function debug894Stations() {
    console.log('--- Debugging Route 894 Stations ---\n');
    const routeId = '3000894000';

    const stationUrl = `${BASE_URL}/getBs02?serviceKey=${SERVICE_KEY}&routeId=${routeId}`;
    const stationResponse = await axios.get(stationUrl);
    const rawItems = stationResponse.data.body?.items;
    const stations = Array.isArray(rawItems) ? rawItems : (rawItems ? [rawItems] : []);

    const upbound = stations.filter(s => s.moveDir === '0');
    const downbound = stations.filter(s => s.moveDir === '1');

    console.log(`Route 894 (ID: ${routeId}) Statistics:`);
    console.log(`  Upbound stations (0): ${upbound.length}`);
    console.log(`  Downbound stations (1): ${downbound.length}`);
    console.log('');

    if (upbound.length > 0) {
        console.log(`Upbound first 3:`);
        upbound.slice(0, 3).forEach(s => console.log(`  - ${s.bsNm}`));
        console.log(`Upbound last 3:`);
        upbound.slice(-3).forEach(s => console.log(`  - ${s.bsNm}`));
    }

    console.log('');

    if (downbound.length > 0) {
        console.log(`Downbound first 3:`);
        downbound.slice(0, 3).forEach(s => console.log(`  - ${s.bsNm}`));
        console.log(`Downbound last 3:`);
        downbound.slice(-3).forEach(s => console.log(`  - ${s.bsNm}`));
    }
}

debug894Stations().catch(console.error);
