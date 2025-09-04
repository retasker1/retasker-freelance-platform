import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("auth/callback", "routes/auth.callback.tsx"),
  route("auth/quick", "routes/auth.quick.tsx"),
  route("orders", "routes/orders.tsx"),
  route("orders/new", "routes/orders.new.tsx"),
  route("me", "routes/me.tsx"),
  route("api/orders", "routes/api/orders.ts"),
  route("api/deals", "routes/api/deals.ts"),
  route("api/users", "routes/api/users.ts"),
  route("api/auth/telegram", "routes/api/auth.telegram.ts"),
  route("api/auth/telegram_web", "routes/api/auth.telegram_web.ts"),
  route("api/auth/generate-link", "routes/api.auth.generate-link.ts"),
  route("api/auth/quick", "routes/api.auth.quick.ts"),
  route("api/simple", "routes/api/simple.ts"),
] satisfies RouteConfig;
