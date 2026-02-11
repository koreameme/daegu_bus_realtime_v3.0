import axios from 'axios';

const SERVICE_KEY = 'aac18bb3e975832f34707abcdc088134737efa3ae67f039ba6b842fc0f7ecdd6';
const BASE_URL = 'https://apis.data.go.kr/6270000/dbmsapi02';

async function checkArrivals() {
    const routeId = '3601050020'; // 818
    // 1. Get Stations
    const stationsUrl = `${BASE_URL}/getBs02?serviceKey=${SERVICE_KEY}&routeId=${routeId}`;
    console.log(`\nFetching stations for 818 (${routeId})...`);

    try {
        const response = await axios.get(stationsUrl);
        const items = response.data.body?.items;

        if (!items || items.length === 0) {
            console.log("No stations found for 818.");
            return;
        }

        console.log(`Found ${items.length} stations. Picking a few samples...`);
        // Pick a few stations (e.g., middle of route)
        const targetStation = items[Math.floor(items.length / 2)];
        console.log(`Testing station: ${targetStation.bsNm} (${targetStation.bsId})`);

        // 2. Get Arrivals for this station
        const arrivalUrl = `${BASE_URL}/getRealtime02?serviceKey=${SERVICE_KEY}&bsId=${targetStation.bsId}&pageNo=1&numOfRows=50`;
        console.log(`Fetching arrivals...`);

        const arrResponse = await axios.get(arrivalUrl);
        const arrItems = arrResponse.data.body?.items;

        if (!arrItems) {
            console.log("No arrivals found.");
        } else {
            const arriving818 = arrItems.filter(a => a.routeNo.trim() === '818');
            console.log(`Total arrivals: ${arrItems.length}. 818 Arrivals: ${arriving818.length}`);
            if (arriving818.length > 0) {
                console.log(arriving818[0]);
            }
        }

    } catch (error) {
        console.error("Error:", error.message);
    }
}

checkArrivals();
