export default function getErrorStatusCode(message: string): number {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("not authenticated") ||
    normalized.includes("no token") ||
    normalized.includes("invalid token")
  ) {
    return 401;
  }

  if (
    normalized.includes("access denied") ||
    normalized.includes("only admins") ||
    normalized.includes("only teachers") ||
    normalized.includes("only students")
  ) {
    return 403;
  }

  if (
    normalized.includes("already exists") ||
    normalized.includes("already marked") ||
    normalized.includes("already submitted")
  ) {
    return 409;
  }

  if (normalized.includes("not found")) {
    return 404;
  }

  if (
    normalized.includes("required") ||
    normalized.includes("invalid") ||
    normalized.includes("must") ||
    normalized.includes("cannot")
  ) {
    return 400;
  }

  return 500;
}
