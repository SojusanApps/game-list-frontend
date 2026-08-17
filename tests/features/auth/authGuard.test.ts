import { describe, expect, it } from "vitest";
import { resolveAuthGuardOutcome } from "@/features/auth/utils/authGuard";

describe("resolveAuthGuardOutcome", () => {
  it("requires login when unauthenticated and the route only requires authentication", () => {
    const outcome = resolveAuthGuardOutcome({ isAuthenticated: false }, "authenticated");
    expect(outcome).toBe("require-login");
  });

  it("requires login when unauthenticated, even if the route requires staff", () => {
    const outcome = resolveAuthGuardOutcome({ isAuthenticated: false }, "staff");
    expect(outcome).toBe("require-login");
  });

  it("allows an authenticated user through a route that only requires authentication", () => {
    const outcome = resolveAuthGuardOutcome({ isAuthenticated: true }, "authenticated");
    expect(outcome).toBe("allow");
  });

  it("allows a staff user through a route that requires staff", () => {
    const outcome = resolveAuthGuardOutcome({ isAuthenticated: true, isStaff: true }, "staff");
    expect(outcome).toBe("allow");
  });

  it("forbids a non-staff authenticated user from a route that requires staff", () => {
    const outcome = resolveAuthGuardOutcome({ isAuthenticated: true, isStaff: false }, "staff");
    expect(outcome).toBe("forbidden");
  });

  it("forbids an authenticated user from a staff route when staff status is unresolved", () => {
    const outcome = resolveAuthGuardOutcome({ isAuthenticated: true }, "staff");
    expect(outcome).toBe("forbidden");
  });
});
