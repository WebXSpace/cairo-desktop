import { app } from 'electron';

export const mode = app.isPackaged || 'development';
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:3000/';
export const openDevTools = mode == 'development';
// export const openDevTools = false;
