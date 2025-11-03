import type { ClientOptions } from 'minio'
import * as Minio from 'minio'

let minioClient: Minio.Client | null = null

/**
 * Composable to get a Minio client instance.
 * If a client instance already exists, it will be reused.
 * @param clientOptions Optional client options to override the default configuration.
 * @returns Minio client instance.
 */
export default function useMinio(clientOptions?: ClientOptions) {
  if (!minioClient) {
    const minioConfig = useRuntimeConfig().minio
    minioClient = new Minio.Client({
      ...minioConfig,
      ...clientOptions,
    })
  }
  return minioClient
}
