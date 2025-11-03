import { z } from 'zod'

const pdfNameSchema = z.string().refine((val) => {
  const [uuid, ext] = val.split('.')
  return uuid && ext && z.string().uuid().safeParse(uuid).success && ext === 'pdf'
}, { message: 'Invalid PDF filename' })

export default secureEventHandler(true, async (event) => {
  const filename = getRouterParam(event, 'pdf')

  if (!filename || !pdfNameSchema.safeParse(filename).success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid filename' })
  }

  const { bucket } = useRuntimeConfig().minio
  const minioClient = useMinio()

  const bucketExists = await minioClient.bucketExists(bucket)
  if (!bucketExists) {
    throw createError({ statusCode: 500, statusMessage: 'Bucket is not set up' })
  }

  return await minioClient.getObject(bucket, filename)
})
