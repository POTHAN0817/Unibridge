import React from "react";
import { RoleAuthLayout } from "../../components/auth/RoleAuthLayout";
import { RegistrationForm } from "../../components/auth/RegistrationForm";

export default function GovernmentRegister() {
  return (
    <RoleAuthLayout
      role="government"
      badge="Government Official Verification"
      title="Register Government Department"
      subtitle="Onboard your department or district administration to triage, validate, and fund civic solutions."
    >
      <RegistrationForm
        role="government"
        loginPath="/auth/government/login"
        submitButtonColor="#10B981"
      />
    </RoleAuthLayout>
  );
}
