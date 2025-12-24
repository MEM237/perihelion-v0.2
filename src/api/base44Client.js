import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "694b4f2681a1c65e4989bb6f", 
  requiresAuth: true // Ensure authentication is required for all operations
});
