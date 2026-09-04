import React from "react";
import { RoleAuthLayout } from "../../components/auth/RoleAuthLayout";
import { LoginForm } from "../../components/auth/LoginForm";

export default function IndustryLogin() {
  return (
    <RoleAuthLayout
      role="industry"
      badge="Industry & CSR Portal"
      title="Industry Partner Portal"
      subtitle="Support innovation through expertise, funding, and technology infrastructure."
    >
      <LoginForm
        role="industry"
        registerPath="/auth/industry/register"
        submitButtonColor="#F59E0B"
      />
    </RoleAuthLayout>
  );
}
