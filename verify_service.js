import { getBusArrivals } from './src/services/api_service.js';

async function runTest() {
    console.log('--- Testing Daegu Bus API Service ---');
    const stopId = '00192'; // Daegu Station example

    try {
        const arrivals = await getBusArrivals(stopId);
        console.log(`Found ${arrivals.length} buses arriving:`);
        arrivals.forEach(bus => {
            console.log(`- Route ${bus.routeNo}: ${bus.arrTime} seconds left (${bus.arrPrevStationCnt} stations away)`);
        });
    } catch (err) {
        console.error('Test failed:', err.message);
        console.log('\nNote: If you still see "500" errors, the API key might still be in the "Pending" status on the portal.');
    }
}

runTest().catch(err => {
    console.error('[CRITICAL] Top-level error:', err);
});
