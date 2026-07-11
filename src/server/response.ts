export function redirectResponse(location: string | URL, status = 302) {
  return new Response(null, {
    status,
    headers: { location: location.toString() },
  });
}
