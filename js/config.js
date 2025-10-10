// Configure API base URL if you run the PHP backend.
// Example: Set window.NEOSHOP_API_BASE = 'http://localhost/neoshop-backend';
// Otherwise leave empty to use local JSON data.

export const API_BASE = typeof window !== 'undefined' && window.NEOSHOP_API_BASE
  ? String(window.NEOSHOP_API_BASE).replace(/\/$/, '')
  : '';


