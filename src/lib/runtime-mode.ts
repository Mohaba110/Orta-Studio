export function isDemoMode() {
  return process.env.ORTA_DEMO_MODE === "true" || process.env.NODE_ENV !== "production";
}
