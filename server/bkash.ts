type BkashTokenResponse = {
  id_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: string;
  statusCode?: string;
  statusMessage?: string;
};

type BkashBaseResponse = {
  statusCode?: string;
  statusMessage?: string;
  message?: string;
  errorMessage?: string;
};

export type BkashCreatePaymentResponse = BkashBaseResponse & {
  paymentID?: string;
  bKashURL?: string;
  paymentCreateTime?: string;
  transactionStatus?: string;
  merchantInvoiceNumber?: string;
  successCallbackURL?: string;
  failureCallbackURL?: string;
  cancelledCallbackURL?: string;
};

export type BkashExecutePaymentResponse = BkashBaseResponse & {
  paymentID?: string;
  payerReference?: string;
  customerMsisdn?: string;
  trxID?: string;
  amount?: string;
  transactionStatus?: string;
  paymentExecuteTime?: string;
  currency?: string;
  intent?: string;
  merchantInvoiceNumber?: string;
};

export type BkashQueryPaymentResponse = BkashBaseResponse & {
  paymentID?: string;
  mode?: string;
  paymentCreateTime?: string;
  amount?: string;
  currency?: string;
  intent?: string;
  merchantInvoice?: string;
  merchantInvoiceNumber?: string;
  transactionStatus?: string;
  verificationStatus?: string;
  payerReference?: string;
  agreementID?: string;
  trxID?: string;
};

export class BkashApiError extends Error {
  readonly payload: unknown;

  constructor(message: string, payload?: unknown) {
    super(message);
    this.name = 'BkashApiError';
    this.payload = payload;
  }
}

const BKASH_TIMEOUT_MS = 30_000;

const getBkashConfig = () => {
  const baseUrl = process.env.BKASH_BASE_URL?.trim();
  const username = process.env.BKASH_USERNAME?.trim();
  const password = process.env.BKASH_PASSWORD?.trim();
  const appKey = process.env.BKASH_APP_KEY?.trim();
  const appSecret = process.env.BKASH_APP_SECRET?.trim();

  if (!baseUrl || !username || !password || !appKey || !appSecret) {
    throw new Error(
      'Missing bKash configuration. Set BKASH_BASE_URL, BKASH_USERNAME, BKASH_PASSWORD, BKASH_APP_KEY, and BKASH_APP_SECRET.',
    );
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ''),
    username,
    password,
    appKey,
    appSecret,
  };
};

const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const text = await response.text();
    throw new BkashApiError('Unexpected bKash response format.', text);
  }

  return response.json() as Promise<T>;
};

const ensureSuccessfulResponse = <T extends BkashBaseResponse>(payload: T, fallbackMessage: string) => {
  if (payload.statusCode && payload.statusCode !== '0000') {
    throw new BkashApiError(payload.statusMessage || fallbackMessage, payload);
  }

  return payload;
};

const bkashFetch = async <T extends BkashBaseResponse>(
  path: string,
  init: RequestInit,
): Promise<T> => {
  const { baseUrl } = getBkashConfig();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    signal: AbortSignal.timeout(BKASH_TIMEOUT_MS),
  });
  const payload = await parseJsonResponse<T>(response);

  if (!response.ok) {
    throw new BkashApiError(payload.statusMessage || 'bKash request failed.', payload);
  }

  return payload;
};

export const grantBkashToken = async () => {
  const config = getBkashConfig();

  const payload = await bkashFetch<BkashTokenResponse>('/tokenized/checkout/token/grant', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      username: config.username,
      password: config.password,
    },
    body: JSON.stringify({
      app_key: config.appKey,
      app_secret: config.appSecret,
    }),
  });

  const successPayload = ensureSuccessfulResponse(payload, 'Unable to grant bKash token.');

  if (!successPayload.id_token) {
    throw new BkashApiError('bKash did not return an access token.', successPayload);
  }

  return successPayload;
};

export const createBkashPayment = async (input: {
  amount: number;
  callbackURL: string;
  merchantInvoiceNumber: string;
  payerReference: string;
}) => {
  const config = getBkashConfig();
  const token = await grantBkashToken();

  const payload = await bkashFetch<BkashCreatePaymentResponse>('/tokenized/checkout/create', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: token.id_token,
      'X-App-Key': config.appKey,
    },
    body: JSON.stringify({
      mode: '0011',
      payerReference: input.payerReference,
      callbackURL: input.callbackURL,
      amount: input.amount.toFixed(2),
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: input.merchantInvoiceNumber,
    }),
  });

  const successPayload = ensureSuccessfulResponse(payload, 'Unable to create bKash payment.');

  if (!successPayload.paymentID || !successPayload.bKashURL) {
    throw new BkashApiError('bKash payment creation response was incomplete.', successPayload);
  }

  return successPayload;
};

export const executeBkashPayment = async (paymentID: string) => {
  const config = getBkashConfig();
  const token = await grantBkashToken();

  const payload = await bkashFetch<BkashExecutePaymentResponse>('/tokenized/checkout/execute', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: token.id_token,
      'X-App-Key': config.appKey,
    },
    body: JSON.stringify({
      paymentID,
    }),
  });

  return ensureSuccessfulResponse(payload, 'Unable to execute bKash payment.');
};

export const queryBkashPayment = async (paymentID: string) => {
  const config = getBkashConfig();
  const token = await grantBkashToken();

  const payload = await bkashFetch<BkashQueryPaymentResponse>('/tokenized/checkout/payment/status', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: token.id_token,
      'X-App-Key': config.appKey,
    },
    body: JSON.stringify({
      paymentID,
    }),
  });

  return ensureSuccessfulResponse(payload, 'Unable to query bKash payment.');
};

export const getBkashCallbackBaseUrl = (requestOrigin?: string | null) => {
  const explicitBaseUrl = process.env.BKASH_CALLBACK_BASE_URL?.trim();
  const envAppUrl = process.env.APP_URL?.trim();
  const resolved = explicitBaseUrl || requestOrigin || envAppUrl;

  if (!resolved) {
    throw new Error(
      'Unable to determine callback URL. Set BKASH_CALLBACK_BASE_URL or APP_URL, or call the API from the browser.',
    );
  }

  return resolved.replace(/\/$/, '');
};
