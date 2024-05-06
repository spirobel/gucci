import { useWalletMultiButton } from "@solana/wallet-adapter-base-ui";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { BaseWalletConnectionButton } from "./BaseWalletConnectionButton";
import type { ButtonProps } from "./Button";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
export function makeNameLink(name: string) {
  // Create a new URL object from the current location
  const url = new URL(location.href);

  // Use URLSearchParams to set the name query parameter
  url.searchParams.set("name", name);

  // Return the updated URL as a string
  return url.toString();
}
export function LinkTagFromIndex({ n }: { n: number }) {
  if (names_order[n]) {
    return (
      <li className="wallet-adapter-dropdown-list-item" onClick={() => {}}>
        <a href={makeNameLink(names_order[n])}>{names_order[n]}</a>
      </li>
    );
  }
  if (names[n]) {
    return (
      <li className="wallet-adapter-dropdown-list-item" onClick={() => {}}>
        <a href={makeNameLink(names[n])}>{names[n]}</a>
      </li>
    );
  }
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
  var names_order: string[];
  var currentName: string | undefined;
  var loggedin: boolean;
  var address: string;
  var names: string[];
  var loggedin: boolean;
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
      return <span className="current-user-name">{window.currentName}</span>;
    } else if (buttonState === "connecting" || buttonState === "has-wallet") {
      return <span className="current-user-name">{window.currentName}</span>;
    } else {
      if (window.currentName) {
        return <span className="current-user-name">{window.currentName}</span>;
      } else {
        return labels["no-wallet"];
      }
    }
  }, [
    buttonState,
    children,
    labels,
    publicKey,
    window.names[0],
    window.names[1],
    window.names[2],
    window.names_order[0],
    window.names_order[1],
    window.names_order[2],
  ]);
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
        <LinkTagFromIndex n={0} />
        <LinkTagFromIndex n={1} />
        <LinkTagFromIndex n={2} />

        {onDisconnect ? (
          <li
            className="wallet-adapter-dropdown-list-item"
            onClick={() => {
              onDisconnect();
              setMenuOpen(false);
              //TODO: send post to /logout
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
              //TODO: send post to /logout
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
