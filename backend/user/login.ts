import { parse } from "cookie";
import { db } from "../../db/db";
import { sessionCookies } from "../../db/schema";
import { eq } from "drizzle-orm";
import type { SolanaSignInInput } from "@solana/wallet-standard-features";
import { verifySignIn } from "@solana/wallet-standard-util";
import bs58 from "bs58";
import { z } from "zod";
import { url } from "@spirobel/mininext";
export const logoutEndpoint = url.postJson(async (mini) => {
  await deleteCookie(mini.req);
  return mini.json`{"loggedOut": true}${mini.headers({
    "Content-Type": "application/json; charset=utf-8",
    "Set-Cookie": `sessionId==deleted; expires=Thu, 01 Jan 1970 00:00:00 GMT Secure; HttpOnly; SameSite=Strict; path=/`,
  })}`;
});
export const verifyLoginEndpoint = url.postJson(async (mini) => {
  const parsedData = CheckChallengeRequest.safeParse(mini.form.formJson);
  if (!parsedData.success) {
    return mini.json`{"success":false}`;
  }
  const data = parsedData.data;
  const domain = mini.requrl.host;
  const address = data.input.address;
  const statement =
    "Clicking Sign or Approve only means you have proved this wallet is owned by you. This request will not trigger any blockchain transaction or cost any gas fee.";
  const signInData: SolanaSignInInput = {
    address,
    domain,
    statement,
  };
  const publicKey = bs58.decode(data.input.address);
  const signedMessage = bs58.decode(data.output.signedMessage);
  const signature = bs58.decode(data.output.signature);
  const success = verifySignIn(signInData, {
    signedMessage,
    signature,
    // @ts-ignore
    account: { publicKey },
  });
  if (success) {
    return mini.json`${{ success }}${mini.headers({
      "Content-Type": "application/json; charset=utf-8",
      "Set-Cookie": `sessionId=${await createSession(
        address
      )}; expires=Fri, 31 Dec 9999 23:59:59 GMT; Secure; HttpOnly; SameSite=Strict; path=/`,
    })}`;
  }
  return mini.json`${{ success }}`;
});
export const CheckChallengeRequest = z.object({
  input: z.object({
    address: z.string().min(20).max(50),
  }),
  output: z.object({
    signature: z.string(),
    signedMessage: z.string(),
  }),
});

export type CheckChallengeRequestType = z.infer<typeof CheckChallengeRequest>;
export async function getSession(req: Request) {
  const sessionId = getSessionId(req);
  if (!sessionId) return;
  const cookie = (
    await db
      .select()
      .from(sessionCookies)
      .where(eq(sessionCookies.cookie, sessionId))
  )[0];
  return cookie;
}
export function getSessionId(req: Request) {
  return parse(req.headers.get("Cookie") || "")["sessionId"] || null;
}
export async function deleteCookie(req: Request) {
  const sessionId = getSessionId(req);
  if (!sessionId) return;
  await db.transaction(async (tx) => {
    const cookie = (
      await tx
        .select()
        .from(sessionCookies)
        .where(eq(sessionCookies.cookie, sessionId))
    )[0];
    if (!cookie.address) return;
    await tx
      .delete(sessionCookies)
      .where(eq(sessionCookies.address, cookie.address));
  });
}

export async function createSession(address: string) {
  const uuid = crypto.randomUUID();

  // Insert a new sessionCookie with the generated UUID as the cookie value for the given address
  await db.insert(sessionCookies).values({ cookie: uuid, address });

  return uuid;
}
