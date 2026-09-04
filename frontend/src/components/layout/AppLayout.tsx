import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#071A33]">
      <Navbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
    </div>
  );
};
