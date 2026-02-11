import axios from 'axios';

const SERVICE_KEY = 'aac18bb3e975832f34707abcdc088134737efa3ae67f039ba6b842fc0f7ecdd6';
const BASE_URL = 'https://apis.data.go.kr/6270000/dbmsapi02';

async function checkLocations() {
    const routeIds = [
        { id: '3000401000', name: '401 (Daegu - Main)' },
        { id: '3000708002', name: '708 (Daegu - Main?)' },
        { id: '3601050020', name: '818 (Gyeongsan - Suspect)' },
        { id: '3600842110', name: '818 (Gyeongsan - First)' },
        { id: '3601090010', name: '809 (Gyeongsan - Suspect)' },
        { id: '3601031100', name: '100-1 (Gyeongsan)' }
    ];

    for (const route of routeIds) {
        const url = `${BASE_URL}/getPos02?serviceKey=${SERVICE_KEY}&routeId=${route.id}`;
        console.log(`\nFetching locations for ${route.name} (${route.id})...`);

        try {
            const response = await axios.get(url);
            const items = response.data.body?.items;

            if (!items) {
                // Try parsing text if string
                if (typeof response.data === 'string') {
                    console.log("Response is string (likely XML).");
                } else {
                    console.log("No items (likely empty array or bad structure).");
                }
            } else if (Array.isArray(items)) {
                console.log(`Found ${items.length} buses.`);
                if (items.length > 0) console.log("Sample:", items[0]);
            } else {
                console.log(`Found 1 bus (Object).`);
                console.log("Sample:", items);
            }

        } catch (error) {
            console.error("Error:", error.message);
        }
    }
}

checkLocations();
