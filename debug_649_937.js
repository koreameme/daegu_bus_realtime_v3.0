import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SERVICE_KEY = process.env.VITE_DAEGU_BUS_SERVICE_KEY;
const BASE_URL = 'https://apis.data.go.kr/6270000/dbmsapi02';

async function debugRoutes(routeNos) {
    console.log('--- Debugging Routes 649 and 937 ---');

    // Step 1: Get all routes to find candidates
    const basicUrl = `${BASE_URL}/getBasic02?serviceKey=${SERVICE_KEY}&pageNo=1&numOfRows=10000`;
    console.log('Fetching all routes...');
    const basicResponse = await axios.get(basicUrl);
    const allRoutes = basicResponse.data.body?.items?.route || [];

    for (const routeNo of routeNos) {
        console.log(`\n=== Analyzing Route ${routeNo} ===`);
        const candidates = allRoutes.filter(r => r.routeNo === routeNo);
        console.log(`Found ${candidates.length} candidates:`, candidates.map(c => c.routeId));

        for (const candidate of candidates) {
            console.log(`\nChecking routeId: ${candidate.routeId} (${candidate.routeNote || 'No Note'})`);

            // Get positions
            const posUrl = `${BASE_URL}/getPos02?serviceKey=${SERVICE_KEY}&routeId=${candidate.routeId}`;
            try {
                const posResponse = await axios.get(posUrl);
                const locations = posResponse.data.body?.items || [];
                console.log(`📍 Bus locations: ${locations.length} buses`);
                if (locations.length > 0) {
                    locations.slice(0, 3).forEach((loc, idx) => {
                        console.log(`  Bus ${idx + 1}: ${loc.vhcNo || loc.vhcNo2} at ${loc.bsNm} (ID: ${loc.bsId}, Dir: ${loc.moveDir})`);
                    });
                }
            } catch (err) {
                console.log(`  ❌ Failed to fetch positions: ${err.message}`);
            }

            // Get stations (just to see if they exist)
            const stationUrl = `${BASE_URL}/getBs02?serviceKey=${SERVICE_KEY}&routeId=${candidate.routeId}`;
            try {
                const stationResponse = await axios.get(stationUrl);
                const stations = stationResponse.data.body?.items || [];
                console.log(`🚏 Stations: ${stations.length} stations`);
            } catch (err) {
                console.log(`  ❌ Failed to fetch stations: ${err.message}`);
            }
        }
    }
}

debugRoutes(['649', '937']).catch(console.error);
