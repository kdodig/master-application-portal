declare module '#auth-utils' {
  interface User extends Omit<FullAccount, 'passwordHash'> {
    // Add your own fields
  }
}

export {}
