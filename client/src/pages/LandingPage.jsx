import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  Trophy,
  Code,
  Target,
  Zap,
  ArrowRight,
  Shield,
  Globe,
} from "lucide-react";

// eslint-disable-next-line no-unused-vars
const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="bg-champion-card border border-white/5 p-8 flex flex-col gap-4 group hover:border-champion-gold/30 transition-colors"
  >
    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-champion-gold/10 transition-colors mb-2">
      <Icon
        className="text-white group-hover:text-champion-gold transition-colors"
        size={24}
      />
    </div>
    <h3 className="text-xl font-heading font-bold text-white">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed font-sans">
      {description}
    </p>
  </motion.div>
);

const LandingPage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-champion-dark font-sans text-champion-text">
      <Navbar />

      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-50" />
        <div className="absolute inset-0 bg-noise opacity-[0.03]" />

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-widest uppercase text-champion-gold mb-4">
              <Zap size={14} /> The Ultimate Career Accelerator
            </div>

            <h1 className="text-6xl md:text-8xl font-heading font-bold text-white tracking-tight leading-tight mb-4">
              Ready to <br />
              <span className="text-gradient-gold">Git Hired?</span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 font-light">
              Master the interview. Dominate the selection process. Join the
              elite top 1% of developers who train with AI-driven rigor.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button variant="primary" size="lg" className="min-w-[200px]">
                    Go to Dashboard{" "}
                    <ArrowRight className="inline ml-2" size={18} />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button
                      variant="primary"
                      size="lg"
                      className="min-w-[200px]"
                    >
                      Start Training{" "}
                      <ArrowRight className="inline ml-2" size={18} />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button
                      variant="outline"
                      size="lg"
                      className="min-w-[200px]"
                    >
                      Member Login
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-500"
        >
          <div className="w-[1px] h-10 bg-gradient-to-b from-transparent via-gray-500 to-transparent block mx-auto mb-2" />
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        </motion.div>
      </section>

      <section className="border-y border-white/5 bg-champion-card py-12">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: "Active Users", value: "10K+" },
            { label: "Interviews Aced", value: "50K+" },
            { label: "Success Rate", value: "94%" },
            { label: "Partner Companies", value: "100+" },
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-3xl md:text-4xl font-heading font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-xs uppercase tracking-widest text-gray-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-heading font-bold text-white mb-4">
              SHARPEN YOUR <span className="text-champion-gold">EDGE</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Our advanced analysis engine identifies your weaknesses before the
              recruiters do.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={Target}
              title="Tech-Spec Analysis"
              description="Upload your resume and get instant, industry-standard formatting and keyword feedback."
              delay={0.1}
            />
            <FeatureCard
              icon={Code}
              title="Live Coding Sims"
              description="Face specific tech stack challenges in a realistic, pressure-tested environment."
              delay={0.2}
            />
            <FeatureCard
              icon={Trophy}
              title="Global Ranking"
              description="Compete with peers worldwide. Earn badges, level up, and prove your seniority."
              delay={0.3}
            />
            <FeatureCard
              icon={Shield}
              title="Adaptive Hardness"
              description="System scales difficulty based on your performance. Never plateau."
              delay={0.4}
            />
            <FeatureCard
              icon={Globe}
              title="Multi-Language"
              description="Practice in English or Indonesian. Perfect for international or local roles."
              delay={0.5}
            />
            <FeatureCard
              icon={Zap}
              title="Instant Feedback"
              description="No waiting. Get line-by-line actionable critique immediately after every session."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-12 bg-black">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-heading font-bold text-white">
            GIT_HIRED
          </div>
          <p className="text-gray-600 text-sm">
            © 2026 GitHired Inc. All Rights Reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="https://x.com/ichamtheproject"
              className="text-gray-500 hover:text-white transition-colors"
            >
              Twitter/X
            </a>
            <a
              href="https://github.com/icham11"
              className="text-gray-500 hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/wahid-nurhisyam-154027a7/"
              className="text-gray-500 hover:text-white transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
