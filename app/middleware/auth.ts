export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, user } = useUserSession()

  // If the user is already logged in, allow access to the route
  if (loggedIn.value) {
    // If the user's password is temporary, force them to change it
    if (user.value?.passwordTemporary && to.path !== '/admin/user/change-password') {
      return navigateTo('/admin/user/change-password')
    }

    // If the page meta requires certain roles, check if the user has one of those roles
    if (to.meta.roles && to.meta.roles.length > 0) {
      const userRoles = user.value?.roles
      const requiredRoles = to.meta.roles
      const userHasRequiredRoles = userRoles?.some(role => requiredRoles.includes(role.key))
      if (!userHasRequiredRoles) {
        return navigateTo('/admin/unauthorized')
      }
    }

    return
  }

  // Allow access to the login page if not logged in
  if (to.path === '/admin/login') {
    return
  }

  // If the user is not logged in and trying to access a protected route, redirect to login
  return navigateTo('/admin/login')
})
