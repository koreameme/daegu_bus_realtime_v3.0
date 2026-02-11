import axios from 'axios';

const SERVICE_KEY = 'aac18bb3e975832f34707abcdc088134737efa3ae67f039ba6b842fc0f7ecdd6';
const BASE_URL = 'https://apis.data.go.kr/6270000/dbmsapi02';

async function checkLocations() {
    const routeIds = [
        { id: '3601050020', name: '818 (Gyeongsan)' },
        { id: '3601090010', name: '809 (Gyeongsan) ID1' },
        { id: '3601090030', name: '809 (Gyeongsan) ID2' },
        { id: '3000708000', name: '708 (Daegu)' } // Trying standard Daegu ID
    ];

    for (const route of routeIds) {
        const url = `${BASE_URL}/getPos02?serviceKey=${SERVICE_KEY}&routeId=${route.id}`;
        console.log(`\nFetching locations for ${route.name} (${route.id})...`);

        try {
            const response = await axios.get(url);
            const items = response.data.body?.items;

            if (!items) {
                console.log("No items returned (or body is empty).");
                console.log("Raw response:", response.data);
            } else if (Array.isArray(items)) {
                console.log(`Found ${items.length} buses.`);
                if (items.length > 0) console.log("Sample:", items[0]);
            } else {
                // Sometimes it returns a single object if only 1 bus
                console.log(`Found 1 bus (Object).`);
                console.log("Sample:", items);
            }

        } catch (error) {
            console.error("Error:", error.message);
        }
    }
}

checkLocations();
