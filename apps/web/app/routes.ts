import {
  index,
  layout,
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),
    route("chats", "routes/chats/_layout.tsx", [
      index("routes/chats/index.tsx"),
      route(":chatId", "routes/chats/$chatId.tsx"),
    ]),
  ]),
  route("chats/:chatId/messages/create", "routes/chats/messages/create.ts"),
  route("chats/create", "routes/chats/create.ts"),
] satisfies RouteConfig;
