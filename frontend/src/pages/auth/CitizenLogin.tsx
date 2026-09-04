import React from "react";
import { RoleAuthLayout } from "../../components/auth/RoleAuthLayout";
import { LoginForm } from "../../components/auth/LoginForm";

export default function CitizenLogin() {
  return (
    <RoleAuthLayout
      role="citizen"
      badge="Citizen Portal"
      title="Welcome back"
      subtitle="Sign in to report, vote on, and track community societal challenges."
    >
      <LoginForm
        role="citizen"
        registerPath="/auth/citizen/register"
        submitButtonColor="#0B63F6"
      />
    </RoleAuthLayout>
  );
}
