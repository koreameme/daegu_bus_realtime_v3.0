import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/daegu_bus_realtime_v3.0/',    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            includeAssets: ['favicon.ico', 'icon.svg'],
            manifest: {
                name: '대구버스 (기사용 - 한일운수)',
                short_name: '대구버스 (기사용 - 한일운수)',
                id: '/daegu_bus_realtime_v3.0/',                description: '대구 한일 버스 실시간 운행 정보 및 시간표',
                orientation: 'portrait',
                theme_color: '#007aff',
                background_color: '#ffffff',
                display: 'standalone',
                display_override: ['standalone', 'window-controls-overlay'],
                dir: 'ltr',
                categories: ['transportation', 'utilities'],
                icons: [
                    {
                        src: 'icon.svg',
                        sizes: 'any',
                        type: 'image/svg+xml',
                        purpose: 'maskable'
                    },
                    {
                        src: 'pwa-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any'
                    },
                    {
                        src: 'pwa-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any'
                    }
                ],
                screenshots: [
                    {
                        src: 'screenshots/timetable.png',
                        sizes: '1080x2340',
                        type: 'image/png',
                        form_factor: 'narrow',
                        label: '시간표 화면'
                    },
                    {
                        src: 'screenshots/calendar.png',
                        sizes: '1080x2340',
                        type: 'image/png',
                        form_factor: 'narrow',
                        label: '근무 달력 화면'
                    },
                    {
                        src: 'screenshots/realtime.png',
                        sizes: '1080x2340',
                        type: 'image/png',
                        form_factor: 'narrow',
                        label: '실시간 버스 위치 화면'
                    },

                    {
                        src: 'screenshots/desktop.png',
                        sizes: '1920x1080',
                        type: 'image/png',
                        form_factor: 'wide',
                        label: 'PC 버전 화면'
                    }
                ]



            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/apis\.data\.go\.kr\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 // 24 hours
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    }
                ]
            }
        })
    ],
})
