const axios: any = require('axios');

export type SendResponse = {
  status?: number;
  data?: any;
  location?: string;
  message?: string;
};

/**
 * @param {any} options - required for executing a request
 * @returns {Promise<SendResponse>} - either response of a successful request or error details
 */
export default async function sendRequest(options: any): Promise<SendResponse> {
  try {
    const response: any = await axios(options);
    return {
      status: response.status,
      data: response.data,
      location: response.headers.location,
    };

  } catch (error: any) {
    const resp = error?.response || {};
    return {
      status: resp.status,
      data: resp.data,
      message: resp.data?.message,
    };
  }
}
