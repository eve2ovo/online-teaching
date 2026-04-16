import axios from 'axios';
import { ElMessage } from 'element-plus';
import { clearToken, clearUserCache, getToken } from './auth';
import router from '@/router';
const service = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 15000
});
service.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
service.interceptors.response.use((response) => {
    const res = response.data;
    if (res.code !== 0) {
        ElMessage.error(res.msg || '请求失败');
        return Promise.reject(res);
    }
    return res.data;
}, (error) => {
    if (error.response?.status === 401) {
        clearToken();
        clearUserCache();
        router.push('/login');
    }
    ElMessage.error(error.message || '网络异常');
    return Promise.reject(error);
});
const request = {
    get(url, config) {
        return service.get(url, config);
    },
    post(url, data, config) {
        return service.post(url, data, config);
    },
    put(url, data, config) {
        return service.put(url, data, config);
    },
    delete(url, config) {
        return service.delete(url, config);
    }
};
export default request;
