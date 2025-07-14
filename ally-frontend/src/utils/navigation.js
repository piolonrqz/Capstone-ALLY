// Centralized navigation utility for managing hidden navigation routes
// Used by both NavigationBar and App components to ensure consistency

/**
 * Routes where the navigation bar should be hidden
 */
export const hiddenNavRoutes = ['/admin', '/settings', '/login', '/signup', '/'];

/**
 * Determines if the navigation bar should be visible for a given pathname
 * @param {string} pathname - The current route pathname
 * @returns {boolean} - True if navigation should be visible, false if hidden
 */
export const shouldShowNavigation = (pathname) => {
  return !(hiddenNavRoutes.some(route => pathname.startsWith(route)) || 
           hiddenNavRoutes.includes(pathname));
};

/**
 * Determines if the navigation bar should be hidden for a given pathname
 * @param {string} pathname - The current route pathname
 * @returns {boolean} - True if navigation should be hidden, false if visible
 */
export const shouldHideNavigation = (pathname) => {
  return !shouldShowNavigation(pathname);
};
