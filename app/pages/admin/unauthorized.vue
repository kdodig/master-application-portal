<script setup lang="ts">
async function goBack() {
  const router = useRouter()
  const routes = router.getRoutes()
  const previousRoute = routes[routes.length - 1] // Get the second last route as the previous route
  if (previousRoute) {
    await navigateTo(previousRoute.path)
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full text-center p-4 gap-2">
    <Icon name="lucide:lock" class="size-8 text-error" />
    <h1 class="text-3xl font-bold">
      Unauthorized Access
    </h1>
    <p class="text-lg">
      You do not have permission to view this page.
    </p>
    <p class="text-xs text-muted">
      If you believe this is an error, please contact the administrator.
    </p>
    <UButton variant="ghost" icon="lucide:arrow-left" @click="goBack">
      Go Back
    </UButton>
  </div>
</template>
