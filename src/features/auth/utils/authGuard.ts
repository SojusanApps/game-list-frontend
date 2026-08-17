export type AuthGuardRequirement = "authenticated" | "staff";
export type AuthGuardOutcome = "allow" | "require-login" | "forbidden";

export interface AuthGuardState {
  isAuthenticated: boolean;
  isStaff?: boolean;
}

export function resolveAuthGuardOutcome(
  state: Readonly<AuthGuardState>,
  requirement: AuthGuardRequirement,
): AuthGuardOutcome {
  if (!state.isAuthenticated) {
    return "require-login";
  }

  if (requirement === "staff" && !state.isStaff) {
    return "forbidden";
  }

  return "allow";
}
