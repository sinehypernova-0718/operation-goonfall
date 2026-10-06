import { createRouter, createWebHistory } from "vue-router";

import HomeView from "../views/HomeView.vue";

/**
 * Application routes.
 *
 * A single placeholder route for now — it exists so the router is genuinely
 * wired up rather than merely installed. Real routes are added alongside the
 * features that need them.
 */
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
  ],
});