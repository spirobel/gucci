import { url, head, commonHead, cssReset, Mini } from "@spirobel/mininext";
import { solanaWalletStyles } from "./styling/solanaWalletStyles";
import { parse } from "cookie";
import { db } from "../db/db";
import { sessionCookies } from "../db/schema";
import { eq } from "drizzle-orm";
import type { SolanaSignInInput } from "@solana/wallet-standard-features";
import { verifySignIn } from "@solana/wallet-standard-util";
import bs58 from "bs58";
import { z } from "zod";
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
export function getSessionId(req: Request) {
  return parse(req.headers.get("Cookie") || "")["sessionId"] || null;
}
export async function deleteCookie(req: Request) {
  const sessionId = getSessionId(req);
  if (!sessionId) return;
  const cookie = (
    await db // check if sessionchallenge already exists
      .select()
      .from(sessionCookies)
      .where(eq(sessionCookies.cookie, sessionId))
  )[0];
  if (!cookie.address) return;
  await db
    .delete(sessionCookies)
    .where(eq(sessionCookies.address, cookie.address));
}
const loginScriptTag = url.frontend("/login/Login.tsx", solanaWalletStyles);
head((mini) => mini.html`<title>hello hello</title>${commonHead}${cssReset}`);
const navbar = (mini: Mini) => mini.html`
  <style>
    /* Menubar styles */
    #menubar {
      background-color: #333;
      padding: 10px 0;
    }

    #menubar ul {
      list-style-type: none;
      margin: 0 auto;
      display: flex;
      justify-content: space-around;
      max-width: 800px;
    }

    #menubar ul li {
      display: inline;
    }

    #menubar ul li a {
      color: #fff;
      text-decoration: none;
      padding: 5px 10px;
      display: block;
    }

    #menubar ul li a:hover {
      background-color: #555;
      color: #fff;
    }
  </style>

  <div id="menubar">
    <ul>
      <li><a href="${url.link("/", "t")}">Home</a></li>
      <li><a href="#">About</a></li>
      <li><a href="#">Contact</a></li>
      <li><a href="#">Support</a></li>
      <li><div id="login">Login</div></li>${(mini) => {
        console.log(mini);
      }}
    </ul>
  </div>
  <div id="sign-login-message-prompt"></div>
`;
url.set([
  [
    "/",
    (mini) => {
      return mini.html`${navbar}
      <style>        .content {
            text-align: justify; /* Center the text horizontally */
            font-size: 1.5em; /* Increase the font size */
            width: 80%; /* Set a width for the div */
            margin: 0 auto; /* Center the div horizontally */
            margin-top: 20px;
        }</style>
      <div class="content">
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
      <br>
      <p>
        But wait, there's more! Imagine this: a Gucci bag so luxurious, it's not just a bag, it's a lifestyle. It's not just about the leather, the stitching, or the logo. It's about the way it makes you feel when you carry it, the way it makes heads turn, and the way it makes you feel like you're not just another face in the crowd, but a face that's been seen, appreciated, and coveted. It's the epitome of style, the embodiment of elegance, and the ultimate accessory for those who dare to be different.
      </p>
      <br>
      <p>
        So, if you're looking for a bag that's not just a bag, but a statement, a Gucci bag is the way to go. It's not just about the price tag; it's about the experience, the exclusivity, and the unmistakable Gucci charm that comes with it. So, next time you're in the market for a bag, remember: it's not just about what you buy, it's about how you wear it. And with a Gucci bag, you're guaranteed to make a statement that's both bold and beautiful.
      </p>
      </div>${loginScriptTag}`;
    },
  ],
  [
    "/login/verifySignInMessage",
    url.postJson((mini) => {
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
      return mini.json`${{ success }}`;
    }),
  ],
  [
    "/logout",
    url.postJson(async (mini) => {
      console.log(mini.form.formJson);
      await deleteCookie(mini.req);
      return mini.json`{"loggedOut": true}${mini.headers({
        "Content-Type": "application/json; charset=utf-8",
        "Set-Cookie": `sessionId==deleted; expires=Thu, 01 Jan 1970 00:00:00 GMT Secure; HttpOnly; SameSite=Strict; path=/`,
      })}`;
    }),
  ],
]);

export default url.install;
