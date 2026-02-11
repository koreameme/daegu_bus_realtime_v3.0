import axios from 'axios';

// Use Vite environment variables (requires VITE_ prefix in .env)
const SERVICE_KEY = import.meta.env.VITE_DAEGU_BUS_SERVICE_KEY;
const BASE_URL = 'https://apis.data.go.kr/6270000/dbmsapi02';

// Cache configuration
const CACHE_KEY = 'daegu_bus_routes_cache';
const CACHE_DURATION = 100 * 365 * 24 * 60 * 60 * 1000; // 100 years (effectively unlimited)

// In-memory cache to avoid repeated localStorage reads
const memoryCache = {
    routes: null,
    stations: {}
};

/**
 * Get cached routes from memory or localStorage
 */
function getCachedRoutes() {
    // 1. Check memory cache first
    if (memoryCache.routes) {
        return memoryCache.routes;
    }

    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const { timestamp, routes } = JSON.parse(cached);

        // Check if cache is still valid
        if (Date.now() - timestamp < CACHE_DURATION) {
            console.log('[Cache] Using cached route data (from storage)');
            memoryCache.routes = routes; // Populate memory cache
            return routes;
        } else {
            console.log('[Cache] Cache expired, will fetch fresh data');
            localStorage.removeItem(CACHE_KEY);
            return null;
        }
    } catch (error) {
        console.warn('[Cache] Error reading cache:', error);
        return null;
    }
}

/**
 * Save routes to localStorage CACHE and memory
 */
