import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("chats/:chatId/send", "routes/chats.$chatId.send.tsx"),
] satisfies RouteConfig;
