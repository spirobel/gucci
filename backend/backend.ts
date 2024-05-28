import {
  url,
  head,
  commonHead,
  cssReset,
  Mini,
  type HtmlHandler,
  html,
  BasedHtml,
} from "@spirobel/mininext";
import { solanaWalletStyles } from "./styling/solanaWalletStyles";
import { getSession, logoutEndpoint, verifyLoginEndpoint } from "./user/login";
import { chatForm, readOnlyChat } from "./user/chat";
export function formatAddress(a: string) {
  return a.slice(0, 4) + ".." + a.slice(-4);
}
const loginScriptTag = url.frontend("/login/Login.tsx", solanaWalletStyles);
head(
  (mini) =>
    mini.html`<title>mininext</title>${commonHead}${cssReset}${loginScriptTag}`
);

export const MaybeLoggedin = url.data(async (mini) => {
  const sessionRow = await getSession(mini.req);
  if (sessionRow?.address) {
    return {
      loggedin: {
        address: sessionRow.address,
        formattedAddress: formatAddress(sessionRow.address),
      },
    };
  }
  return { loggedout: true };
});
export type Loggedin = {
  loggedin: NonNullable<typeof MaybeLoggedin.$Data.loggedin>;
};

function allWeNeed(loggedin: HtmlHandler<Loggedin>) {
  return MaybeLoggedin.handler((mini) => {
    return mini.html`${navbar}${() => {
      if (mini.data.loggedin?.address) {
        return mini.html`${url.deliver("loggedin", mini.data.loggedin)}${
          loggedin as HtmlHandler<typeof MaybeLoggedin.$Data>
        }`;
      } else {
        return mini.html`      <style>        .content {
            text-align: justify; /* Center the text horizontally */
            font-size: 1.5em; /* Increase the font size */
            width: 80%; /* Set a width for the div */
            margin: 0 auto; /* Center the div horizontally */
            margin-top: 20px;
        }</style>  <div class="content"><h1> logged out</h1>
        
          ${readOnlyChat}
        
        </div>`;
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
      <li><a href="#">Trollbox</a></li>

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
              mini.data.loggedin?.formattedAddress || "login"}</span>
        </button>
        </div></div>
        </li>
    </ul>
  </div>
  <div id="sign-login-message-prompt"></div>
 
`;
url.setWebsocket<{ username: string }>({
  open(ws) {
    if (ws.data.username) {
      const msg = html`<span style="color: orange"
      >${ws.data.username} </span> has entered the chat</span
    >`;
      url.publishHtml("chat-channel", msg);
    }
    ws.subscribe("chat-channel");
  },
  message(ws, message) {
    if (!ws.data.username) return;
    // this is a group chat
    // so the server re-broadcasts incoming message to everyone
    const msg = html`<span style="color: orange">${ws.data.username}</span>:
      ${message + ""}`;
    url.publishHtml("chat-channel", msg);
  },
  close(ws) {
    if (ws.data.username) {
      const msg = html`<span style="color: orange">${ws.data.username}</span>
        has left the chat`;
      ws.unsubscribe("chat-channel");
      url.publishHtml("chat-channel", msg);
    }
  },
});
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
          ${chatForm}
      </div>`;
    }),
  ],
  ["/login/verifySignInMessage", verifyLoginEndpoint],
  ["/logout", logoutEndpoint],
  [
    "/chat",
    allWeNeed((mini) => {
      //console.log(`upgrade!`);
      const username = mini.data.loggedin.formattedAddress;
      const success = url.server.upgrade(mini.req, { data: { username } });
      return mini.json`{"success": true}`;
    }),
  ],
  [
    "/chatReadOnly",
    (mini) => {
      //console.log(`upgrade!`);
      const success = url.server.upgrade(mini.req, { data: { username: "" } });
      return mini.json`{"success": true}`;
    },
  ],
]);

export default url.install;
