import { z } from 'zod'

/**
 * Schema for account creation validation.
 */
export const accountCreateSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  email: z.string().email('Invalid email address.'),
  active: z.boolean().optional(),
  roles: z.array(z.string()).optional(),
})

/**
 * Type definition for the account creation schema.
 */
export type AccountCreateSchema = z.infer<typeof accountCreateSchema>

/**
 * Function to create a new account.
 * @param account - The account object containing the data to create.
 */
export async function fetchAccountCreate(account: AccountCreateSchema) {
  const { add: addToast } = useToast()

  await $fetch('/api/admin/accounts', {
    method: 'POST',
    body: account,
    onResponse: ({ response }) => {
      if (response.ok) {
        addToast({
          title: 'Account creation successful',
          description: `The Account for ${account.firstName} ${account.lastName} has been created.`,
          color: 'success',
        })
      } else {
        addToast({
          title: 'Creation failed',
          description: `Failed to create the account. Please try again.`,
          color: 'error',
        })
      }
    },
  })
}

/**
 * Schema for account update validation.
 */
export const accountUpdateSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  active: z.boolean().optional(),
  roles: z.array(z.string()).optional(),
})

/**
 * Type definition for the account update schema.
 */
export type AccountUpdateSchema = z.infer<typeof accountUpdateSchema>

/**
 * Function to update an account.
 * @param account - The account object containing the updated data.
 */
export async function fetchAccountUpdate(account: AccountUpdateSchema) {
  const { add: addToast } = useToast()

  const { id, ...updateData } = account

  await $fetch(`/api/admin/accounts/${id}`, {
    method: 'POST',
    body: updateData,
    onResponse: ({ response }) => {
      if (response.ok) {
        addToast({
          title: 'Account update successful',
          description: `The Account has been updated.`,
          color: 'success',
        })
      } else {
        addToast({
          title: 'Update failed',
          description: `Failed to update the account. Please try again.`,
          color: 'error',
        })
      }
    },
  })
}

/**
 * Function to delete an account by ID.
 * @param userId - The ID of the account to delete.
 */
export async function fetchAccountDelete(userId: Account['id']) {
  const { add: addToast } = useToast()

  return $fetch(`/api/admin/accounts/${userId}`, {
    method: 'DELETE',
    onResponse: ({ response }) => {
      if (response.ok) {
        const user = response._data as Account
        addToast({
          title: 'Account deleted successfully',
          description: `Account for ${user.firstName} ${user.lastName} has been deleted.`,
          color: 'success',
        })
      } else {
        addToast({
          title: 'Deletion failed',
          description: `Failed to delete account. Please try again.`,
          color: 'error',
        })
      }
    },
  })
}
