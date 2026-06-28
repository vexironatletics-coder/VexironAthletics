/**
 * Single bundle entry for server.js — avoids loading createApp.js and
 * startServices.js separately (which double-registers Mongoose models and crashes).
 */
export { createApp } from './createApp';
export { startBackendServices } from './startServices';
