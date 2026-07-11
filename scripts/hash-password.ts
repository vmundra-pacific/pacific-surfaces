// Usage: npx tsx scripts/hash-password.ts "the customer's password"
//
// Prints a bcrypt hash to paste into the customer document's
// "Password Hash" field in Sanity Studio (src/sanity/schemas/customer.ts)
// when manually onboarding a new customer account. There's no
// self-serve signup flow yet, so this is currently the only way a
// customer gets a working password.
import bcrypt from "bcryptjs";

async function main() {
  const password = process.argv[2];

  if (!password) {
    console.error('Usage: npx tsx scripts/hash-password.ts "the password"');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  console.log(hash);
}

main();
