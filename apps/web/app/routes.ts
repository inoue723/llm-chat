import {
  index,
  layout,
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),
    route("chats/:chatId", "routes/chats/$chatId.tsx"),
  ]),
  route("chats/messages/create", "routes/api/messages.create.ts"),
  route("chats/:chatId/delete", "routes/chats/$chatId.delete.tsx"),
] satisfies RouteConfig;
