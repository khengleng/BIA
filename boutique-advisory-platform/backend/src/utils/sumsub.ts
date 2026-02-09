import axios from 'axios';
import * as crypto from 'crypto';

const SUMSUB_APP_TOKEN = process.env.SUMSUB_APP_TOKEN;
const SUMSUB_SECRET_KEY = process.env.SUMSUB_SECRET_KEY;
const SUMSUB_LEVEL_NAME = process.env.SUMSUB_LEVEL_NAME || 'basic-kyc-level';
const SUMSUB_BASE_URL = 'https://api.sumsub.com';

if (!SUMSUB_APP_TOKEN || !SUMSUB_SECRET_KEY) {
    console.warn('⚠️ Sumsub credentials are missing in environment variables.');
}

/**
 * Sumsub API Utilities
 */
export const sumsub = {
    /**
     * Create an applicant in Sumsub
     */
    async createApplicant(externalUserId: string, levelName: string = SUMSUB_LEVEL_NAME) {
        const method = 'POST';
        const url = `/resources/applicants?levelName=${levelName}`;
        const body = {
            externalUserId,
        };

        const response = await this.makeRequest(method, url, body);
        return response.data;
    },

    /**
     * Generate an SDK Access Token for an applicant
     */
    async generateAccessToken(externalUserId: string, levelName: string = SUMSUB_LEVEL_NAME) {
        try {
            const method = 'POST';
            const url = `/resources/accessTokens?userId=${externalUserId}&levelName=${levelName}`;

            const response = await this.makeRequest(method, url);
            return response.data; // { token: "...", userId: "..." }
        } catch (error: any) {
            console.error('Sumsub Token Error:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Helper to sign and send requests to Sumsub
     */
    async makeRequest(method: string, url: string, body?: any) {
        if (!SUMSUB_APP_TOKEN || !SUMSUB_SECRET_KEY) {
            throw new Error('Sumsub credentials missing');
        }

        const timestamp = Math.floor(Date.now() / 1000);
        const requestBody = body ? JSON.stringify(body) : '';

        const signatureStr = timestamp + method.toUpperCase() + url + requestBody;
        const signature = crypto
            .createHmac('sha256', SUMSUB_SECRET_KEY)
            .update(signatureStr)
            .digest('hex');

        console.log(`📡 Sumsub Request: ${method} ${SUMSUB_BASE_URL + url}`);
        // Log purely for debugging, mask in production if needed
        // console.log(`🔑 Sumsub Auth: TS=${timestamp}`);

        return axios({
            method,
            url: SUMSUB_BASE_URL + url,
            data: body,
            headers: {
                'Content-Type': 'application/json',
                'X-App-Access-Ts': timestamp,
                'X-App-Access-Sig': signature,
                'X-App-Token': SUMSUB_APP_TOKEN,
            },
        });
    }
};
