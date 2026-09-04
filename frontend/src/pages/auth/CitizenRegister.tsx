import React from "react";
import { RoleAuthLayout } from "../../components/auth/RoleAuthLayout";
import { RegistrationForm } from "../../components/auth/RegistrationForm";

export default function CitizenRegister() {
  return (
    <RoleAuthLayout
      role="citizen"
      badge="Citizen Onboarding"
      title="Create Citizen Account"
      subtitle="Join your local district innovation network and turn neighborhood issues into national solutions."
    >
      <RegistrationForm
        role="citizen"
        loginPath="/auth/citizen/login"
        submitButtonColor="#0B63F6"
      />
    </RoleAuthLayout>
  );
}
