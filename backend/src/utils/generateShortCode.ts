import crypto from "crypto";

function randomString(length: number): string {
  const bytes = crypto.randomBytes(length);
  return bytes
    .toString("base64")
    .replace(/\+/g, "0")
    .replace(/\//g, "0")
    .replace(/=/g, "0")
    .substring(0, length);
}

export async function generateUniqueShortCode(
  checkFn: (code: string) => Promise<boolean>,
  length = 10
): Promise<string> {
  let code: string;
  let exists: boolean;

  do {
    code = randomString(length);
    exists = await checkFn(code);
  } while (exists);

  return code;
}
