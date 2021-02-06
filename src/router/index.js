import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Register from "../views/Register";
import Login from "../views/Login";
import Profile from "../views/Profile";
import ChangePassword from "../views/ChangePassword";
import GoogleAuthManager from "../views/GoogleAuthManager";
import UsersManager from "../views/UsersManager";
import GoogleAuth from "../components/GoogleAuthSetup";
import ResetPassword from "../views/ResetPassword";
import Sso from "../views/Sso.vue";
import E404 from "../views/404.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: { requireAuth: true },
    redirect: "/profile",
    children: [
      {
        path: "/profile",
        component: Profile,
        meta: { requireAuth: true }
      },
      {
        path: "/change_password",
        component: ChangePassword,
        meta: { requireAuth: true }
      },
      {
        path: "/google_auth_manager",
        component: GoogleAuthManager,
        meta: { requireAuth: true }
      },
      {
        path: "/um",
        component: UsersManager,
        meta: { requireAuth: true }
      }
    ]
  },
  {
    path: "/register",
    name: "register",
    component: Register
  },
  {
    path: "/login",
    name: "login",
    component: Login
  },
  {
    path: "/reset_password",
    name: "reset_password",
    component: ResetPassword
  },
  {
    path: "/test",
    component: GoogleAuth
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
        import(/* webpackChunkName: "about" */ "../views/About.vue")
  },
  {
    path: "/sso",
    name: "sso",
    component: Sso
  },
  {
    path: "*",
    component: E404
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
