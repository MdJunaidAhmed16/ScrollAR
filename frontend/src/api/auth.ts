import client from "./client";
import type { TokenResponse } from "../types";

export const authApi = {
  register: (data: { email: string; username: string; password: string }) =>
    client.post<TokenResponse>("/auth/register", data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    client.post<TokenResponse>("/auth/login", data).then((r) => r.data),

  me: () =>
    client.get<TokenResponse["user"]>("/auth/me").then((r) => r.data),
};
