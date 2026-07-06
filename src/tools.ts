/**
 * Declarative table of ZEVO Client API endpoints exposed as MCP tools.
 *
 * Each entry maps 1:1 to a documented endpoint in the ZEVO Client API
 * (see backend/client-api/docs/index.md in core-api). All tools are read-only.
 * Descriptions are lifted/condensed from the official docs so the agent has the
 * context it needs (booking statuses, receipt/transaction semantics, pagination).
 *
 * To add an endpoint: append one entry here. No other file needs to change.
 */

import { z, type ZodRawShape } from "zod";

const PAGINATION_NOTE =
  " Returns up to 10 records per page; increase `skip` by 10 to fetch the next page.";

const skip = z
  .number()
  .int()
  .min(0)
  .optional()
  .describe("Number of records to skip before returning the next page (page size is 10).");

export interface ToolDef {
  name: string;
  description: string;
  path: string;
  params: ZodRawShape;
}

export const TOOLS: ToolDef[] = [
  {
    name: "get_me",
    description:
      "Get the authenticated ZEVO account (the owner of the API key) and its wallet. " +
      "Returns `user` (basic profile) and `wallet` (id, userId, balance, timestamps). " +
      "Call this first to confirm which account the integration is acting on behalf of.",
    path: "/User/me",
    params: {}
  },
  {
    name: "list_vehicles",
    description:
      "List vehicles available to the API key account. Each vehicle carries identity and " +
      "listing details for a specific Tesla (VIN, location, charge percentage, listing status, " +
      "registration fields, timestamps). Use the vehicle id or VIN to connect bookings and " +
      "transactions back to a physical car." + PAGINATION_NOTE,
    path: "/Vehicle/findByUser",
    params: { skip }
  },
  {
    name: "list_bookings",
    description:
      "List bookings (rental/trip records) for the API key account. A booking connects a user " +
      "to a vehicle for a period of time: status, VIN, pricing context, odometer fields, trip " +
      "timing, related user/vehicle ids, timestamps. Best object for 'who had which vehicle, and " +
      "when?'. Statuses: pending, cancelled, pre_trip, in_progress, in_termination, repossession, " +
      "post_trip, vehicle_returned, payment_failed, paid." + PAGINATION_NOTE,
    path: "/Booking/findByUser",
    params: { skip }
  },
  {
    name: "list_active_bookings",
    description:
      "List only ACTIVE bookings for the API key account — status pre_trip, in_progress, or " +
      "in_termination (a renter currently has access to the vehicle). Use this to answer 'which " +
      "vehicles are out on a trip right now?'. Same response shape as list_bookings." +
      PAGINATION_NOTE,
    path: "/Booking/findActiveBookings",
    params: { skip }
  },
  {
    name: "list_inspections",
    description:
      "List inspections (a vehicle's condition captured at a point in a booking, e.g. pre-trip " +
      "or post-trip walkaround) for the API key account. Includes related user/vehicle/booking " +
      "ids, inspection type, status, damage-reported flag, damage tags, odometer, trip timing, " +
      "photos, timestamps." + PAGINATION_NOTE,
    path: "/Inspection/findByUser",
    params: { skip }
  },
  {
    name: "list_receipts",
    description:
      "List receipts (itemized charges ZEVO billed the renter, connected to a booking and " +
      "vehicle) for the API key account. Amounts are in CENTS and can be negative for refunds. " +
      "Includes line items, totals, date/timezone, status, base fare paid, platform fee %, and " +
      "ids. Line item `tags`: base_fare, platform_fee, toll, supercharger_invoice, " +
      "supercharger_invoice_surcharge, incidentals, deposit, commission, revenue_share, " +
      "wallet_deposit, wallet_withdrawal." + PAGINATION_NOTE,
    path: "/Receipt/findByUser",
    params: { skip }
  },
  {
    name: "get_receipts_by_vehicle",
    description:
      "List receipts for a specific vehicle available to the API key account. Same shape as " +
      "list_receipts. Amounts are in cents." + PAGINATION_NOTE,
    path: "/Receipt/findByVehicle",
    params: {
      vehicleId: z.string().describe("ZEVO vehicle id."),
      skip
    }
  },
  {
    name: "get_receipts_by_booking",
    description:
      "List receipts for a specific booking available to the API key account. Same shape as " +
      "list_receipts. Amounts are in cents." + PAGINATION_NOTE,
    path: "/Receipt/findByBooking",
    params: {
      bookingId: z.string().describe("ZEVO booking id."),
      skip
    }
  },
  {
    name: "list_transactions",
    description:
      "List wallet ledger transactions for the API key account — money moving into/out of/through " +
      "a ZEVO wallet. The best endpoint for account statements, wallet history, and payout " +
      "reconciliation. Fields: amount, description, kind (adding funds, cashing out, booking " +
      "wallet credit, wallet receipt payment, ...), status (pending/paid/cancelled), lineItems, " +
      "bookingId, vehicleId, paidAt. Note: receipts record what was CHARGED; transactions record " +
      "money MOVING in a wallet." + PAGINATION_NOTE,
    path: "/Transaction/findByUser",
    params: { skip }
  },
  {
    name: "get_transactions_by_vin",
    description:
      "List wallet transactions for one specific authorized vehicle by VIN. Useful for " +
      "reconciling the financial activity of a single Tesla across bookings, tolls, supercharging, " +
      "incidentals, and related wallet movements. Same shape as list_transactions." +
      PAGINATION_NOTE,
    path: "/Transaction/findByVinNumber",
    params: {
      vinNumber: z.string().describe("VIN for a vehicle available to the API key account."),
      skip
    }
  }
];
