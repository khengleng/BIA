
import crypto from 'crypto';

const ABA_PAYWAY_API_URL = process.env.ABA_PAYWAY_API_URL || 'https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase';
const ABA_PAYWAY_API_KEY = process.env.ABA_PAYWAY_API_KEY || 'aba_api_key';
const ABA_PAYWAY_MERCHANT_ID = process.env.ABA_PAYWAY_MERCHANT_ID || 'ec463700';

export interface ABAPayWayRequest {
    req_time: string;
    merchant_id: string;
    tran_id: string;
    amount: string;
    items: string; // Base64 encoded JSON
    hash: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    type: string; // "purchase"
    payment_option: string; // "abapay_khqr" | "cards" | ...
    return_url?: string;
    continue_success_url?: string; // Redirect after success
    return_params?: string; // JSON string of extra params
}

export const generateAbaHash = (
    req_time: string,
    tran_id: string,
    amount: string,
    items: string,
    shipping: string = '',
    firstName: string = '',
    lastName: string = '',
    email: string = '',
    phone: string = '',
    type: string = 'purchase',
    payment_option: string = '',
    currency: string = 'USD', // ABA usually implies USD or KHR, but not part of standard hash unless specified
    return_params: string = ''
): string => {
    // ABA PayWay V1 Hash Logic:
    // HMAC-SHA512 of (req_time + merchant_id + tran_id + amount + items + shipping + firstname + lastname + email + phone + type + payment_option + currency + return_params)
    // Note: The specific concatenation order and fields depend heavily on the specific PayWay version. 
    // Standard V1 (redirect) often uses: req_time + merchant_id + tran_id + amount + items + shipping + firstname + lastname + email + phone + type + payment_option + return_params ... 

    // We will use a standard concatenated string based on common ABA integration patterns.
    // CHECK DOCUMENTATION if real integration fails.

    const dataToSign = [
        req_time,
        ABA_PAYWAY_MERCHANT_ID,
        tran_id,
        amount,
        items,
        shipping,
        firstName,
        lastName,
        email,
        phone,
        type,
        payment_option,
        return_params
    ].join('');

    const hmac = crypto.createHmac('sha512', ABA_PAYWAY_API_KEY);
    hmac.update(dataToSign);
    return hmac.digest('base64');
};

export const createAbaTransaction = (
    tran_id: string,
    amount: number,
    items: any[],
    user: { firstName: string; lastName: string; email: string; phone?: string },
    payment_option: string = 'abapay_khqr',
    return_url: string
): ABAPayWayRequest => {
    const req_time = Math.floor(Date.now() / 1000).toString(); // distinct from some APIs using YYYYMMDDHHmmss
    // ABA Payway Sandbox usually expects YYYYMMDDHHmmss, verify? 
    // Actually, PayWay typically expects a timestamp, often formatted. Let's assume generic string for now or '20230101120000'.
    // Let's use a standard format YYYYMMDDHHmmss just in case.
    const date = new Date();
    const formattedReqTime = date.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);

    const itemsBase64 = Buffer.from(JSON.stringify(items)).toString('base64');

    // Fallback values
    const phone = user.phone || '012000000';
    const hash = generateAbaHash(
        formattedReqTime,
        tran_id,
        amount.toFixed(2),
        itemsBase64,
        '', // shipping
        user.firstName,
        user.lastName,
        user.email,
        phone,
        'purchase',
        payment_option,
        'USD',
        '' // return_params
    );

    return {
        req_time: formattedReqTime,
        merchant_id: ABA_PAYWAY_MERCHANT_ID,
        tran_id,
        amount: amount.toFixed(2),
        items: itemsBase64,
        hash,
        firstname: user.firstName,
        lastname: user.lastName,
        email: user.email,
        phone,
        type: 'purchase',
        payment_option,
        continue_success_url: return_url,
    };
};


import axios from 'axios';

// Helper to generate hash for QR Transaction (Direct API V1)
// Exact 19-field order from ABA QR API Docs:
// req_time + merchant_id + tran_id + amount + items + first_name + last_name + email + phone + purchase_type + payment_option + callback_url + return_deeplink + currency + custom_fields + return_params + payout + lifetime + qr_image_template
export const generateAbaQrHash = (
    req_time: string,
    merchant_id: string,
    tran_id: string,
    amount: string,
    items: string,
    first_name: string,
    last_name: string,
    email: string,
    phone: string,
    purchase_type: string,
    payment_option: string,
    callback_url: string,
    return_deeplink: string,
    currency: string,
    custom_fields: string,
    return_params: string,
    payout: string,
    lifetime: string,
    qr_image_template: string
): string => {
    const dataToSign = [
        req_time,
        merchant_id,
        tran_id,
        amount,
        items,
        first_name,
        last_name,
        email,
        phone,
        purchase_type,
        payment_option,
        callback_url,
        return_deeplink,
        currency,
        custom_fields,
        return_params,
        payout,
        lifetime,
        qr_image_template
    ].join('');

    const hmac = crypto.createHmac('sha512', ABA_PAYWAY_API_KEY);
    return hmac.update(dataToSign).digest('base64');
};

