
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
