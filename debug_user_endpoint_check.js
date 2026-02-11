import axios from 'axios';

const SERVICE_KEY = 'aac18bb3e975832f34707abcdc088134737efa3ae67f039ba6b842fc0f7ecdd6';
const GYEONGSAN_ROUTE_ID = '3601031100'; // 100-1

const ENDPOINTS = [
    // 1. User Suggested Service Name
    `http://apis.data.go.kr/6270000/daeguBusRouteInfo/getRouteNoList?serviceKey=${SERVICE_KEY}&pageNo=1&numOfRows=10&routeNo=100-1`,
    `http://apis.data.go.kr/6270000/daeguBusRouteInfo/getBusPosList?serviceKey=${SERVICE_KEY}&pageNo=1&numOfRows=10&routeId=${GYEONGSAN_ROUTE_ID}`,

    // 2. Bus Location Info Service Name (Generic)
    `http://apis.data.go.kr/6270000/busLocationInfo/getBusLocationList?serviceKey=${SERVICE_KEY}&pageNo=1&numOfRows=10&routeId=${GYEONGSAN_ROUTE_ID}`,
    `http://apis.data.go.kr/6270000/busLocationInfo/getBusPosList?serviceKey=${SERVICE_KEY}&pageNo=1&numOfRows=10&routeId=${GYEONGSAN_ROUTE_ID}`,

    // 3. DBMSAPI02 (Current, but checking other operations)
    `http://apis.data.go.kr/6270000/dbmsapi02/getBusPosList?serviceKey=${SERVICE_KEY}&pageNo=1&numOfRows=10&routeId=${GYEONGSAN_ROUTE_ID}`,

    // 4. Daegu Bus Info (Legacy?)
    `http://apis.data.go.kr/6270000/dgbus/getBusPos?serviceKey=${SERVICE_KEY}&routeId=${GYEONGSAN_ROUTE_ID}`,
];

async function checkEndpoints() {
    for (const url of ENDPOINTS) {
        console.log(`\nTesting: ${url.split('?')[0]}...`);
        try {
            const response = await axios.get(url, { timeout: 5000 });
            console.log(`Status: ${response.status}`);
            if (response.data) {
                const dataStr = JSON.stringify(response.data);
                if (dataStr.includes('<errMsg>SERVICE ERROR</errMsg>')) {
                    console.log('Result: SERVICE ERROR');
                } else if (dataStr.includes('LIMITED NUMBER OF SERVICE REQUESTS EXCEEDS ERROR')) {
                    console.log('Result: RATE LIMIT EXCEEDED');
                } else if (dataStr.includes('SERVICE_KEY_IS_NOT_REGISTERED_ERROR')) {
                    console.log('Result: KEY NOT REGISTERED');
                } else {
                    console.log('Result: SUCCESS (or valid response)');
                    console.log('Preview:', dataStr.substring(0, 200));
                }
            }
        } catch (error) {
            console.log(`Error: ${error.message}`);
            if (error.response) {
                console.log(`Response Status: ${error.response.status}`);
            }
        }
    }
}

checkEndpoints();
