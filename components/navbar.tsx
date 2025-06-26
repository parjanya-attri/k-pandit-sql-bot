"use client";
import { Navbar as HeroUINavbar, NavbarContent, NavbarBrand } from "@heroui/navbar";
import { Avatar } from "@heroui/react";
import { ThemeSwitch } from "./theme-switch";

export const Navbar = () => (
  <HeroUINavbar maxWidth="xl" position="sticky">
    <NavbarContent justify="start">
      <NavbarBrand>
        <Avatar name="MCP" size="sm" className="mr-2" />
        <span className="font-bold text-lg tracking-tight">K-Pandit Dashboard</span>
      </NavbarBrand>
    </NavbarContent>
    <NavbarContent justify="end">
      <ThemeSwitch />
    </NavbarContent>
  </HeroUINavbar>
);
