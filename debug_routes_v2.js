import axios from 'axios';

const SERVICE_KEY = 'aac18bb3e975832f34707abcdc088134737efa3ae67f039ba6b842fc0f7ecdd6';
const BASE_URL = 'https://apis.data.go.kr/6270000/dbmsapi02';

async function checkRoutes() {
    const url = `${BASE_URL}/getBasic02?serviceKey=${SERVICE_KEY}&pageNo=1&numOfRows=10000`;
    console.log(`Fetching from: ${url}`);

    try {
        const response = await axios.get(url);
        const routes = response.data.body?.items?.route || [];
        console.log(`Total routes found: ${routes.length}`);

        // Check for 818 (Gyeongsan), 401 (Daegu), 708 (Daegu)
        const targets = ['818', '401', '708', '100-1'];

        targets.forEach(target => {
            const matches = routes.filter(r => r.routeNo.trim() === target);
            console.log(`\n--- Matches for ${target} ---`);
            matches.forEach(m => {
                console.log(`Route ID: ${m.routeId}, No: ${m.routeNo}`);
            });
        });

    } catch (error) {
        console.error("Error:", error.message);
    }
}

checkRoutes();
