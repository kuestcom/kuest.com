import { redirectToDefaultLocale, type RedirectSearchParams } from "@/lib/default-locale-redirect";

export default async function LaunchRedirectPage({
  searchParams,
}: {
  searchParams?: Promise<RedirectSearchParams>;
}) {
  await redirectToDefaultLocale("/launch", searchParams);
}
