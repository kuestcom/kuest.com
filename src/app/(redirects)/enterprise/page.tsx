import { redirectToDefaultLocale, type RedirectSearchParams } from "@/lib/default-locale-redirect";

export default async function EnterpriseRedirectPage({
  searchParams,
}: {
  searchParams?: Promise<RedirectSearchParams>;
}) {
  await redirectToDefaultLocale("/enterprise", searchParams);
}
