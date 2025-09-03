import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("orders", "routes/orders.tsx"),
  route("me", "routes/me.tsx"),
  route("api/orders", "routes/api.orders.ts"),
  route("api/deals", "routes/api.deals.ts"),
  route("api/auth/telegram", "routes/api.auth.telegram.ts"),
] satisfies RouteConfig;
