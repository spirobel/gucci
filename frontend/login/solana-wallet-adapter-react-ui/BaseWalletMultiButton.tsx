import { useWalletMultiButton } from "@solana/wallet-adapter-base-ui";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { BaseWalletConnectionButton } from "./BaseWalletConnectionButton";
import type { ButtonProps } from "./Button";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import type { PublicKey } from "@solana/web3.js";
export function formatAddress(a: string) {
  return a.slice(0, 4) + ".." + a.slice(-4);
}
export function whatToDisplayInButton(publicKey?: PublicKey) {
  const clientSideWalletAddress = publicKey
    ? formatAddress(publicKey.toBase58())
    : undefined;
  const serverSideUserinfo =
    window.loggedin?.currentName || window.loggedin?.formattedAddress;
  return serverSideUserinfo || clientSideWalletAddress;
}

type Props = ButtonProps & {
  labels: Omit<
    {
      [TButtonState in ReturnType<
        typeof useWalletMultiButton
      >["buttonState"]]: string;
    },
    "connected" | "disconnecting"
  > & {
    "copy-address": string;
    copied: string;
    "change-wallet": string;
    disconnect: string;
  };
};
declare global {
  var loggedin:
    | {
        address: string;
        formattedAddress: string;
        currentName: string | undefined;
      }
    | undefined;
}

export function BaseWalletMultiButton({ children, labels, ...props }: Props) {
  const { setVisible: setModalVisible } = useWalletModal();
  const {
    buttonState,
    onConnect,
    onDisconnect,
    publicKey,
    walletIcon,
    walletName,
  } = useWalletMultiButton({
    onSelectWallet() {
      setModalVisible(true);
    },
  });
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const node = ref.current;

      // Do nothing if clicking dropdown or its descendants
      if (!node || node.contains(event.target as Node)) return;

      setMenuOpen(false);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, []);
  const content = useMemo(() => {
    if (children) {
      return children;
    } else if (publicKey) {
      return whatToDisplayInButton(publicKey);
    } else {
      return whatToDisplayInButton() || labels["no-wallet"];
    }
  }, [buttonState, children, labels, publicKey]);
  console.log(publicKey);
  return (
    <div className="wallet-adapter-dropdown">
      <BaseWalletConnectionButton
        {...props}
        aria-expanded={menuOpen}
        style={{ pointerEvents: menuOpen ? "none" : "auto", ...props.style }}
        onClick={() => {
          if (window.loggedin) {
            setMenuOpen(true);
            return;
          }
          switch (buttonState) {
            case "no-wallet":
              setModalVisible(true);
              break;
            case "has-wallet":
              if (onConnect) {
                onConnect();
              }
              break;
            case "connected":
              setMenuOpen(true);
              break;
          }
        }}
        walletIcon={walletIcon}
        walletName={walletName}
      >
        {content}
      </BaseWalletConnectionButton>
      <ul
        aria-label="dropdown-list"
        className={`wallet-adapter-dropdown-list ${
          menuOpen && "wallet-adapter-dropdown-list-active"
        }`}
        ref={ref}
        role="menu"
      >
        {onDisconnect ? (
          <li
            className="wallet-adapter-dropdown-list-item"
            onClick={() => {
              onDisconnect();
              setMenuOpen(false);
              fetch("/logout", {
                method: "POST",
              }).then(
                //refresh page
                () => (window.location.href = "/")
              );
            }}
            role="menuitem"
          >
            {labels["disconnect"]}
          </li>
        ) : (
          <li
            className="wallet-adapter-dropdown-list-item"
            onClick={() => {
              setMenuOpen(false);
              fetch("/logout", {
                method: "POST",
              }).then(
                //refresh page
                () => (window.location.href = "/")
              );
            }}
            role="menuitem"
          >
            {labels["disconnect"]}
          </li>
        )}
      </ul>
    </div>
  );
}
