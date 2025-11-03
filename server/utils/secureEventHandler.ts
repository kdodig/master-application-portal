import type { EventHandler, EventHandlerRequest } from 'h3'

/**
 * Secure event handler util to support auth and role based access control.
 * @param security Boolean to require or disable auth, or a role key or array of role keys to require specific roles.
 * @param handler The event handler to wrap with security checks.
 */
export function defineSecureResponseHandler<T extends EventHandlerRequest, D>(
  security: Role['key'] | Array<Role['key']> | boolean,
  handler: EventHandler<T, D>,
): EventHandler<T, D> {
  return defineEventHandler<T>(async (event) => {
    try {
      // Secure logic applies if security is a truthy value or a role or an array of roles
      if (security) {
        // 1: Get user session from event
        const session = await requireUserSession(event)

        // 2: Check if user is logged in
        if (!session) {
          throw createError({
            statusCode: 401,
            statusText: 'You must be logged in to access this endpoint!',
          })
        }

        // Role based access control is applied if security is not just `true`
        if (typeof security !== 'boolean') {
          const securityLevels = Array.isArray(security) ? security : [security]

          // 3: Check if user has roles
          const sessionRoles = session.user.roles?.map(role => role.key) || []
          if (!sessionRoles.some(role => securityLevels.includes(role))) {
            throw createError({
              statusCode: 401,
              statusText: 'You are not authorized to access this endpoint!',
            })
          }
        }
      }

      // User is authorized to access this endpoint
      return await handler(event)
    } catch (err) {
      return { err }
    }
  })
}

export {
  defineSecureResponseHandler as secureEventHandler,
}
