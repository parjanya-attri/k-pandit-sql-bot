"use client";
import { Navbar } from "../components/navbar";
import { Card, Button, Avatar, Progress, Chip } from "@heroui/react";
import Link from "next/link";
import { HiOutlineDatabase, HiOutlineChatAlt2, HiOutlineChartBar, HiOutlineClock, HiOutlineUsers, HiOutlineServer, HiOutlineSparkles, HiOutlineArrowRight } from "react-icons/hi";

const stats = [
  { label: "Active Tables", value: "12", change: "+2", trend: "up", icon: HiOutlineDatabase },
  { label: "Queries Today", value: "847", change: "+12%", trend: "up", icon: HiOutlineChartBar },
  { label: "Response Time", value: "0.3s", change: "-15%", trend: "up", icon: HiOutlineClock },
  { label: "Active Users", value: "24", change: "+3", trend: "up", icon: HiOutlineUsers },
];

const recentQueries = [
  { query: "SELECT * FROM Orders WHERE status = 'pending'", time: "2 min ago", status: "success" },
  { query: "SELECT COUNT(*) FROM Users WHERE created_at > '2024-01-01'", time: "5 min ago", status: "success" },
  { query: "SELECT TOP 10 * FROM Products ORDER BY price DESC", time: "8 min ago", status: "success" },
  { query: "SELECT customer_name, SUM(order_total) FROM Orders GROUP BY customer_name", time: "12 min ago", status: "success" },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-950 dark:via-blue-950/20 dark:to-indigo-950/30">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/5 to-indigo-600/10 dark:from-blue-400/5 dark:via-purple-400/5 dark:to-indigo-400/5" />
        <div className="relative px-6 py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-lg opacity-30 animate-pulse" />
                  <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-full">
                    <HiOutlineSparkles className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-6">
                SQL Intelligence Hub
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
                Transform your database queries with AI-powered natural language processing. 
                Get instant insights from your MSSQL database through intelligent conversation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  as={Link} 
                  href="/chat" 
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  endContent={<HiOutlineArrowRight className="w-5 h-5" />}
                >
                  Start Chatting with Your Database
                </Button>
                <Button 
                  variant="bordered" 
                  size="lg"
                  className="border-2 border-gray-300 dark:border-gray-600 font-semibold px-8 py-3 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                >
                  View Documentation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="px-6 pb-12">
        <div className="mx-auto max-w-7xl">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-white/20 dark:border-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-full bg-gradient-to-r ${
                    index === 0 ? 'from-blue-500 to-blue-600' :
                    index === 1 ? 'from-green-500 to-green-600' :
                    index === 2 ? 'from-purple-500 to-purple-600' :
                    'from-orange-500 to-orange-600'
                  }`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <Chip 
                    size="sm" 
                    className={`${stat.trend === 'up' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}
                  >
                    {stat.change}
                  </Chip>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Actions */}
              <Card className="p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-white/20 dark:border-gray-800/50 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <HiOutlineChatAlt2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button 
                    as={Link} 
                    href="/chat" 
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold p-6 h-auto flex-col items-start rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <HiOutlineChatAlt2 className="w-8 h-8 mb-2" />
                    <span className="text-lg">Chat with Database</span>
                    <span className="text-sm opacity-90 mt-1">Ask questions in natural language</span>
                  </Button>
                  <Button 
                    variant="bordered"
                    size="lg"
                    className="border-2 border-gray-200 dark:border-gray-700 font-semibold p-6 h-auto flex-col items-start rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                  >
                    <HiOutlineDatabase className="w-8 h-8 mb-2 text-gray-700 dark:text-gray-300" />
                    <span className="text-lg text-gray-900 dark:text-white">Database Explorer</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">Browse tables and schemas</span>
                  </Button>
                  <Button 
                    variant="bordered"
                    size="lg"
                    className="border-2 border-gray-200 dark:border-gray-700 font-semibold p-6 h-auto flex-col items-start rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                  >
                    <HiOutlineChartBar className="w-8 h-8 mb-2 text-gray-700 dark:text-gray-300" />
                    <span className="text-lg text-gray-900 dark:text-white">Query Analytics</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">View performance metrics</span>
                  </Button>
                  <Button 
                    variant="bordered"
                    size="lg"
                    className="border-2 border-gray-200 dark:border-gray-700 font-semibold p-6 h-auto flex-col items-start rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                  >
                    <HiOutlineServer className="w-8 h-8 mb-2 text-gray-700 dark:text-gray-300" />
                    <span className="text-lg text-gray-900 dark:text-white">System Status</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">Monitor database health</span>
                  </Button>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-white/20 dark:border-gray-800/50 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <HiOutlineClock className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Queries</h2>
                  </div>
                  <Button variant="light" size="sm" className="text-blue-600 dark:text-blue-400">
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {recentQueries.map((query, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                      <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-3"></div>
                      <div className="flex-1 min-w-0">
                        <code className="text-sm font-mono text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded block mb-2 overflow-x-auto">
                          {query.query}
                        </code>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{query.time}</span>
                          <Chip size="sm" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            Success
                          </Chip>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* System Health */}
              <Card className="p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-white/20 dark:border-gray-800/50 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <HiOutlineServer className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">System Health</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Database Connection</span>
                      <Chip size="sm" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        Healthy
                      </Chip>
                    </div>
                    <Progress value={98} className="h-2" color="success" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Query Performance</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">95%</span>
                    </div>
                    <Progress value={95} className="h-2" color="primary" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Memory Usage</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">67%</span>
                    </div>
                    <Progress value={67} className="h-2" color="warning" />
                  </div>
                </div>
              </Card>

              {/* User Profile */}
              <Card className="p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-white/20 dark:border-gray-800/50 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <HiOutlineUsers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">User Profile</h3>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar 
                    name="Zoey Lang" 
                    size="lg" 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Zoey Lang</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Database Administrator</p>
                    <Chip size="sm" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 mt-1">
                      Pro User
                    </Chip>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Queries this month</span>
                    <span className="font-semibold text-gray-900 dark:text-white">2,847</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Avg. response time</span>
                    <span className="font-semibold text-gray-900 dark:text-white">0.3s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Success rate</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">99.2%</span>
                  </div>
                </div>
              </Card>

              {/* Quick Tips */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200/50 dark:border-blue-800/50 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <HiOutlineSparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Pro Tips</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700 dark:text-gray-300">
                      Use natural language like "Show me all orders from last month"
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700 dark:text-gray-300">
                      Ask for specific columns: "Get customer names and emails"
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700 dark:text-gray-300">
                      Request aggregations: "Count total users by region"
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}