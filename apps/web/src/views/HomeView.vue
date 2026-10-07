<script setup lang="ts">
/**
 * Placeholder page.
 *
 * It confirms the Vue + Vite + Tailwind + Router + Pinia stack compiles and
 * renders. Deliberately says nothing about Operation Goonfall — the real UI is
 * written once the features exist.
 */
const stack = [
  "Vue 3",
  "Vite",
  "TypeScript",
  "Tailwind CSS v4",
  "Vue Router",
  "Pinia",
] as const;
</script>

<template>
  <main
    class="flex min-h-full flex-col items-center justify-center gap-6 bg-slate-950 px-6 py-16 text-slate-100"
  >
    <h1 class="text-3xl font-semibold tracking-tight">Operation Goonfall</h1>

    <p class="max-w-md text-center text-sm text-slate-400">
      Development workspace is running. The application itself has not been
      built yet.
    </p>

    <ul class="flex flex-wrap justify-center gap-2">
      <li
        v-for="item in stack"
        :key="item"
        class="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300"
      >
        {{ item }}
      </li>
    </ul>
  </main>
</template>
