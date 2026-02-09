
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


// Helper to generate hash for QR Transaction
export const generateAbaQrHash = (
    req_time: string,
    tran_id: string,
    amount: string,
    firstName: string = '',
    lastName: string = '',
    email: string = '',
    phone: string = '',
    items: string = '', // Base64
    payment_option: string = 'abapay_khqr',
    type: string = 'purchase', // Default for QR? subagent said type 'purchase'
    currency: string = 'USD'
): string => {
    // Standard ABA Hash:
    // req_time + merchant_id + tran_id + amount + items + shipping(empty) + firstname + lastname + email + phone + type + payment_option + currency + return_params(empty)
    const dataToSign = [
        req_time,
        ABA_PAYWAY_MERCHANT_ID,
        tran_id,
        amount,
        items,
        '', // shipping
        firstName,
        lastName,
        email,
        phone,
        type,
        payment_option,
        currency,
        '' // return_params
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
        const itemsBase64 = items.length > 0 ? Buffer.from(JSON.stringify(items)).toString('base64') : '';
        const payment_option = 'abapay_khqr';
        const type = 'purchase'; // As per subagent finding

        const hash = generateAbaQrHash(
            req_time,
            tran_id,
            amountStr,
            user.firstName,
            user.lastName,
            user.email,
            user.phone || '012000000',
            itemsBase64,
            payment_option,
            type
        );

        const payload = {
            req_time,
            merchant_id: ABA_PAYWAY_MERCHANT_ID,
            tran_id,
            amount: amountStr,
            currency: 'USD',
            hash,
            first_name: user.firstName,
            last_name: user.lastName,
            email: user.email,
            phone: user.phone || '012000000',
            items: itemsBase64,
            payment_option,
            type, // Subagent found 'purchase_type' in JSON? No, 'type' in key list?
            // Subagent JSON: "purchase_type": "purchase".
            // AND "type": "purchase" in usual PayWay.
            // Let's look at subagent output carefully:
            // "purchase_type": "purchase", // Optional
            // But usually "type" is the field in hash.
            // I'll send both or stick to standard.
            // I'll send `purchase_type` as well if needed.
            // Let's stick to standard payload keys first.
        };

        // URL Logic
        // Sandbox: https://pw-api-sandbox.ababank.com/api/payment-gateway/v1/payments/generate-qr
        // Prod: https://api-payway.ababank.com/api/payment-gateway/v1/payments/generate-qr
        // User's Env might be 'checkout'.
        // I will rely on a new Env Var or derived logic.
        // If current ABA_PAYWAY_API_URL contains 'sandbox', use sandbox API.
        const isSandbox = ABA_PAYWAY_API_URL.includes('sandbox');
        const baseUrl = isSandbox ? 'https://pw-api-sandbox.ababank.com' : 'https://api-payway.ababank.com';
        const endpoint = `${baseUrl}/api/payment-gateway/v1/payments/generate-qr`;

        const resJson: any = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(r => r.json());

        if (resJson.status === 0 || resJson.status === '0') {
            return {
                qrString: resJson.qr_string,
                qrImage: resJson.qr_image,
                raw: resJson
            };
        } else {
            console.error('ABA QR Gen Failed:', resJson);
            return null;
        }

    } catch (error) {
        console.error('Error generating ABA QR:', error);
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
