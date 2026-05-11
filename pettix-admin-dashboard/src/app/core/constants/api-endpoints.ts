const BASE_URL = 'https://localhost:7242';
const AUTH_BASE = `${BASE_URL}/api/Security/Authentication`;
const DASHBOARD_BASE = `${BASE_URL}/api/Dashboards/AdminDashboard`;
const USERS_BASE = `${BASE_URL}/api/Security/Users`;
const CONTACTS_BASE = `${BASE_URL}/api/Security/Contact`;
const PETS_BASE = `${BASE_URL}/api/Adoption/Pets`;
const ADOPTIONS_BASE = `${BASE_URL}/api/Adoption/AdoptionForms`;
const POSTS_BASE = `${BASE_URL}/api/Timeline/Posts`;

export const API_ENDPOINTS = {
    ACCOUNT: {
        LOGIN: `${AUTH_BASE}/login`,
        REFRESH_TOKEN: `${AUTH_BASE}/refresh-token`,
        LOGOUT: `${AUTH_BASE}/logout`
    },
    DASHBOARD: {
        STATS: `${DASHBOARD_BASE}/Stats`,
        ANALYTICS: `${DASHBOARD_BASE}/Analytics`,
        ACTIVITIES: `${DASHBOARD_BASE}/RecentActivities`,
        TIMELINE: `${DASHBOARD_BASE}/TimelineStats`,
        REPORTS: {
            LIST: `${DASHBOARD_BASE}/RecentReports`,
            PAGED: `${DASHBOARD_BASE}/RecentReports/paged`
        }
    },
    USERS: {
        LIST: USERS_BASE,
        BY_ID: (id: number) => `${USERS_BASE}/${id}`,
        DELETE: (id: number) => `${USERS_BASE}/${id}`,
        PROFILE: (id: number) => `${DASHBOARD_BASE}/Users/${id}/Profile`
    },
    CONTACTS: {
        LIST: CONTACTS_BASE,
        BY_ID: (id: number) => `${CONTACTS_BASE}/${id}`,
        DELETE: (id: number) => `${CONTACTS_BASE}/${id}`,
        UPDATE_STATUS: (id: number) => `${CONTACTS_BASE}/${id}/status`
    },
    PETS: {
        LIST: PETS_BASE,
        PAGED: `${PETS_BASE}/paged`,
        BY_ID: (id: number) => `${PETS_BASE}/${id}`,
        DELETE: (id: number) => `${PETS_BASE}/${id}`,
        UPDATE_STATUS: (id: number) => `${PETS_BASE}/${id}/status`,
        BLOCK: (id: number) => `${PETS_BASE}/${id}/block`,
        REPORT: (id: number) => `${PETS_BASE}/${id}/report`,
        ADMIN_USER_PETS: (id: number) => `${PETS_BASE}/admin/user/${id}/pets`
    },
    PET_REPORTS: {
        LIST: `${PETS_BASE}/reports`,
        BY_PET: (id: number) => `${PETS_BASE}/${id}/reports`,
        READ: (id: number) => `${PETS_BASE}/reports/${id}/read`,
        READ_ALL: `${PETS_BASE}/reports/mark-all-read`
    },
    ADOPTIONS: {
        LIST: ADOPTIONS_BASE,
        BY_ID: (id: number) => `${ADOPTIONS_BASE}/${id}`,
        ADMIN_CLIENT_FORMS: (id: number) => `${ADOPTIONS_BASE}/admin/user/${id}/clients-forms`,
        ADMIN_OWNER_FORMS: (id: number) => `${ADOPTIONS_BASE}/admin/user/${id}/owner-forms`
    },
    POSTS: {
        LIST: POSTS_BASE,
        PAGED: `${POSTS_BASE}/paged`,
        BY_ID: (id: number) => `${POSTS_BASE}/${id}`,
        DELETE: (id: number) => `${POSTS_BASE}/${id}`,
        UPDATE_STATE: (id: number) => `${POSTS_BASE}/${id}/state`,
        BY_USER: `${POSTS_BASE}/user-posts`,
        ADMIN_USER_POSTS: (id: number) => `${POSTS_BASE}/admin/user/${id}/posts`
    },
    COMMENTS: {
        LIST: `${BASE_URL}/api/Timeline/Comments`,
        PAGED: `${BASE_URL}/api/Timeline/Comments/paged`,
        BY_ID: (id: number) => `${BASE_URL}/api/Timeline/Comments/${id}`,
        UPDATE_STATUS: (id: number) => `${BASE_URL}/api/Timeline/Comments/${id}/status`,
        DELETE: (id: number) => `${BASE_URL}/api/Timeline/Comments/${id}`,
        ADMIN_USER_COMMENTS: (id: number) => `${BASE_URL}/api/Timeline/Comments/admin/user/${id}/comments`
    },
    LIKES: {
        POST: {
            LIST: `${BASE_URL}/api/Timeline/PostLikes`,
            PAGED: `${BASE_URL}/api/Timeline/PostLikes/paged`
        },
        COMMENT: {
            LIST: `${BASE_URL}/api/Timeline/CommentLikes`,
            PAGED: `${BASE_URL}/api/Timeline/CommentLikes/paged`
        }
    },
    SEARCH: {
        GLOBAL: `${BASE_URL}/api/Dashboards/Search/GlobalSearch`,
    },
    POST_REPORTS: {
        BY_POST: (id: number) => `${BASE_URL}/api/Timeline/PostReport/post/${id}`,
        LIST: `${BASE_URL}/api/Timeline/PostReport/all`,
        READ: (id: number) => `${BASE_URL}/api/Timeline/PostReport/${id}/read`,
        READ_ALL: `${BASE_URL}/api/Timeline/PostReport/mark-all-read`
    },
    NOTIFICATIONS: {
        SEARCH: `${BASE_URL}/api/Notifications/AdminSearch`,
        READ: (id: number) => `${BASE_URL}/api/Notifications/Read/${id}`,
        READ_ALL: `${BASE_URL}/api/Notifications/ReadAll`,
    }
};
