import axios from 'axios';

const SERVICE_KEY = 'aac18bb3e975832f34707abcdc088134737efa3ae67f039ba6b842fc0f7ecdd6';

// User suggested URL structure
const URL_VARIANTS = [
    // 1. User's exact suggestion (Route Info)
    `http://apis.data.go.kr/6270000/daeguBusRouteInfo/getRouteNoList?serviceKey=${SERVICE_KEY}&pageNo=1&numOfRows=10&routeNo=100-1`,

    // 2. The one we are using (Basic02)
    `http://apis.data.go.kr/6270000/dbmsapi02/getBasic02?serviceKey=${SERVICE_KEY}&pageNo=1&numOfRows=10&routeNo=100-1`,

    // 3. Trying to find a "Location" service with the user's naming convention
    `http://apis.data.go.kr/6270000/daeguBusLocationInfo/getBusLocationList?serviceKey=${SERVICE_KEY}&pageNo=1&numOfRows=10&routeId=3601031100`, // Using ID for 100-1

    // 4. Standard TAGO pattern for location?
    `http://apis.data.go.kr/1613000/BusLcntnInfoInqireService/getRouteBusLcList?serviceKey=${SERVICE_KEY}&pageNo=1&numOfRows=10&cityCode=22&routeId=DGB3601031100` // 22 is Daegu? Guessing.
];

async function checkUrls() {
    for (const url of URL_VARIANTS) {
        console.log(`\nTesting: ${url}`);
        try {
            const response = await axios.get(url);
            console.log("Status:", response.status);
            console.log("Data:", JSON.stringify(response.data).substring(0, 500)); // Truncate
        } catch (error) {
            console.log("Error:", error.message);
            if (error.response) console.log("Response:", error.response.status, error.response.statusText);
        }
    }
}

checkUrls();
