import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "invitation",
    component: () => import("../views/InvitationView.vue"),
    meta: { hideChrome: true },
  },
  {
    path: "/kisah-kami",
    name: "story",
    component: () => import("../views/StoryView.vue"),
  },
  {
    path: "/jemputan",
    name: "jemputan",
    component: () => import("../views/JemputanView.vue"),
  },
  {
    path: "/rsvp",
    name: "rsvp",
    component: () => import("../views/RsvpView.vue"),
  },
  {
    path: "/rsvp/semak",
    name: "rsvp-manage",
    component: () => import("../views/ManageRsvpView.vue"),
  },
  {
    path: "/admin/login",
    name: "admin-login",
    component: () => import("../views/admin/AdminLoginView.vue"),
  },
  {
    path: "/admin",
    name: "admin-dashboard",
    component: () => import("../views/admin/AdminDashboardView.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("../views/NotFoundView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
