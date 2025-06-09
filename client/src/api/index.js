// src/api/index.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' },
});

export const setAdminAuth = (u, p) => {
  api.defaults.headers['username'] = u;
  api.defaults.headers['password'] = p;
};
// POST /api/admin/slots
export const addAvailableSlots = ({ date, times }) =>
  api.post('/admin/slots', { date, times });
export const createUser = payload => api.post('/user', payload);
export const fetchSlots = () => api.get('/slots').then(r => r.data);
export const bookAppointment = payload => api.post('/book', payload);
export const fetchMyAppointments = (name, phone) =>
  api.get('/appointments', { params: { name, phone } }).then(r => r.data);
export const cancelAppointment = payload =>
  api.post('/cancel', payload);

export default api;
