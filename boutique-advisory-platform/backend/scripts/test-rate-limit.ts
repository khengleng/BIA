import axios from 'axios';

// Configuration
const API_URL = 'http://localhost:4000/api';
const LOGIN_ENDPOINT = '/auth/login';
const REQUEST_COUNT = 10; // The limit is 5 per 15 mins, so 10 should trigger it.

interface LoginResponse {
    error?: string;
    token?: string;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function runAttackTest() {
    console.log(`🛡️  Starting Rate Limit "Stress Test" (DDoS Simulation)`);
    console.log(`🎯  Target: ${API_URL}${LOGIN_ENDPOINT}`);
    console.log(`⚡  Sending ${REQUEST_COUNT} requests rapidly...`);
    console.log('--------------------------------------------------');

    let successCount = 0;
    let blockedCount = 0;

    for (let i = 1; i <= REQUEST_COUNT; i++) {
        try {
            const start = Date.now();
            // Send a login request with dummy data
            await axios.post(
                `${API_URL}${LOGIN_ENDPOINT}`,
                { email: `attacker${i}@test.com`, password: 'password123' },
                { validateStatus: () => true } // Don't throw on error status
            ).then(res => {
                const duration = Date.now() - start;
                if (res.status === 429) {
                    console.log(`🔴  Request #${i}: BLOCKED [429 Too Many Requests] - Platform protected! (${duration}ms)`);
                    blockedCount++;
                } else if (res.status === 401) {
                    console.log(`🟢  Request #${i}: Allowed [401 Unauthorized] - Valid traffic processed. (${duration}ms)`);
                    successCount++;
                } else {
                    console.log(`⚪  Request #${i}: Status ${res.status}`);
                    successCount++;
                }
            });

            // Minimal delay to simulate "rapid" but sequential bot
            // await sleep(50); 
        } catch (error) {
            console.error(`Request #${i} failed:`, error);
        }
    }

    console.log('--------------------------------------------------');
    console.log(`📊  Summary:`);
    console.log(`✅  Passed: ${successCount}`);
    console.log(`🚫  Blocked: ${blockedCount}`);

    if (blockedCount > 0) {
        console.log(`\n🏆  SUCCESS: Rate Limiting is ACTIVE and protecting the platform.`);
    } else {
        console.log(`\n⚠️  WARNING: Rate Limiting did NOT trigger. Check configuration.`);
    }
}

runAttackTest().catch(console.error);
