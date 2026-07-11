import { auth } from "@/auth";
import { redirect } from "next/navigation";

// /customer on its own isn't a real page — dispatch straight to
// whichever destination makes sense for this visitor. This file was
// previously empty, which broke `tsc --noEmit` ("is not a module").
export default async function CustomerIndexPage() {
  const session = await auth();
  redirect(session?.user ? "/customer/dashboard" : "/customer/login");
}
