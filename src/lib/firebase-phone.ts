/**
 * The browser half of mobile verification for the Where to Buy lead form:
 * Firebase Authentication texts a code to the visitor's mobile, behind an
 * invisible reCAPTCHA, and turns the right code into an ID token that
 * /api/where-to-buy/lead checks (lib/phone-verification.ts).
 *
 * Imported only when "Send code" is pressed, so the Firebase SDK never
 * weighs on the page. The sign-in lives in memory only and is signed out
 * at once: Firebase is used to prove the number, not to keep a session.
 * Errors are thrown with a message fit to show the visitor.
 */
import { getApps, initializeApp } from "firebase/app";
import {
  RecaptchaVerifier,
  inMemoryPersistence,
  initializeAuth,
  signInWithPhoneNumber,
  signOut,
  type Auth,
} from "firebase/auth";

let auth: Auth | null = null;

function firebaseAuth() {
  if (auth) return auth;
  const app =
    getApps()[0] ??
    initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  auth = initializeAuth(app, { persistence: inMemoryPersistence });
  auth.useDeviceLanguage();
  return auth;
}

/** What to tell the visitor for a Firebase error. */
function message(error: unknown) {
  const code = (error as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/invalid-phone-number":
      return "That mobile number is not valid.";
    case "auth/too-many-requests":
      return "Too many tries from this device. Please try again later.";
    case "auth/invalid-verification-code":
      return "That code is not right. Check the SMS and try again.";
    case "auth/code-expired":
      return "That code has expired. Send a new one.";
    case "auth/captcha-check-failed":
      return "The security check did not pass. Please try again.";
    default:
      console.error("[firebase-phone]", error);
      return "We could not send the code. Please try again in a moment.";
  }
}

/**
 * Text a code to +91 `mobile` (10 digits). Resolves to `confirm`, which
 * turns the code the visitor types into an ID token, once.
 *
 * `host` is an element for the invisible reCAPTCHA; each send renders a
 * fresh one inside it, since a reCAPTCHA answers only one request.
 */
export async function sendCode(
  mobile: string,
  host: HTMLElement
): Promise<(code: string) => Promise<string>> {
  const a = firebaseAuth();
  host.replaceChildren();
  const slot = document.createElement("div");
  host.append(slot);
  const verifier = new RecaptchaVerifier(a, slot, { size: "invisible" });
  try {
    const confirmation = await signInWithPhoneNumber(
      a,
      `+91${mobile}`,
      verifier
    );
    return async (code: string) => {
      try {
        const { user } = await confirmation.confirm(code);
        const token = await user.getIdToken();
        await signOut(a);
        return token;
      } catch (error) {
        throw new Error(message(error));
      }
    };
  } catch (error) {
    verifier.clear();
    throw new Error(message(error));
  }
}
