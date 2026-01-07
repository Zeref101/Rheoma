import AppSideBar from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSideBar />
      <SidebarInset className="bg-background">{children}</SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
