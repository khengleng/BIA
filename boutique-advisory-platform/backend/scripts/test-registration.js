// This script simulates user registration for multiple roles
const API_URL = 'http://localhost:4000/api';
// Using global fetch (Node 18+)

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to fetch CSRF token and cookie
async function getCsrfToken() {
    try {
        const response = await fetch(`${API_URL}/csrf-token`);
        if (!response.ok) {
            throw new Error(`Failed to fetch CSRF token: ${response.status}`);
        }
        const data = await response.json();

        // Extract cookies
        const setCookieHeader = response.headers.get('set-cookie');
        const cookies = setCookieHeader || '';

        return {
            token: data.csrfToken,
            cookies
        };
    } catch (error) {
        console.error('Error fetching CSRF token:', error.message);
        throw error;
    }
}

async function registerUser(email, firstName, lastName, role, password = 'Password123!') {
    console.log(`\nAttempting to register ${role}: ${email}...`);

    try {
        // 1. Get CSRF Token
        const { token, cookies } = await getCsrfToken();
        console.log(`  CSRF Token acquired: ${token.substring(0, 10)}...`);

        // 2. Register User
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-csrf-token': token,
                'Cookie': cookies
            },
            body: JSON.stringify({
                email,
                password,
                firstName,
                lastName,
                role
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log(`✅ Success! Created ${role} user: ${data.user.email} (ID: ${data.user.id})`);
            return data;
        } else {
            console.log(`❌ Failed! Status: ${response.status}`);
            console.log('  Error:', data.error || JSON.stringify(data));
            return null;
        }

    } catch (error) {
        console.error('  Exception:', error.message);
        return null;
    }
}

async function runTests() {
    console.log('=== STARTING USER REGISTRATION TESTS ===');

    // Create Investor
    await registerUser(
        `investor.test.${Date.now()}@example.com`,
        'Test',
        'Investor',
        'INVESTOR'
    );

    await sleep(1000);

    // Create SME Owner
    await registerUser(
        `sme.test.${Date.now()}@example.com`,
        'Test',
        'SME Owner',
        'SME'
    );

    await sleep(1000);

    // Create Advisor
    await registerUser(
        `advisor.test.${Date.now()}@example.com`,
        'Test',
        'Advisor',
        'ADVISOR'
    );

    console.log('\n=== TESTS COMPLETED ===');
}

runTests();
