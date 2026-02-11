import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SERVICE_KEY = process.env.VITE_DAEGU_BUS_SERVICE_KEY;
const BASE_URL = 'https://apis.data.go.kr/6270000/dbmsapi02';

async function testFilter() {
    console.log('--- Testing getBasic02 with routeNo filter ---');
    // Try to see if it supports routeNo parameter
    const url = `${BASE_URL}/getBasic02?serviceKey=${SERVICE_KEY}&pageNo=1&numOfRows=10&routeNo=401`;

    try {
        const res = await axios.get(url);
        console.log(`Status: ${res.status}`);
        const items = res.data.body?.items?.route || [];
        console.log(`Found ${items.length} items.`);
        if (items.length > 0) {
            console.log('First item:', items[0]);
        }

        console.log('\n--- Testing getBasic02 with wnum (alternative filter name) ---');
        const url2 = `${BASE_URL}/getBasic02?serviceKey=${SERVICE_KEY}&pageNo=1&numOfRows=10&wnum=401`;
        const res2 = await axios.get(url2);
        const items2 = res2.data.body?.items?.route || [];
        console.log(`Found ${items2.length} items with wnum.`);

    } catch (err) {
        console.log(`Failed: ${err.message}`);
    }
}

testFilter();
