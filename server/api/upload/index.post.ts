export default defineEventHandler(async (event) => {
  const formData = await readFormData(event)
  const file = formData.get('file') as File

  if (!file) {
    throw createError({ statusCode: 400, message: 'No file uploaded' })
  }

  const { bucket } = useRuntimeConfig().minio
  const minioClient = useMinio()

  const bucketExists = await minioClient.bucketExists(bucket)
  if (!bucketExists) {
    await minioClient.makeBucket(bucket)
  }

  const [upload] = await useDatabase().insert(tables.uploads).values({
    fileName: file.name || 'unnamed',
  }).returning()

  // eslint-disable-next-line node/prefer-global/buffer
  const fileBuffer = Buffer.from(await file.arrayBuffer())

  await minioClient.putObject(
    bucket,
    `${upload.id}.pdf`,
    fileBuffer,
    fileBuffer.length,
    { ContentType: file.type || 'application/pdf' },
  )

  return upload
})
