import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SERVICE_KEY = process.env.VITE_DAEGU_BUS_SERVICE_KEY;
const BASE_URL = 'https://apis.data.go.kr/6270000/dbmsapi02';

async function debug894() {
    console.log('--- Debugging Route 894 ---\n');

    // 1. Find all route IDs for 894
    const basicUrl = `${BASE_URL}/getBasic02?serviceKey=${SERVICE_KEY}&pageNo=1&numOfRows=10000`;
    const basicResponse = await axios.get(basicUrl);
    const routes = basicResponse.data.body?.items?.route || [];
    const targets = routes.filter(r => r.routeNo === '894');

    console.log(`Found ${targets.length} candidates for 894:`);
    targets.forEach(t => console.log(`  - ID: ${t.routeId}, Note: ${t.routeNote || 'N/A'}`));
    console.log('');

    // 2. Check bus positions for each ID
    for (const target of targets) {
        console.log(`Checking positions for ID: ${target.routeId} (${target.routeNote})...`);
        const posUrl = `${BASE_URL}/getPos02?serviceKey=${SERVICE_KEY}&routeId=${target.routeId}`;
        try {
            const posResponse = await axios.get(posUrl);
            const rawItems = posResponse.data.body?.items;
            const locations = Array.isArray(rawItems) ? rawItems : (rawItems ? [rawItems] : []);

            console.log(`  Total buses: ${locations.length}`);
            locations.forEach((loc, idx) => {
                console.log(`    Bus ${idx + 1}: vehNo=${loc.vhcNo || loc.vhcNo2}, moveDir=${loc.moveDir}, BS=${loc.bsNm}`);
            });
        } catch (error) {
            console.log(`  Error fetching positions for ${target.routeId}: ${error.message}`);
        }
        console.log('');
    }
}

debug894().catch(console.error);
