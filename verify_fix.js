import axios from 'axios';

const SERVICE_KEY = 'aac18bb3e975832f34707abcdc088134737efa3ae67f039ba6b842fc0f7ecdd6';
const BASE_URL = 'https://apis.data.go.kr/6270000/dbmsapi02';

async function getRouteId(routeNo) {
    const url = `${BASE_URL}/getBasic02?serviceKey=${SERVICE_KEY}&pageNo=1&numOfRows=10000`;

    try {
        const response = await axios.get(url);
        const data = response.data;
        const routes = data.body?.items?.route || [];

        // Find all matches with looser comparison
        const targets = routes.filter(r => String(r.routeNo).trim() === String(routeNo).trim());

        if (targets.length > 0) {
            console.log(`[Debug] Found ${targets.length} candidates for ${routeNo}`);

            // NEW LOGIC FROM api_service.js
            const bestTarget = targets.find(r => r.routeId && r.routeId.startsWith('300') && r.routeId.endsWith('000'))
                || targets.find(r => r.routeId && r.routeId.startsWith('360') && r.routeId.endsWith('000')) // Try to find "clean" Gyeongsan ID if possible
                || targets.find(r => r.routeId && r.routeId.endsWith('000'))
                || targets[0]; // Fallback to first

            console.log(`[Debug] Selected: ${bestTarget.routeId} (Type: ${bestTarget.routeTp})`);
            return bestTarget.routeId;
        }

        console.warn(`[Debug] No route found for ${routeNo}`);
        return null;
    } catch (error) {
        console.error(`[Error] Route search failed: ${error.message}`);
        return null;
    }
}

async function test() {
    console.log("Testing search for 818 (Gyeongsan)...");
    await getRouteId("818");

    console.log("\nTesting search for 809 (Gyeongsan)...");
    await getRouteId("809");

    console.log("\nTesting search for 401 (Daegu)...");
    await getRouteId("401");
}

test();
