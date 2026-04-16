import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/store/auth';
const routes = [
    {
        path: '/login',
        component: () => import('@/views/login/Login.vue'),
        meta: { title: '登录' }
    },
    {
        path: '/',
        component: () => import('@/layouts/MainLayout.vue'),
        redirect: '/profile',
        children: [
            {
                path: 'profile',
                component: () => import('@/views/profile/Profile.vue'),
                meta: { title: '个人中心' }
            },
            {
                path: 'student/home',
                component: () => import('@/views/student/StudentHome.vue'),
                meta: { role: 'STUDENT', title: '课程广场', activeMenu: '/student/home' }
            },
            {
                path: 'student/learning',
                component: () => import('@/views/student/StudentLearning.vue'),
                meta: { role: 'STUDENT', title: '我的学习', activeMenu: '/student/learning' }
            },
            {
                path: 'student/course/:id',
                component: () => import('@/views/student/StudentCourseDetail.vue'),
                meta: { role: 'STUDENT', title: '课程详情', activeMenu: '/student/home' }
            },
            {
                path: 'student/learn/:id',
                component: () => import('@/views/student/StudentCourseLearn.vue'),
                meta: { role: 'STUDENT', title: '在线学习', activeMenu: '/student/learning' }
            },
            {
                path: 'teacher/courses',
                component: () => import('@/views/teacher/TeacherCourses.vue'),
                meta: { role: 'TEACHER', title: '教学运行', activeMenu: '/teacher/courses' }
            },
            {
                path: 'teacher/applications/:courseId?',
                component: () => import('@/views/teacher/TeacherCourseApplications.vue'),
                meta: { role: 'TEACHER', title: '选课申请', activeMenu: '/teacher/applications' }
            },
            {
                path: 'teacher/course-students/:courseId',
                component: () => import('@/views/teacher/TeacherCourseStudents.vue'),
                meta: { role: 'TEACHER', title: '课程学生', activeMenu: '/teacher/courses' }
            },
            {
                path: 'teacher/course-gradebook/:courseId',
                component: () => import('@/views/teacher/TeacherCourseGradebook.vue'),
                meta: { role: 'TEACHER', title: '成绩册', activeMenu: '/teacher/courses' }
            },
            {
                path: 'teacher/content/:courseId',
                component: () => import('@/views/teacher/TeacherCourseContent.vue'),
                meta: { role: 'TEACHER', title: '课程内容', activeMenu: '/teacher/courses' }
            },
            {
                path: 'teacher/resources/:courseId',
                component: () => import('@/views/teacher/TeacherCourseResource.vue'),
                meta: { role: 'TEACHER', title: '课程资源', activeMenu: '/teacher/courses' }
            },
            {
                path: 'teacher/submissions/:assignmentId',
                component: () => import('@/views/teacher/TeacherSubmissions.vue'),
                meta: { role: 'TEACHER', title: '作业提交', activeMenu: '/teacher/courses' }
            },
            {
                path: 'forum',
                component: () => import('@/views/forum/ForumHome.vue'),
                meta: { title: '论坛交流', roles: ['STUDENT', 'TEACHER', 'ADMIN'] }
            },
            {
                path: 'forum/publish',
                component: () => import('@/views/forum/ForumPublish.vue'),
                meta: { title: '发布帖子', roles: ['STUDENT', 'TEACHER', 'ADMIN'] }
            },
            {
                path: 'forum/:id',
                component: () => import('@/views/forum/ForumDetail.vue'),
                meta: { title: '帖子详情', roles: ['STUDENT', 'TEACHER', 'ADMIN'], activeMenu: '/forum' }
            },
            {
                path: 'notifications',
                component: () => import('@/views/notificationtifications.vue'),
                meta: { title: '通知中心', roles: ['STUDENT', 'TEACHER', 'ADMIN'] }
            },
            {
                path: 'admin/courses',
                component: () => import('@/views/admin/AdminCourses.vue'),
                meta: { role: 'ADMIN', title: '课程审核', activeMenu: '/admin/courses' }
            },
            {
                path: 'admin/users',
                component: () => import('@/views/admin/AdminUsers.vue'),
                meta: { role: 'ADMIN', title: '用户管理', activeMenu: '/admin/users' }
            },
            {
                path: 'admin/course-manage',
                component: () => import('@/views/admin/AdminCourseManage.vue'),
                meta: { role: 'ADMIN', title: '课程管理', activeMenu: '/admin/course-manage' }
            },
            {
                path: 'admin/forum',
                component: () => import('@/views/admin/AdminForumManage.vue'),
                meta: { role: 'ADMIN', title: '论坛管理', activeMenu: '/admin/forum' }
            },
            {
                path: 'teacher/questions',
                component: () => import('@/views/teacher/QuestionManage.vue'),
                meta: { roles: ['TEACHER'], title: '题库管理', activeMenu: '/teacher/questions' }
            },
            {
                path: 'teacher/practices',
                component: () => import('@/views/teacher/PracticeManage.vue'),
                meta: { roles: ['TEACHER'], title: '练习管理', activeMenu: '/teacher/practices' }
            },
            {
                path: 'teacher/practice-stats',
                component: () => import('@/views/teacher/PracticeStats.vue'),
                meta: { roles: ['TEACHER'], title: '练习统计', activeMenu: '/teacher/practice-stats' }
            },
            {
                path: 'student/practices',
                component: () => import('@/views/student/PracticeList.vue'),
                meta: { roles: ['STUDENT'], title: '练习中心', activeMenu: '/student/practices' }
            },
            {
                path: 'student/practice/:id',
                component: () => import('@/views/student/PracticeDo.vue'),
                meta: { roles: ['STUDENT'], title: '练习作答', activeMenu: '/student/practices' }
            },
            {
                path: 'student/practice-result',
                component: () => import('@/views/student/PracticeResult.vue'),
                meta: { roles: ['STUDENT'], title: '练习结果', activeMenu: '/student/practice-records' }
            },
            {
                path: 'student/practice-records',
                component: () => import('@/views/student/StudentRecord.vue'),
                meta: { roles: ['STUDENT'], title: '练习记录', activeMenu: '/student/practice-records' }
            },
            {
                path: 'student/practice-review',
                component: () => import('@/views/student/PracticeStats.vue'),
                meta: { roles: ['STUDENT'], title: '错题与收藏', activeMenu: '/student/practice-review' }
            }
        ]
    }
];
const router = createRouter({
    history: createWebHistory(),
    routes
});
router.beforeEach((to) => {
    const store = useAuthStore();
    if (to.path !== '/login' && !store.isLogin)
        return '/login';
    const role = to.meta?.role;
    const roles = to.meta?.roles;
    if (role && store.role !== role)
        return '/profile';
    if (roles && !roles.includes(store.role))
        return '/profile';
    if (to.path === '/login' && store.isLogin) {
        if (store.role === 'STUDENT')
            return '/student/home';
        if (store.role === 'TEACHER')
            return '/teacher/courses';
        if (store.role === 'ADMIN')
            return '/admin/courses';
    }
});
export default router;
