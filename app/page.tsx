"use client";
import { useState, useEffect } from "react";
import { Card, Button, Avatar, Progress, Chip, Divider } from "@heroui/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Database, 
  MessageSquare, 
  BarChart3, 
  Clock, 
  Users, 
  Server, 
  Sparkles, 
  ArrowRight,
  Activity,
  TrendingUp,
  Shield,
  Zap,
  Brain,
  Globe
} from "lucide-react";
import { Navbar } from "@/components/navbar";

const stats = [
  { 
    label: "Database Tables", 
    value: "47", 
    change: "+3 this week", 
    trend: "up", 
    icon: Database,
    color: "from-blue-500 to-cyan-500"
  },
  { 
    label: "Queries Today", 
    value: "1,247", 
    change: "+18% from yesterday", 
    trend: "up", 
    icon: BarChart3,
    color: "from-emerald-500 to-teal-500"
  },
  { 
    label: "Avg Response", 
    value: "0.24s", 
    change: "-12% faster", 
    trend: "up", 
    icon: Clock,
    color: "from-violet-500 to-purple-500"
  },
  { 
    label: "Active Users", 
    value: "89", 
    change: "+7 new today", 
    trend: "up", 
    icon: Users,
    color: "from-orange-500 to-red-500"
  },
];

const recentQueries = [
  { 
    query: "Show me top 10 customers by revenue this quarter", 
    time: "2 minutes ago", 
    status: "success",
    duration: "0.18s"
  },
  { 
    query: "List all products with low inventory levels", 
    time: "5 minutes ago", 
    status: "success",
    duration: "0.31s"
  },
  { 
    query: "Generate monthly sales report by region", 
    time: "8 minutes ago", 
    status: "success",
    duration: "0.45s"
  },
  { 
    query: "Find customers who haven't ordered in 90 days", 
    time: "12 minutes ago", 
    status: "success",
    duration: "0.22s"
  },
];

const features = [
  {
    icon: Brain,
    title: "AI-Powered Queries",
    description: "Transform natural language into complex SQL queries instantly"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade security with role-based access control"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Sub-second response times with intelligent caching"
  },
  {
    icon: Globe,
    title: "Multi-Database",
    description: "Connect to MSSQL, PostgreSQL, MySQL, and more"
  }
];

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-950 dark:via-blue-950/20 dark:to-indigo-950/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-950 dark:via-blue-950/20 dark:to-indigo-950/30">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5" />
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex justify-center mb-8">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-xl opacity-30 animate-pulse" />
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl shadow-2xl">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
              </motion.div>
            </div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            >
              <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                SQL Intelligence
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Platform
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-10 leading-relaxed"
            >
              Transform your database interactions with AI-powered natural language processing. 
              Get instant insights, generate complex queries, and unlock the full potential of your data.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button 
                as={Link} 
                href="/chat" 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg"
                endContent={<ArrowRight className="w-5 h-5" />}
              >
                Start Chatting Now
              </Button>
              <Button 
                variant="bordered" 
                size="lg"
                className="border-2 border-gray-300 dark:border-gray-600 font-semibold px-8 py-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 text-lg"
              >
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 pb-20">
        {/* Stats Grid */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
            >
              <Card className="p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-white/20 dark:border-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <Chip 
                    size="sm" 
                    className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium"
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.change}
                  </Chip>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Features Grid */}
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Card className="p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-white/20 dark:border-gray-800/50 shadow-lg">
                <div className="flex items-center gap-3 mb-8">
                  <Sparkles className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Platform Features</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all duration-300"
                    >
                      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 shadow-md">
                        <feature.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.section>

            {/* Recent Activity */}
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
            >
              <Card className="p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-white/20 dark:border-gray-800/50 shadow-lg">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Activity className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
                  </div>
                  <Button variant="light" size="sm" className="text-blue-600 dark:text-blue-400 font-medium">
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {recentQueries.map((query, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.1 + index * 0.1, duration: 0.5 }}
                      className="flex items-start gap-4 p-5 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50"
                    >
                      <div className="flex-shrink-0 w-3 h-3 bg-emerald-500 rounded-full mt-2 shadow-sm"></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white mb-2">{query.query}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500 dark:text-gray-400">{query.time}</span>
                          <Chip size="sm" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                            Success
                          </Chip>
                          <span className="text-gray-500 dark:text-gray-400">{query.duration}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* System Health */}
            <motion.section
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <Card className="p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-white/20 dark:border-gray-800/50 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <Server className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">System Health</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Database Connection</span>
                      <Chip size="sm" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                        Excellent
                      </Chip>
                    </div>
                    <Progress value={98} className="h-2" color="success" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">98% uptime</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Query Performance</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">95%</span>
                    </div>
                    <Progress value={95} className="h-2" color="primary" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Avg 0.24s response</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Memory Usage</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">67%</span>
                    </div>
                    <Progress value={67} className="h-2" color="warning" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">8.2GB / 12GB used</p>
                  </div>
                </div>
              </Card>
            </motion.section>

            {/* Quick Actions */}
            <motion.section
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3, duration: 0.6 }}
            >
              <Card className="p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-white/20 dark:border-gray-800/50 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h3>
                </div>
                <div className="space-y-3">
                  <Button 
                    as={Link} 
                    href="/chat" 
                    fullWidth
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                    startContent={<MessageSquare className="w-4 h-4" />}
                  >
                    New Chat Session
                  </Button>
                  <Button 
                    variant="bordered"
                    fullWidth
                    className="border-2 border-gray-200 dark:border-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                    startContent={<Database className="w-4 h-4" />}
                  >
                    Browse Tables
                  </Button>
                  <Button 
                    variant="bordered"
                    fullWidth
                    className="border-2 border-gray-200 dark:border-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                    startContent={<BarChart3 className="w-4 h-4" />}
                  >
                    View Analytics
                  </Button>
                </div>
              </Card>
            </motion.section>

            {/* User Profile */}
            <motion.section
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
            >
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200/50 dark:border-blue-800/50 shadow-lg">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar 
                    name="Alex Chen" 
                    size="lg" 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">Alex Chen</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Senior Data Analyst</p>
                    <Chip size="sm" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 mt-1">
                      Pro User
                    </Chip>
                  </div>
                </div>
                <Divider className="my-4" />
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Queries this month</span>
                    <span className="font-bold text-gray-900 dark:text-white">3,247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Avg. response time</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">0.24s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Success rate</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">99.7%</span>
                  </div>
                </div>
              </Card>
            </motion.section>
          </div>
        </div>
      </main>
    </div>
  );
}