import { redirectToDefaultLocale, type RedirectSearchParams } from "@/lib/default-locale-redirect";

export default async function ProtocolRedirectPage({
  searchParams,
}: {
  searchParams?: Promise<RedirectSearchParams>;
}) {
  await redirectToDefaultLocale("/protocol", searchParams);
}
