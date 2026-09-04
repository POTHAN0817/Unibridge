import React from "react";
import { RoleAuthLayout } from "../../components/auth/RoleAuthLayout";
import { RegistrationForm } from "../../components/auth/RegistrationForm";

export default function IndustryRegister() {
  return (
    <RoleAuthLayout
      role="industry"
      badge="Enterprise Partnership"
      title="Join as Industry Partner"
      subtitle="Sponsor university pilots, grant seed capital, and mentor student inventors solving real problems."
    >
      <RegistrationForm
        role="industry"
        loginPath="/auth/industry/login"
        submitButtonColor="#F59E0B"
      />
    </RoleAuthLayout>
  );
}
