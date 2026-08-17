import { Box } from "@mantine/core";
import { Outlet } from "@tanstack/react-router";
import React from "react";

import Footer from "@/components/layout/Footer";
import TopBar from "@/components/layout/TopBar";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";

const Layout = (): React.JSX.Element => {
  return (
    <Box style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopBar />
      <Box component="main" style={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
      <Footer />
      <ScrollToTopButton />
    </Box>
  );
};

export default Layout;
