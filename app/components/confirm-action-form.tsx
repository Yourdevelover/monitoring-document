'use client';

import { ReactNode } from "react";
import { ApiForm } from "./api-form";

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
    <ApiForm
      action={action}
      method={method}
      confirmMessage={confirmMessage}
    >
      {children}
    </ApiForm>
  );
}
