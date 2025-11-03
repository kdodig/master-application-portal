declare module '#app' {
  interface PageMeta {
    roles?: Role['key'][]
  }
}

// It is always important to ensure you import/export something when augmenting a type
export {}
