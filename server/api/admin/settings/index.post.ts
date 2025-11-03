import { z } from 'zod'

const schema = z.object({
  applicationPeriodStart: z.coerce.date().optional(),
  applicationPeriodEnd: z.coerce.date().optional(),
})

export default defineEventHandler(async (event) => {
  const validatedBody = await readValidatedBody(event, body => schema.safeParse(body))

  if (!validatedBody.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid input data.',
      data: validatedBody.error.errors,
    })
  }

  const { applicationPeriodStart, applicationPeriodEnd } = validatedBody.data

  if (applicationPeriodEnd) {
    applicationPeriodEnd.setHours(23, 59, 59, 999)
  }

  const [settings] = await useDatabase()
    .update(tables.settings)
    .set({
      applicationPeriodStart: applicationPeriodStart || undefined,
      applicationPeriodEnd: applicationPeriodEnd || undefined,
    })
    .returning()

  if (!settings) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Unable to update settings.',
    })
  }

  return settings
})
