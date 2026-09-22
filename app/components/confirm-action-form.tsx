'use client';

import { ReactNode } from "react";

type ConfirmActionFormProps = {
  action: string;
  confirmMessage: string;
  method?: "POST" | "GET";
  children: ReactNode;
};

export function ConfirmActionForm({
  action,
  confirmMessage,
  method = "POST",
  children,
}: ConfirmActionFormProps) {
  return (
    <form
      action={action}
      method={method}
      onSubmit={(event) => {
        const confirmed = window.confirm(confirmMessage);

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </form>
  );
}
