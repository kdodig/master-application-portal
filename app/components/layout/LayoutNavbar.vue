<template>
  <div class="h-(--ui-header-height) shrink-0 flex items-center justify-between border-b border-(--ui-border) bg-(--ui-background) px-4 z-100">
    <div class="h-full p-2">
      <NuxtImg
        class="h-full dark:invert"
        src="wwu-logo.svg"
        alt="Logo"
      />
    </div>

    <slot />
  </div>
</template>
