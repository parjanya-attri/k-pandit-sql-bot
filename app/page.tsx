"use client";
import { Navbar } from "../components/navbar";
import { Card, Button, Avatar } from "@heroui/react";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col md:flex-row gap-6 p-6">
        <aside className="w-full md:w-1/4 flex flex-col gap-4">
          <Card className="p-4">
            <div className="font-semibold text-lg mb-2">Quick Links</div>
            <ul className="space-y-2">
              <li><Button as={Link} href="/chat" color="primary" fullWidth>Chat Assistant</Button></li>
              <li><Button color="secondary" fullWidth>Database Status</Button></li>
              <li><Button color="secondary" fullWidth>Recent Queries</Button></li>
            </ul>
          </Card>
          <Card className="p-4">
            <div className="font-semibold text-lg mb-2">User Profile</div>
            <div className="flex items-center gap-3">
              <Avatar name="User" size="sm" />
              <div>
                <div className="font-medium">Zoey Lang</div>
                <div className="text-xs text-gray-500">Full-stack Developer</div>
              </div>
            </div>
          </Card>
        </aside>
        <section className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 flex flex-col items-start justify-between min-h-[180px]">
            <div className="font-semibold text-lg mb-2">Database Overview</div>
            <div className="text-4xl font-bold">12 Tables</div>
            <div className="text-sm text-gray-500">Last updated: 2 min ago</div>
          </Card>
          <Card className="p-6 flex flex-col items-start justify-between min-h-[180px]">
            <div className="font-semibold text-lg mb-2">Recent Activity</div>
            <ul className="list-disc pl-5 text-sm">
              <li>Query: <span className="font-mono">SELECT * FROM Orders</span></li>
              <li>Query: <span className="font-mono">SELECT COUNT(*) FROM Users</span></li>
            </ul>
          </Card>
          <Card className="p-6 flex flex-col items-start justify-between min-h-[180px]">
            <div className="font-semibold text-lg mb-2">System Health</div>
            <div className="text-green-600 font-bold">All systems operational</div>
          </Card>
          <Card className="p-6 flex flex-col items-start justify-between min-h-[180px]">
            <div className="font-semibold text-lg mb-2">Coming Soon</div>
            <div className="text-gray-500">More analytics and widgets will appear here!</div>
          </Card>
        </section>
      </main>
    </div>
  );
}
