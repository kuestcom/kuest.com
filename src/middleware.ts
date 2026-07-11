import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(({ url, redirect }, next) => {
  if (url.pathname === "/en" || url.pathname.startsWith("/en/")) {
    const target = `${url.pathname.slice(3) || "/"}${url.search}`;
    return redirect(target, 308);
  }
  return next();
});
