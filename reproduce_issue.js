import axios from 'axios';

const SERVICE_KEY = 'aac18bb3e975832f34707abcdc088134737efa3ae67f039ba6b842fc0f7ecdd6';
const BASE_URL = 'https://apis.data.go.kr/6270000/dbmsapi02';

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getRouteId(routeNo) {
    const url = `${BASE_URL}/getBasic02?serviceKey=${SERVICE_KEY}&pageNo=1&numOfRows=10000`;

    try {
        const response = await axios.get(url);
        const data = response.data;
        const routes = data.body?.items?.route || [];

        // Find all matches with looser comparison
        const targets = routes.filter(r => String(r.routeNo).trim() === String(routeNo).trim());

        if (targets.length > 0) {
            console.log(`[Debug] Found ${targets.length} candidates for ${routeNo}:`);
            targets.forEach(t => console.log(` - ID: ${t.routeId}, No: ${t.routeNo}, Type: ${t.routeTp}, Start: ${t.startNode}, End: ${t.endNode}`));

            const bestTarget = targets.find(r => r.routeId && r.routeId.startsWith('300') && r.routeId.endsWith('000'))
                || targets.find(r => r.routeId && r.routeId.endsWith('000'))
                || targets[0];

            console.log(`[Debug] Selected: ${bestTarget.routeId}`);
            return bestTarget.routeId;
        }
        return null;
    } catch (error) {
        console.error(`[Error] Route search failed: ${error.message}`);
        return null;
    }
}

async function getRouteStations(routeId) {
    const url = `${BASE_URL}/getBs02?serviceKey=${SERVICE_KEY}&routeId=${routeId}`;
    try {
        const response = await axios.get(url);
        const items = response.data.body?.items || [];
        console.log(`[Debug] Stations for ${routeId}: ${items.length} found.`);
        if (items.length > 0) {
            console.log('[Debug] First 3 stations:');
            items.slice(0, 3).forEach(s => console.log(` - ${s.bsNm} (${s.bsId}) seq:${s.seq} moveDir:${s.moveDir}`));
        }
        return items;
    } catch (error) {
        console.error(`[Error] Station fetch failed: ${error.message}`);
        return [];
    }
}

async function test() {
    console.log("Testing search for 818 (Gyeongsan bus)...");
    const routeId = await getRouteId("818");

    if (routeId) {
        await delay(1000); // respect rate limit
        await getRouteStations(routeId);
    }
}

test();
