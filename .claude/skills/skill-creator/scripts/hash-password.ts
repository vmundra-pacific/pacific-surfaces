import bcrypt from "bcryptjs";

async function main() {
  const password = "password123";

  const hash = await bcrypt.hash(password, 12);

  console.log(hash);
}

main();