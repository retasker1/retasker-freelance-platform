import type { Route } from "./+types/orders";

export interface LoaderArgs {
  request: Request;
}

export interface LoaderData {
  activeOrders: number;
  completedOrders: number;
  totalUsers: number;
  totalBudget: number;
}
