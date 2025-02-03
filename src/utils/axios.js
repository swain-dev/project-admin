import axios from "axios";

// Cấu hình base URL nếu bạn có một API endpoint cố định
const baseURL = 'http://localhost:1337/api'; // Thay đổi theo URL API của bạn

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Bạn có thể thêm các cấu hình khác như thời gian chờ (timeout), interceptors, v.v.
});

// Thêm interceptors nếu cần thiết
axiosInstance.interceptors.request.use(
  (config) => {
    // Có thể thêm token vào header nếu bạn sử dụng authentication
    const token = localStorage.getItem('token'); // Ví dụ, lấy token từ localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptors cho phản hồi
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Xử lý lỗi ở đây, ví dụ: đăng xuất nếu token hết hạn
    if (error.response.status === 401) {
      // Xử lý lỗi unauthorized
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;