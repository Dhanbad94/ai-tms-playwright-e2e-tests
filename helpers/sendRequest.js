import axios from 'axios';

/**
 * @param {JSON} options - required for executing a request
 * @returns {Promise<JSON>} - either response of a successful request or status & error details of a unsuccessfull request
 */
export default async function sendRequest(options) {
  try {
    const response = await axios(options);
    return {
      status: response.status,
      data: response.data,
      location: response.headers.location,
    };
  } catch (error) {
    return {
      status: error.response.status,
      data: error.response.data,
      message: error.response.data.message,
    };
  }
}
