<script setup lang="ts">
</script>

<template>
  <div class="p-6 flex flex-col gap-4">
    <h1 class="text-2xl font-bold">Admin Demo</h1>
    <p class="text-muted">Klickbare Routen für Demo-Screenshots (ohne Backend).</p>
    <ul class="list-disc ps-6">
      <li>
        <NuxtLink to="/admin/login">Login</NuxtLink>
      </li>
      <li>
        <NuxtLink to="/admin/user/change-password">Passwort ändern</NuxtLink>
      </li>
      <li>
        <NuxtLink to="/admin/stats">Dashboard/Statistiken</NuxtLink>
      </li>
      <li>
        <NuxtLink to="/admin/demo/applicants">Bewerberübersicht (Demo)</NuxtLink>
      </li>
      <li>
        <NuxtLink to="/admin/demo/settings/accounts">Einstellungen: Accounts (Demo)</NuxtLink>
      </li>
    </ul>
  </div>
</template>

