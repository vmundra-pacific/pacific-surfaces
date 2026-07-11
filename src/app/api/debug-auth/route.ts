// Disabled — this was a development scratch endpoint that returned a
// customer record (including passwordHash) and tested a hardcoded
// password with no authentication. That's a serious data leak if it
// ever shipped, so the handler has been neutered rather than left live.
//
// This file has no real purpose anymore; delete it
// (src/app/api/debug-auth/route.ts) whenever convenient.
export async function GET() {
  return new Response("Not found", { status: 404 });
}
