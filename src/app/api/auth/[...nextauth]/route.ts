import { handlers } from "@/auth";

// The sign-in asks the CMS: up to two tries, 25 seconds each
// (src/cms/forms.ts).
export const maxDuration = 60;

export const { GET, POST } = handlers;
