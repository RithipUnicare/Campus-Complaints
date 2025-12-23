export const BASE_URL = 'https://app.undefineddevelopers.online/campuscomplaint'; // Change this to your server IP if testing on a real device

export const ENDPOINTS = {
  // Auth
  SIGNUP: '/auth/signup',
  LOGIN: '/auth/login',
  REFRESH_TOKEN: '/auth/refresh',
  UPDATE_ROLE: '/auth/update-role',
  REQUEST_PASSWORD_RESET: '/auth/request-password-reset',
  RESET_PASSWORD: '/auth/reset-password',

  // User
  GET_PROFILE: '/user/profile',
  GET_ALL_USERS: '/user',
  EDIT_USER: '/user/edit',

  // Notifications
  GET_UNREAD_NOTIFICATIONS: '/api/notifications/unread',
  MARK_NOTIFICATIONS_READ: '/api/notifications/mark-read',

  // Complaints
  SUBMIT_COMPLAINT: '/api/complaints/submit',
  GET_COMPLAINTS_MAP: '/api/complaints/map/list',
  GET_MY_COMPLAINTS: '/api/complaints/history/my',
  SEARCH_COMPLAINTS: '/api/complaints/admin/search',
  GET_ALL_COMPLAINTS: '/api/complaints/admin/',
  GET_COMPLAINT_DETAIL: '/api/complaints/admin',
  UPDATE_COMPLAINT: '/api/complaints/admin',
  BULK_UPDATE_COMPLAINTS: '/api/complaints/admin/bulk-update',
};
