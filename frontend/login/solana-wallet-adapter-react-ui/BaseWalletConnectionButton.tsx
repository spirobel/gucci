import type { WalletName } from "@solana/wallet-adapter-base";
import React from "react";
import { Button } from "./Button";

type Props = React.ComponentProps<typeof Button> & {
  walletIcon?: string;
  walletName?: WalletName;
};

export function BaseWalletConnectionButton({
  walletIcon,
  walletName,
  ...props
}: Props) {
  return (
    <Button
      {...props}
      className="wallet-adapter-button-trigger"
      startIcon={<div className="wallet-icon">👛</div>}
    />
  );
}
