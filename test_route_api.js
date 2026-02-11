import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SERVICE_KEY = process.env.VITE_DAEGU_BUS_SERVICE_KEY;
const ROUTE_URL = 'https://apis.data.go.kr/6270000/dgBusRouteService/getBusRouteList';

async function testRouteApi() {
    console.log('--- Testing Route List API ---');
    // Using a known bus number like "401"
    const encodedRouteNo = encodeURIComponent('401');
    const url = `${ROUTE_URL}?serviceKey=${SERVICE_KEY}&routeNo=${encodedRouteNo}&pageNo=1&numOfRows=1`;

    try {
        const res = await axios.get(url);
        console.log(`Success! Status: ${res.status}`);
        console.log(`Response Data:`, res.data);
    } catch (err) {
        console.log(`Failed: ${err.message}`);
        if (err.response) {
            console.log(`Error Status: ${err.response.status}`);
            console.log(`Error Data:`, err.response.data);
        }
    }
}

testRouteApi();
