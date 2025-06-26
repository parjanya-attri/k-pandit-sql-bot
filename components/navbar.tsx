"use client";
import { Navbar as HeroUINavbar, NavbarContent, NavbarBrand, NavbarItem } from "@heroui/navbar";
import { Avatar, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { ThemeSwitch } from "./theme-switch";
import { HiOutlineDatabase, HiOutlineUser, HiOutlineCog, HiOutlineLogout, HiOutlineBell } from "react-icons/hi";
import Link from "next/link";

export const Navbar = () => (
  <HeroUINavbar 
    maxWidth="full" 
    position="sticky"
    className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-800/50 shadow-lg"
    classNames={{
      wrapper: "px-6 lg:px-8"
    }}
  >
    <NavbarContent justify="start">
      <NavbarBrand as={Link} href="/" className="gap-3 hover:opacity-80 transition-opacity">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur-sm opacity-30" />
          <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
            <HiOutlineDatabase className="w-6 h-6 text-white" />
          </div>
        </div>
        <div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            K-Pandit
          </span>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">SQL Intelligence Hub</p>
        </div>
      </NavbarBrand>
    </NavbarContent>

    <NavbarContent className="hidden sm:flex gap-6" justify="center">
      <NavbarItem>
        <Button 
          as={Link} 
          href="/" 
          variant="light" 
          className="font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Dashboard
        </Button>
      </NavbarItem>
      <NavbarItem>
        <Button 
          as={Link} 
          href="/chat" 
          variant="light" 
          className="font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Chat Assistant
        </Button>
      </NavbarItem>
      <NavbarItem>
        <Button 
          variant="light" 
          className="font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Analytics
        </Button>
      </NavbarItem>
    </NavbarContent>

    <NavbarContent justify="end">
      <NavbarItem className="hidden sm:flex">
        <Button 
          variant="light" 
          size="sm" 
          className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-2 min-w-0 h-8 w-8"
        >
          <HiOutlineBell className="w-5 h-5" />
        </Button>
      </NavbarItem>
      
      <NavbarItem>
        <ThemeSwitch />
      </NavbarItem>
      
      <NavbarItem>
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              as="button"
              name="Zoey Lang"
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            />
          </DropdownTrigger>
          <DropdownMenu 
            aria-label="Profile Actions" 
            variant="flat"
            className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 shadow-xl"
          >
            <DropdownItem key="profile" className="h-14 gap-2" textValue="Profile">
              <div className="flex items-center gap-3">
                <Avatar
                  name="Zoey Lang"
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Zoey Lang</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Database Administrator</p>
                </div>
              </div>
            </DropdownItem>
            <DropdownItem key="settings" startContent={<HiOutlineCog className="w-4 h-4" />}>
              Settings
            </DropdownItem>
            <DropdownItem key="profile_settings" startContent={<HiOutlineUser className="w-4 h-4" />}>
              Profile Settings
            </DropdownItem>
            <DropdownItem key="logout" color="danger" startContent={<HiOutlineLogout className="w-4 h-4" />}>
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarItem>
    </NavbarContent>
  </HeroUINavbar>
);