import React from "react";
import { RoleAuthLayout } from "../../components/auth/RoleAuthLayout";
import { RegistrationForm } from "../../components/auth/RegistrationForm";

export default function UniversityRegister() {
  return (
    <RoleAuthLayout
      role="university"
      badge="Academic Institutional Registration"
      title="Register University / Faculty"
      subtitle="Register your institution, departments, and research labs to receive AI-matched civic challenges."
    >
      <RegistrationForm
        role="university"
        loginPath="/auth/university/login"
        submitButtonColor="#8B5CF6"
      />
    </RoleAuthLayout>
  );
}
