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
export function formatAddress(a: string) {
  return a.slice(0, 4) + ".." + a.slice(-4);
}
const loginScriptTag = url.frontend("/login/Login.tsx", solanaWalletStyles);
head(
  (mini) =>
    mini.html`<title>hello hello</title>${commonHead}${cssReset}${loginScriptTag}`
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
        return mini.html`      <style>        .content {
            text-align: justify; /* Center the text horizontally */
            font-size: 1.5em; /* Increase the font size */
            width: 80%; /* Set a width for the div */
            margin: 0 auto; /* Center the div horizontally */
            margin-top: 20px;
        }</style>  <div class="content"><h1> logged out</h1>
        
        <p>Once upon a time, in the bustling city of New York,
         there was a Gucci bag that had seen the world.
          It was not just any bag; it was a symbol of luxury, status, and sophistication.
           This Gucci bag had been through the highs and lows of its owner's life, 
           accompanying them on countless adventures and trips around the globe. 
           However, one day, the bag found itself in a peculiar situation. 
           It was no longer in the hands of its owner; it was logged out.</p> <br>

<p>The bag had been left unattended in a crowded café, where it was mistakenly taken by a passerby. The passerby, a young woman named Lily, was on her way to a job interview. She was nervous and needed something to distract her from the butterflies in her stomach. She saw the Gucci bag, its rich colors and intricate design catching her eye. Without a second thought, she picked it up, thinking it was her own.
</p> <br>
<p>As Lily walked through the city, the bag felt heavier and heavier. It was a constant reminder of the mistake she had made. But she was too nervous to return it. She decided to keep it for a little while longer, hoping that the owner would not notice its absence.
</p> <br>
<p>Meanwhile, the owner of the Gucci bag, a successful entrepreneur named Alex, was frantically searching for his bag. He had left it in the café while he went to the restroom. When he returned, the bag was gone. He searched the café, the streets, and even the subway, but to no avail.
</p> <br>
<p>Days turned into weeks, and the Gucci bag remained with Lily. She began to feel a strange connection to the bag, as if it was a part of her. She started to notice the bag's beauty and the stories it could tell. She imagined the places it had been, the people it had met, and the adventures it had experienced.
</p> <br>
<p>One day, while Lily was at work, she received a call from a lost and found. They had found a Gucci bag and were trying to return it to its owner. Lily's heart pounded as she realized it was her bag. She quickly returned to the café, where she found the bag exactly where she had left it.
</p> <br>
<p>Upon returning the bag, Lily felt a sense of relief and a strange sense of loss. She had grown attached to the bag, and it had become a part of her. As she handed it back, she couldn't help but feel a pang of sadness.
</p> <br>
<p>The owner, Alex, was overjoyed to get his bag back. He thanked Lily for her honesty and kindness. He noticed the bag was a bit worn from its adventures, but it still held its charm and elegance.
</p> <br>
<p>From that day forward, the Gucci bag and Lily shared a special bond. They had both experienced a journey of discovery and growth. The bag had been logged out, but it had found its way back home, and so had Lily. They both realized that sometimes, the most valuable things in life are not always what we own but the experiences and connections we make along the way.
   </p> <br>     
        
        
        
        
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
              mini.data.loggedin?.formattedAddress || "login"}</span>
        </button>
        </div></div>
        </li>
    </ul>
  </div>
  <div id="sign-login-message-prompt"></div>
 
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
