import { createClient } from "@sanity/client";
import { apiVersion, dataset, projectId } from "../env";

// Separate from the read-only `client`/`freshClient` in ./client.ts —
// this one needs a token with actual write/editor permissions in
// Sanity's API tokens settings. It was previously pointed at
// SANITY_API_READ_TOKEN, which (if that env var really only grants
// read access, as the name implies) would make every `.create()` /
// `.patch()` call through this client fail with a permissions error.
// Set SANITY_API_WRITE_TOKEN in .env.local / your deploy environment
// to a token with "Editor" (or "Write") permissions.
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});
