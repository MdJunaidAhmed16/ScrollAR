import client from "./client";
import type { User } from "../types";

export const authApi = {
  me: () => client.get<User>("/auth/me").then((r) => r.data),
};
