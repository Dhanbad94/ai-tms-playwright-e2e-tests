import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export type SendResponse = {
  status?: number;
  data?: any;
  location?: string;
  message?: string;
};

/**
 * @param {AxiosRequestConfig} options - required for executing a request
 * @returns {Promise<SendResponse>} - response or error details
 */
export default async function sendRequest(options: AxiosRequestConfig): Promise<SendResponse> {
  try {
    const response: AxiosResponse = await axios(options);
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
      message: resp.data?.message || error?.message,
    };
  }
}
