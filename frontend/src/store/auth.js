import { defineStore } from 'pinia';
import { loginApi, registerApi } from '@/api/auth';
import { clearToken, clearUserCache, getToken, getUserCache, setToken, setUserCache } from '@/utils/auth';
import { normalizeAvatarUrl } from '@/utils/avatar';
const cachedUser = getUserCache();
export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: getToken(),
        user: cachedUser ? { ...cachedUser, avatar: normalizeAvatarUrl(cachedUser.avatar) } : null
    }),
    getters: {
        role: (state) => state.user?.role || '',
        isLogin: (state) => !!state.token
    },
    actions: {
        async login(form) {
            const data = await loginApi(form);
            data.avatar = normalizeAvatarUrl(data.avatar);
            this.token = data.token;
            this.user = data;
            setToken(data.token);
            setUserCache(data);
        },
        setUser(user) {
            const nextUser = user ? { ...user, avatar: normalizeAvatarUrl(user.avatar) } : null;
            this.user = nextUser;
            if (user) {
                setUserCache(nextUser);
            }
            else {
                clearUserCache();
            }
        },
        patchUser(payload) {
            if (!this.user)
                return;
            const nextUser = { ...this.user, ...payload, avatar: normalizeAvatarUrl(payload.avatar ?? this.user.avatar) };
            this.user = nextUser;
            setUserCache(nextUser);
        },
        async register(form) {
            await registerApi(form);
        },
        logout() {
            this.token = '';
            this.user = null;
            clearToken();
            clearUserCache();
        }
    }
});
