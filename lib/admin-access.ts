export const API_ENDPOINTS_ADMIN_EMAIL = "jagadeeshwaransp5@gmail.com";

export const canViewApiEndpoints = (email?: string | null) =>
  email?.toLowerCase() === API_ENDPOINTS_ADMIN_EMAIL;
