import "server-only";
import { callCustomerDoor } from "./forms";

/**
 * The customer pages' reads, through the CMS's customer doors
 * (`./forms.ts`). Each is scoped by the CMS to the signed-in customer's
 * own account, and the CMS answers nothing for an account that is not
 * active. Field names are those of the old Sanity types (`customer`,
 * `grievance`), with `id` in place of `_id`.
 */

export type CustomerProfile = {
  id: string;
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
  createdAt?: string;
};

export type Grievance = {
  id: string;
  ticketId: string;
  subject: string;
  category?: string;
  priority?: string;
  status: string;
  description?: string;
  adminReply?: string;
  createdAt: string;
};

/** The customer's own details, or null when the CMS has none. */
export async function customerProfile(
  customerId: string
): Promise<CustomerProfile | null> {
  const answer = await callCustomerDoor("profile", { customerId });
  if (!answer.ok) return null;
  const customer = answer.customer;
  return customer && typeof customer === "object"
    ? (customer as CustomerProfile)
    : null;
}

/** The customer's grievances, newest first. */
export async function customerGrievances(
  customerId: string
): Promise<Grievance[]> {
  const answer = await callCustomerDoor("grievances", { customerId });
  if (!answer.ok) return [];
  return Array.isArray(answer.grievances)
    ? (answer.grievances as Grievance[])
    : [];
}

/** One of the customer's own grievances by its ticket id, or null. */
export async function customerGrievance(
  customerId: string,
  ticketId: string
): Promise<Grievance | null> {
  const answer = await callCustomerDoor("grievance", { customerId, ticketId });
  if (!answer.ok) return null;
  const grievance = answer.grievance;
  return grievance && typeof grievance === "object"
    ? (grievance as Grievance)
    : null;
}
