import React from "react";
import { RoleAuthLayout } from "../../components/auth/RoleAuthLayout";
import { LoginForm } from "../../components/auth/LoginForm";

export default function GovernmentLogin() {
  return (
    <RoleAuthLayout
      role="government"
      badge="Government & Nodal Officer Access"
      title="Government Command Center"
      subtitle="Monitor, validate and scale societal solutions across districts and states."
    >
      <LoginForm
        role="government"
        registerPath="/auth/government/register"
        submitButtonColor="#10B981"
      />
    </RoleAuthLayout>
  );
}
