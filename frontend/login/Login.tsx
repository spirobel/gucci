import ReactDOM, { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import type { FC } from "react";
import React, {
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { useWallet } from "@solana/wallet-adapter-react";
import type { SolanaSignInInput } from "@solana/wallet-standard-features";
import { BaseWalletMultiButton } from "./solana-wallet-adapter-react-ui/BaseWalletMultiButton.tsx";
import { clusterApiUrl } from "@solana/web3.js";
import { useSnackbar } from "notistack";
import type { VariantType } from "notistack";
import bs58 from "bs58";
import { SnackbarProvider } from "notistack";
import { verifySignIn } from "@solana/wallet-standard-util";

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletDisconnectButton,
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
function App() {
  return <SolanaWallet />;
}

const container = document.getElementById("login");
const root = createRoot(container!);
root.render(<App />);

export const SolanaWallet: FC = (props) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Mainnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => {
    if (network === "mainnet-beta") {
      return "https://swr.xnftdata.com/rpc-proxy/";
    } else {
      return clusterApiUrl(network);
    }
  }, [network]);

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
  // Only the wallets you configure here will be compiled into your application, and only the dependencies
  // of wallets that your users connect to will be loaded.
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [network]);
  const LABELS = {
    "change-wallet": "Change wallet",
    connecting: "Connecting ...",
    "copy-address": "Copy address",
    copied: "Copied",
    disconnect: "logout",
    "has-wallet": "login",
    "no-wallet": "login",
  } as const;
  return (
    <SnackbarProvider>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <BaseWalletMultiButton labels={LABELS} />
          <PortalComponent />
        </WalletModalProvider>
      </WalletProvider>
    </SnackbarProvider>
  );
};

const PortalComponent = (props: { open?: boolean }) => {
  const [isOpen, setIsOpen] = useState(props.open || false);
  const [challenge, setChallenge] = useState<SolanaSignInInput | null>(null);

  const { wallet, publicKey } = useWallet();
  useEffect(() => {
    // Assuming `wallet` is available in the component's scope
    if (wallet?.readyState === "Installed") {
      const contentDiv = document.getElementById("sign-login-message-prompt");
      // Check if the content div has any content
      if (contentDiv?.hasChildNodes() && !isOpen) {
        // Clear the content div
        contentDiv.innerHTML = "";
      }
      setIsOpen(true);
      if (publicKey) {
        const uri = window.location.href;
        const currentUrl = new URL(uri);
        const domain = currentUrl.host;
        const signInData: SolanaSignInInput = {
          domain,
          address: publicKey.toBase58(),
          statement:
            "Clicking Sign or Approve only means you have proved this wallet is owned by you. This request will not trigger any blockchain transaction or cost any gas fee.",
        };
        setChallenge(signInData);
      }
    }
  }, [wallet?.readyState, isOpen, setChallenge, publicKey]); // Depend on wallet's readyState and isOpen state

  return (
    <div>
      {isOpen &&
        !window.loggedin &&
        createPortal(
          <div className="content">
            <div className="card">
              <p>
                You need to sign a login message. We need this to make sure only
                you can stamp in with this account.
              </p>
              {challenge && <SignIn challenge={challenge} />}
            </div>
          </div>,
          document.getElementById("sign-login-message-prompt")!
        )}
    </div>
  );
};

export function SignIn({ challenge }: { challenge: SolanaSignInInput }) {
  const { signIn, publicKey } = useWallet();
  const notify = useNotify();
  const [done, setDone] = useState(false);
  const onClick = useCallback(async () => {
    try {
      if (!signIn)
        throw new Error("Wallet does not support Sign In With Solana!");
      const input = await challenge;
      const output = await signIn(input);
      console.log(input, output);
      const constructPayload = JSON.stringify({
        input,
        output: {
          signedMessage: bs58.encode(output.signedMessage),
          signature: bs58.encode(output.signature),
        },
      });

      // Verify the sign-in output against the generated input server-side

      const verifyResponse = await fetch("/login/verifySigInMessage", {
        method: "POST",
        body: constructPayload,
      });
      const success = await verifyResponse.json();
      //TODO if success reoverwrite portal with iframe of chat or just refresh page.
      if (success) setDone(true);
      if (!verifySignIn(input, output))
        throw new Error("Sign In verification failed!");
      notify("success", `Message signature: ${bs58.encode(output.signature)}`);
      //refresh page
      window.location.reload();
    } catch (error: any) {
      notify(
        "error",
        `Sign In failed: ${JSON.parse(error?.message)["message"]}`
      );
    }
  }, [signIn, publicKey, notify, challenge, setDone]);

  return (
    <>
      {done && <div>Done</div>}
      <button
        className="sign-login-message-button"
        onClick={onClick}
        disabled={!signIn}
      >
        <span className="sign-login-message-button-text">
          sign login message
        </span>
      </button>{" "}
    </>
  );
}

export function useNotify() {
  const { enqueueSnackbar } = useSnackbar();

  return useCallback(
    (variant: VariantType, message: string, signature?: string) => {
      enqueueSnackbar(
        <div className="notification">
          {message}
          {signature && (
            <div className="styledLink">
              <a
                href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
                target="_blank"
              >
                Transaction
              </a>
            </div>
          )}
        </div>,
        { variant }
      );
    },
    [enqueueSnackbar]
  );
}
