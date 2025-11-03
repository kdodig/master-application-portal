<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
    <AdminStatsWorldMap />

    <div class="flex flex-col gap-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AdminStatsApplicantsByStatus />

        <AdminStatsApplicantsByMasterTrack />
      </div>

      <AdminStatsApplicantsOverTime />

      <AdminStatsNumberCards />
    </div>
  </div>
</template>