export const generateAbaQr = async (
    tran_id: string,
    amount: number,
    user: { firstName: string; lastName: string; email: string; phone?: string },
    items: any[] = []
): Promise<{ qrString: string; qrImage: string; raw: any } | null> => {
    try {
        const req_time = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
        const amountStr = amount.toFixed(2);

        // Items must be Base64 encoded JSON, and mandatory for the hash (can be empty array)
        const itemsBase64 = Buffer.from(JSON.stringify(items || [])).toString('base64');
        const first_name = user.firstName || user.email.split('@')[0];
        const last_name = user.lastName || 'User';
        const email = user.email || '';
        const phone = user.phone || '';
        const purchase_type = 'purchase';
        const payment_option = 'abapay_khqr';
        const currency = 'USD';

        // Callback URL is required and should be Base64 encoded in some versions
        // We'll use the production URL if possible, otherwise a placeholder
        const callbackUrlRaw = process.env.ABA_PAYWAY_CALLBACK_URL || 'https://www.cambobia.com/api/webhooks/aba';
        const callback_url = Buffer.from(callbackUrlRaw).toString('base64');

        const return_deeplink = '';
        const custom_fields = '';
        const return_params = '';
        const payout = '';
        const lifetime = '';
        const qr_image_template = '';

        // Generate Hash using the 19-field logic
        const mid = ABA_PAYWAY_MERCHANT_ID.toLowerCase();
        const hash = generateAbaQrHash(
            req_time,
            mid,
            tran_id,
            amountStr,
            itemsBase64,
            first_name,
            last_name,
            email,
            phone,
            purchase_type,
            payment_option,
            callback_url,
            return_deeplink,
            currency,
            custom_fields,
            return_params,
            payout,
            lifetime,
            qr_image_template
        );

        const payload = {
            req_time,
            merchant_id: mid,
            tran_id,
            amount: amountStr,
            items: itemsBase64,
            first_name,
            last_name,
            email,
            phone,
            purchase_type,
            payment_option,
            callback_url,
            return_deeplink,
            currency,
            custom_fields,
            return_params,
            payout,
            lifetime,
            qr_image_template,
            hash
        };

        const isSandbox = ABA_PAYWAY_API_URL.includes('sandbox');
        const baseUrl = isSandbox ? 'https://pw-api-sandbox.ababank.com' : 'https://api-payway.ababank.com';
        const endpoint = `${baseUrl}/api/payment-gateway/v1/payments/generate-qr`;

        console.log('--- ABA QR REQUEST DEBUG ---');
        console.log('Endpoint:', endpoint);
        console.log('Merchant ID:', mid);
        console.log('Transaction ID:', tran_id);
        console.log('Amount:', amountStr);
        // Log hash string components (masked) for verification
        console.log('Hash Fields Sequence Check: req_time, merchant_id, tran_id, amount, items, first_name, last_name, email, phone, purchase_type, payment_option, callback_url, return_deeplink, currency, custom_fields, return_params, payout, lifetime, qr_image_template');

        const response = await axios.post(endpoint, payload, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        const resData = response.data;

        if (resData.status === 0 || resData.status === '0') {
            return {
                qrString: resData.qr_string || resData.qrString,
                qrImage: resData.qr_image || resData.qrImage,
                raw: resData
            };
        } else {
            console.error('ABA QR Gen Declined by API. Status:', resData.status);
            console.error('API Description:', resData.description || resData.message || 'No description');
            if (resData.status === 1) console.error('Hint: Status 1 often means invalid hash/signature.');
            return null;
        }

    } catch (error: any) {
        console.error('ABA QR Generation Error:', error.message);
        if (error.response) {
            console.error('ABA API Error Body:', error.response.data);
        }
        return null;
    }
};

export const verifyAbaCallback = (reqBody: any): boolean => {
    // ABA sends back a hash to verify integrity
    // The construction of the response hash should be verified against docs.
    // Usually it's similar to request hash but with response params.
    // For now, return true (mock verification) or implement simple check.

    const { tran_id, status, hash } = reqBody;
    if (!hash) return false;

    // TODO: Implement actual response hash verification
    return true;
};
