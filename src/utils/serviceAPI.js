// import axiosInstance from './axiosConfig';

// /**
//  * Service API - Tập hợp các hàm gọi API liên quan đến quản lý dịch vụ
//  */
// const serviceAPI = {
//   /**
//    * Lấy danh sách tất cả dịch vụ
//    * @param {Object} params - Tham số truy vấn
//    * @returns {Promise} - Promise với dữ liệu trả về
//    */
//   getAllServices: async (params = {}) => {
//     try {
//       const response = await axiosInstance.get('/services', { params });
//       return response;
//     } catch (error) {
//       throw error;
//     }
//   },

//   /**
//    * Lấy chi tiết một dịch vụ
//    * @param {Number} id - ID của dịch vụ
//    * @param {Object} params - Tham số truy vấn bổ sung
//    * @returns {Promise} - Promise với dữ liệu trả về
//    */
//   getServiceById: async (id, params = {}) => {
//     try {
//       const response = await axiosInstance.get(`/services/${id}`, { params });
//       return response;
//     } catch (error) {
//       throw error;
//     }
//   },

//   /**
//    * Tạo dịch vụ mới
//    * @param {FormData} formData - FormData chứa thông tin dịch vụ và hình ảnh
//    * @returns {Promise} - Promise với dữ liệu trả về
//    */
//   createService: async (formData) => {
//     try {
//       const response = await axiosInstance.post('/services', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       return response;
//     } catch (error) {
//       throw error;
//     }
//   },

//   /**
//    * Cập nhật dịch vụ
//    * @param {Number} id - ID của dịch vụ cần cập nhật
//    * @param {FormData} formData - FormData chứa thông tin cập nhật
//    * @returns {Promise} - Promise với dữ liệu trả về
//    */
//   updateService: async (id, formData) => {
//     try {
//       const response = await axiosInstance.put(`/services/${id}`, formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       return response;
//     } catch (error) {
//       throw error;
//     }
//   },

//   /**
//    * Xóa dịch vụ
//    * @param {Number} id - ID của dịch vụ cần xóa
//    * @returns {Promise} - Promise với dữ liệu trả về
//    */
//   deleteService: async (id) => {
//     try {
//       const response = await axiosInstance.delete(`/services/${id}`);
//       return response;
//     } catch (error) {
//       throw error;
//     }
//   },

//   /**
//    * Tải lên nhiều hình ảnh
//    * @param {Array} files - Mảng các file hình ảnh
//    * @param {Object} refData - Thông tin tham chiếu đến dịch vụ
//    * @returns {Promise} - Promise với dữ liệu trả về
//    */
//   uploadImages: async (files, refData) => {
//     try {
//       const formData = new FormData();
//       files.forEach(file => {
//         formData.append('files', file);
//       });
      
//       if (refData) {
//         formData.append('ref', refData.ref);
//         formData.append('refId', refData.refId);
//         formData.append('field', refData.field);
//       }
      
//       const response = await axiosInstance.post('/upload', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       return response;
//     } catch (error) {
//       throw error;
//     }
//   }
// };

// export default serviceAPI;