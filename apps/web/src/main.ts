import { createPinia } from "pinia";
import { createApp } from "vue";

import App from "./App.vue";
import { router } from "./router";
import "./style.css";

/**
 * Web application entrypoint.
 *
 * Pinia and Vue Router are installed here so feature code can use them
 * immediately. Neither has any application state or routes registered yet —
 * those arrive with the features themselves.
 */
createApp(App).use(createPinia()).use(router).mount("#app");