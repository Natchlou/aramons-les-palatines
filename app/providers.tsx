"use client";

import { FormProvider } from "@buildnbuzz/form-react";
import { registry } from "@/components/buzzform/registry";

export default function FormProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FormProvider registry={registry}>
      {children}
    </FormProvider>
  );
}