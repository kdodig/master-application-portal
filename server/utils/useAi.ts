import OpenAI from 'openai'

let client: OpenAI | null = null

/**
 * Composable to get an OpenAI client instance.
 * If a client instance already exists, it will be reused.
 * @returns OpenAI client instance.
 */
export function useAi() {
  if (!client) {
    const { OPENAI_BASE_URL, OPENAI_API_KEY } = useRuntimeConfig()

    client = new OpenAI({
      baseURL: OPENAI_BASE_URL || undefined,
      apiKey: OPENAI_API_KEY,
    })
  }
  return client
}
