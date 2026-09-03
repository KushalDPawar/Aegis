export function nextStepPath(transactionId: string, status: string): string {
  switch (status) {
    case "PENDING":
      return `/pay/${transactionId}/risk`;
    case "ALLOWED":
    case "VERIFY_REQUIRED":
    case "WARNED":
    case "COOLING_PERIOD":
    case "PAUSED":
      return `/pay/${transactionId}/guard`;
    default:
      return `/pay/${transactionId}/trace`;
  }
}
