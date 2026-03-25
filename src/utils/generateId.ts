type UserRole =
  | "PAT"
  | "DOC"
  | "REC"
  | "ADMIN"
  | "APT"
  | "PHARM"
  | "LASSIST"
  | "LBORD"
  | "PRES"
  | "LBTST";

function generateRandomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

export function generateHmsId(role: UserRole, randomLength: number): string {
  const date = new Date();
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ms = String(date.getMilliseconds()).padStart(3, "0");

  const randomPart = generateRandomString(randomLength);

  return `${role}-${mm}${randomPart}${ms}`;
}