function setCachedRoutes(routes) {
    try {
        memoryCache.routes = routes; // Update memory cache
        const cacheData = {
            timestamp: Date.now(),
            routes: routes
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        console.log(`[Cache] Saved ${routes.length} routes to cache`);
    } catch (error) {
        console.warn('[Cache] Error saving cache:', error);
    }
}

/**
 * Fetches real-time bus arrival information for a specific stop.
 */
async function getBusArrivals(stopId) {
    if (!SERVICE_KEY) throw new Error('DAEGU_BUS_SERVICE_KEY missing');

    const url = `${BASE_URL}/getRealtime02?serviceKey=${SERVICE_KEY}&bsId=${stopId}&pageNo=1&numOfRows=10`;

    try {
        const response = await axios.get(url);
        // The new API usually returns JSON by default or we can force it.
        // It seems the user's sample was JSON.
        const data = response.data;

        if (data.header?.resultCode !== '0000') {
            throw new Error(`API Error: ${data.header?.resultMsg}`);
        }

        const items = data.body?.items;
        if (!items) return [];

        // Map new fields to match existing UI
        return items.map(item => ({
            routeNo: item.routeNo,
            arrTime: item.arrTime,
            arrPrevStationCnt: item.bsGap || 0,
            routeId: item.routeId
        }));

    } catch (error) {
        console.warn(`[WARNING] API call failed. Returning mock data. Error: ${error.message}`);
        return [
            { routeNo: '급행1', arrTime: '320', bsGap: '2', routeId: '1000001074' },
            { routeNo: '401', arrTime: '540', bsGap: '4', routeId: '1000000401' },
            { routeNo: '708', arrTime: '900', bsGap: '7', routeId: '1000000708' }
        ];
    }
}

/**
 * Searches for a route by number and returns its ID.
 * Uses localStorage cache to avoid repeated API calls.
 */
async function getRouteId(routeNo) {
    if (!SERVICE_KEY) throw new Error('DAEGU_BUS_SERVICE_KEY missing');

    // Try cache first
    const cachedRoutes = getCachedRoutes();
    if (cachedRoutes) {
        // Check if route exists in cache first
        const targets = cachedRoutes.filter(r => r.routeNo === routeNo || r.routeNo === routeNo.trim());
        if (targets.length > 0) {
            const bestTarget = targets.find(r => r.routeId && r.routeId.startsWith('300') && r.routeId.endsWith('000'))
                || targets.find(r => r.routeId && r.routeId.endsWith('000'))
                || targets[0];

            console.log(`[Cache Hit] Found route ${routeNo} -> ${bestTarget.routeId}`);
            return bestTarget.routeId;
        }

        // If not found in cache, fall through to fetch fresh data
        console.log(`[Cache Miss] Route ${routeNo} not found in cache. Fetching fresh data...`);
    }

    // Cache miss or not found in cache - fetch from API
    const url = `${BASE_URL}/getBasic02?serviceKey=${SERVICE_KEY}&pageNo=1&numOfRows=10000`;

    try {
        const response = await axios.get(url);
        const data = response.data;
        const routes = data.body?.items?.route || [];

        // Save to cache for future use
        if (routes.length > 0) {
            setCachedRoutes(routes);
        }

        // Find all matches with looser comparison
        const targets = routes.filter(r => String(r.routeNo).trim() === String(routeNo).trim());

        if (targets.length > 0) {
            // Heuristic: Prefer routeId ending in '000' (seems to be canonical ID)
            // Also prioritize Daegu IDs (starting with 300) over Gyeongsan (360) unless only Gyeongsan exists
            // Strategy for selecting the best route ID:
            // 1. Prefer Daegu routes (300...) ending in '000' (standard main routes)
            // 2. Prefer Gyeongsan routes (360...) if they seem to be main routes (heuristics needed, but often just one exists or they have specific patterns)
            // 3. Fallback to any '000' suffix
            // 4. Fallback to the first available candidate

            const bestTarget = targets.find(r => r.routeId && r.routeId.startsWith('300') && r.routeId.endsWith('000'))
                || targets.find(r => r.routeId && r.routeId.startsWith('360') && r.routeId.endsWith('000')) // Try to find "clean" Gyeongsan ID if possible
                || targets.find(r => r.routeId && r.routeId.endsWith('000'))
                || targets[0]; // Fallback to first

            if (bestTarget.routeId && bestTarget.routeId.startsWith('360')) {
                console.log(`[Route Search] Selected Gyeongsan Route ID: ${bestTarget.routeId}`);
            }

            console.log(`[Route Search] Found ${targets.length} candidates for ${routeNo}. Selected: ${bestTarget.routeId} (from ${targets.map(t => t.routeId).join(', ')})`);
            return bestTarget.routeId;
        }

        console.warn(`[Route Search] No route found for ${routeNo}`);
        return null;
    } catch (error) {
        console.warn(`[Mock] Route search failed. Using mock routeId.`);
        if (routeNo.includes('급행1')) return '1000001074';
        if (routeNo.includes('401')) return '1000000401';
        if (routeNo.includes('937')) return '3000937000';
        if (routeNo.includes('649')) return '3000649000';
        return '3000937000'; // Default to a known ID for testing
    }
}

/**
 * Fetches real-time bus locations for a specific route.
 */
async function getRouteLocations(routeId) {
    if (!SERVICE_KEY) throw new Error('DAEGU_BUS_SERVICE_KEY missing');

    const url = `${BASE_URL}/getPos02?serviceKey=${SERVICE_KEY}&routeId=${routeId}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        const items = data.body?.items || [];

        // Debug: Log raw API response for troubleshooting
        if (items.length > 0) {
            console.log(`[API Debug] getPos02 returned ${items.length} buses`);
            console.log('[API Debug] First bus raw data:', items[0]);
        } else {
            console.log('[API Debug] No buses currently running on this route');
        }

        // Filter and map bus locations
        const locations = items
            .filter(item => {
                // Filter out buses without station ID
                if (!item.bsId) {
                    console.warn('[API Warning] Bus without station ID:', item);
                    return false;
                }
                return true;
            })
            .map(item => {
                // Extract vehicle number with better fallback handling
                const vehNo = (item.vhcNo || item.vhcNo2 || '').trim() || '차량번호 없음';

                return {
                    vehNo: vehNo,
                    stationNm: item.bsNm || '정보 없음',
                    stationId: item.bsId,
                    moveDir: item.moveDir,
                    arrPrevStationCnt: item.bsGap || 0,
                    arTime: item.arTime,
                    x: item.xPos,
                    y: item.yPos
                };
            });

        console.log(`[API Debug] Processed ${locations.length} valid bus locations`);
        return locations;
    } catch (error) {
        console.error(`[Error] Location fetch failed: ${error.message}`);
        throw error; // Propagate error to UI
    }
}

/**
 * Fetches the list of stations for a specific route.
 * Uses localStorage cache to avoid repeated API calls.
 */
async function getRouteStations(routeId) {
    if (!SERVICE_KEY) throw new Error('DAEGU_BUS_SERVICE_KEY missing');

    const CACHE_KEY = `daegu_bus_stations_${routeId}`;
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

    // 0. Check memory cache
    if (memoryCache.stations[routeId]) {
        return memoryCache.stations[routeId];
    }

    // 1. Try cache first
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const { timestamp, stations } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION) {
                console.log(`[Cache Hit] Stations for ${routeId} from cache (storage)`);
                memoryCache.stations[routeId] = stations; // Populate memory cache
                return stations;
            } else {
                console.log(`[Cache] Station cache expired for ${routeId}`);
                localStorage.removeItem(CACHE_KEY);
            }
        }
    } catch (e) {
        console.warn('[Cache] Error reading station cache:', e);
    }

    // 2. Fetch from API if cache miss
    const url = `${BASE_URL}/getBs02?serviceKey=${SERVICE_KEY}&routeId=${routeId}`;

    try {
        const response = await axios.get(url);
        const data = response.data;
        const items = data.body?.items || [];

        console.log(`[API Debug] getBs02 returned ${items.length} stations`);

        const stations = items.map(item => ({
            stationNm: item.bsNm,
            bsId: item.bsId,
            moveDir: item.moveDir,
            seq: item.seq,
            x: item.xPos,
            y: item.yPos
        }));

        // 3. Save to cache
        if (stations.length > 0) {
            try {
                memoryCache.stations[routeId] = stations; // Update memory cache
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    timestamp: Date.now(),
                    stations: stations
                }));
                console.log(`[Cache] Saved ${stations.length} stations for ${routeId}`);
            } catch (e) {
                console.warn('[Cache] Error saving station cache (likely full):', e);
            }
        }

        return stations;
    } catch (error) {
        // Log detailed error information
        const statusCode = error.response?.status;
        const errorMsg = error.response?.data || error.message;

        console.error(`[API Error] getBs02 failed:`, {
            status: statusCode,
            message: errorMsg,
            url: url
        });

        if (statusCode === 429) {
            console.error('⚠️ API Rate Limit Exceeded! Too many requests.');
        }

        throw error; // Propagate error to UI
    }
}

export {
    getBusArrivals,
    getRouteId,
    getRouteLocations,
    getRouteStations
};
