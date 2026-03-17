import { redirectToDefaultLocale, type RedirectSearchParams } from "@/lib/default-locale-redirect";

export default async function RootRedirectPage({
  searchParams,
}: {
  searchParams?: Promise<RedirectSearchParams>;
}) {
  await redirectToDefaultLocale("/", searchParams);
}
