const BASE_URL = 'https://otp.aigalaxymm.com';

// Biến lưu trữ token trong memory
let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const clearAuthToken = () => {
  authToken = null;
};

export const getCurrentToken = () => {
  return authToken;
};

const fetchData = async (endpoint, options = {}) => {
  const { method = 'GET', headers = {}, body, isFileUpload = false } = options;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
  };

  try {
    const fetchOptions = {
      method,
      headers: { ...defaultHeaders, ...headers },
    };

    if (body) {
      fetchOptions.body = isFileUpload ? body : JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}/${endpoint}`, fetchOptions);

    const contentType = response.headers.get('content-type');
    let responseData;

    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      const errorMessage =
        responseData?.message ||
        responseData?.error ||
        `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error) {
    console.error('API Error:', error.message);

    // Tự động đăng xuất nếu token hết hạn
    if (error.message.includes('401')) {
      clearAuthToken();
    }

    throw error;
  }
};

// Các phương thức HTTP cơ bản
export const get = async (endpoint, headers = {}) =>
  await fetchData(endpoint, { method: 'GET', headers });
export const post = async (
  endpoint,
  body,
  headers = {},
  isFileUpload = false
) => await fetchData(endpoint, { method: 'POST', body, headers, isFileUpload });
export const put = async (endpoint, body, headers = {}) =>
  await fetchData(endpoint, { method: 'PUT', body, headers });

//Delete
export const del = async (endpoint, headers = {}) =>
  await fetchData(endpoint, { method: 'DELETE', headers });
