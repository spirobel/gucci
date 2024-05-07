import {
  url,
  head,
  commonHead,
  cssReset,
  Mini,
  type HtmlHandler,
} from "@spirobel/mininext";
import { solanaWalletStyles } from "./styling/solanaWalletStyles";
import { getSession, logoutEndpoint, verifyLoginEndpoint } from "./user/login";
import { formatAddress } from "../frontend/login/solana-wallet-adapter-react-ui/BaseWalletMultiButton";

const loginScriptTag = url.frontend("/login/Login.tsx", solanaWalletStyles);
head(
  (mini) =>
    mini.html`<title>hello hello</title>${commonHead}${cssReset}${loginScriptTag}`
);

const MaybeLoggedin = url.data(async (mini) => {
  const sessionRow = await getSession(mini.req);
  if (sessionRow?.address) {
    return {
      loggedin: {
        address: sessionRow.address,
        formatedAddress: formatAddress(sessionRow.address),
      },
    };
  }
  return { loggedout: true };
});

export type Loggedin = NonNullable<typeof MaybeLoggedin.$Data.loggedin>;
export type LoggedOut = NonNullable<typeof MaybeLoggedin.$Data.loggedout>;

function allWeNeed(loggedin: HtmlHandler<Loggedin>) {
  return MaybeLoggedin.handler((mini) => {
    return mini.html`${navbar}${() => {
      if (mini.data.loggedin?.address) {
        return mini.html`${url.deliver(
          "loggedin",
          mini.data.loggedin
        )}${loggedin(new Mini(mini, mini.data.loggedin))}`;
      } else {
        return mini.html`<h1> logged out</h1>`;
      }
    }}`;
  });
}

const navbar = (mini: Mini<typeof MaybeLoggedin.$Data>) => mini.html`
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
      <li><div id="login"> 
      <div class="wallet-adapter-dropdown">         
      <button
            class="wallet-adapter-button wallet-adapter-button-trigger"
            tabindex="0"
            type="button"
            style="pointer-events: auto;"
          >
            <i class="wallet-adapter-button-start-icon"
              ><div class="wallet-icon">👛</div></i
            >
            <span class="current-user-name">${(mini) =>
              mini.data.loggedin?.formatedAddress || "login"}</span>
        </button>
        </div></div>
        </li>
    </ul>
  </div>
  <div id="sign-login-message-prompt"></div>
  <script>console.log(window.loggedin)</script>
`;
url.set([
  [
    "/",
    allWeNeed((mini) => {
      return mini.html`
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
      </div>`;
    }),
  ],
  ["/login/verifySignInMessage", verifyLoginEndpoint],
  ["/logout", logoutEndpoint],
]);

export default url.install;
