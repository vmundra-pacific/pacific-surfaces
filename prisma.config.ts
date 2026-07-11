// Disabled — this project stores all customer/grievance data in
// Sanity (see src/sanity/schemas/customer.ts and grievance.ts), not
// Prisma/Postgres. This file was left over from an earlier approach
// and references a `prisma` package that was never installed
// (confirmed absent from package.json), which broke `tsc --noEmit`
// for the whole repo.
//
// This file has no real purpose anymore; delete it
// (prisma.config.ts, at the repo root) whenever convenient.
export {};
