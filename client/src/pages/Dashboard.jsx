import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  FileText,
  MessageSquare,
  Trophy,
  ArrowRight,
  Zap,
  Star,
  Activity,
  User,
} from "lucide-react";

const DashboardCard = ({
  to,
  title,
  subtitle,
  icon: Icon, // eslint-disable-line no-unused-vars
  color,
  delay,
  className,
}) => (
  <Link to={to} className={`block h-full ${className}`}>
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      className="h-full bg-champion-card border border-white/5 p-8 relative overflow-hidden group hover:border-champion-gold/50 transition-all duration-300"
    >
      <div
        className={`absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity text-${color}-500`}
      >
        <Icon size={48} />
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <div
            className={`p-3 w-fit rounded-lg bg-white/5 mb-6 text-${color}-400 group-hover:text-champion-gold transition-colors`}
          >
            <Icon size={24} />
          </div>
          <h3 className="text-2xl font-heading font-bold text-white mb-2">
            {title}
          </h3>
          <p className="text-gray-400 text-sm">{subtitle}</p>
        </div>

        <div className="mt-8 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white group-hover:text-champion-gold transition-colors">
          Access Module <ArrowRight size={16} />
        </div>
      </div>

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  </Link>
);

const StatCard = (
  { label, value, icon: Icon, delay }, // eslint-disable-line no-unused-vars
) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="bg-champion-card border border-white/5 p-6 flex items-center gap-4"
  >
    <div className="p-3 bg-champion-gold/10 rounded-full text-champion-gold">
      <Icon size={20} />
    </div>
    <div>
      <div className="text-2xl font-heading font-bold text-white">{value}</div>
      <div className="text-xs uppercase tracking-widest text-gray-500">
        {label}
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-champion-dark font-sans text-champion-text">
      <Navbar />

      <div className="container mx-auto px-6 pt-32 pb-12">
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-2">
              WELCOME BACK,{" "}
              <span className="text-champion-gold">{user?.username}</span>
            </h1>
            <p className="text-gray-400">
              Your command center is ready. Choose your training module.
            </p>
          </motion.div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard label="Rank" value="Gold" icon={Trophy} delay={0.1} />
          <StatCard label="XP" value="2,450" icon={Zap} delay={0.2} />
          <StatCard label="Avg Score" value="88%" icon={Star} delay={0.3} />
          <StatCard label="Activity" value="High" icon={Activity} delay={0.4} />
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          {/* Main Module: Mock Interview (Large) */}
          <DashboardCard
            to="/interview"
            title="MOCK INTERVIEW"
            subtitle="AI-driven simulation with real-time analysis."
            icon={MessageSquare}
            color="indigo"
            delay={0.2}
            className="md:col-span-2"
          />

          {/* Side Module: Resume (Tall) */}
          <DashboardCard
            to="/resume"
            title="RESUME SCANNER"
            subtitle="ATS Optimization & Feedback."
            icon={FileText}
            color="emerald"
            delay={0.3}
            className="md:col-span-1"
          />

          {/* Bottom Module: Profile (Wide) */}
          <DashboardCard
            to="/profile"
            title="YOUR PROFILE"
            subtitle="View detailed stats and history logs."
            icon={User}
            color="orange"
            delay={0.4}
            className="md:col-span-3 lg:col-span-1"
          />

          <div className="md:col-span-3 lg:col-span-2 bg-champion-card border border-white/5 p-8 flex flex-col justify-center items-center text-center relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-heading font-bold text-white mb-2">
                PRO UPGRADE AVAILABLE
              </h3>
              <p className="text-gray-400 mb-6">
                Unlock "Extreme" difficulty and unlimited sessions.
              </p>
              <Link
                to="/payment"
                className="text-champion-gold font-bold hover:text-white transition-colors underline decoration-2 underline-offset-4"
              >
                VIEW PLANS
              </Link>
            </div>
            <div className="absolute inset-0 bg-gradient-gold opacity-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
