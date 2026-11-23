/**
 * Sends a new complaint from the complaint page (NewGrievanceForm) to
 * /api/customer/grievance and says what the page does next.
 *
 * A 401 means the session has ended, or the CMS no longer knows this
 * account: the customer is signed out and sent to the sign-in page, and
 * the answer's body is not read.
 */

/** The sign-in page a signed-out customer is sent to. */
export const CUSTOMER_SIGN_IN_PAGE = "/customer/login";

export type GrievanceDraft = {
  subject: string;
  category: string;
  priority: string;
  description: string;
};

export type GrievanceSent =
  | { kind: "saved" }
  | { kind: "signed-out" }
  | { kind: "error"; message: string };

export async function sendGrievance(
  draft: GrievanceDraft,
  signOut: (options: { callbackUrl: string }) => Promise<unknown>,
  send: typeof fetch = (input, init) => fetch(input, init)
): Promise<GrievanceSent> {
  const response = await send("/api/customer/grievance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(draft),
  });

  if (response.status === 401) {
    await signOut({ callbackUrl: CUSTOMER_SIGN_IN_PAGE });
    return { kind: "signed-out" };
  }

  const data = await response.json();
  if (!response.ok) {
    return {
      kind: "error",
      message: data?.error ?? "Something went wrong. Please try again.",
    };
  }
  return { kind: "saved" };
}
