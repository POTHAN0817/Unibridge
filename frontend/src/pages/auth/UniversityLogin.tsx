import React from "react";
import { RoleAuthLayout } from "../../components/auth/RoleAuthLayout";
import { LoginForm } from "../../components/auth/LoginForm";

export default function UniversityLogin() {
  return (
    <RoleAuthLayout
      role="university"
      badge="Faculty & Research Portal"
      title="University Innovation Portal"
      subtitle="Connect with societal challenges and build solutions with student-faculty teams."
    >
      <LoginForm
        role="university"
        registerPath="/auth/university/register"
        submitButtonColor="#8B5CF6"
      />
    </RoleAuthLayout>
  );
}
