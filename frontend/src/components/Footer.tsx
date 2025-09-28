'use client';

import { motion } from 'framer-motion';
import { Zap, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Footer() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Github, href: 'https://github.com/crewnexus', label: 'GitHub' },
    { icon: Twitter, href: 'https://twitter.com/crewnexus', label: 'Twitter' },
    { icon: Linkedin, href: 'https://linkedin.com/company/crewnexus', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:contact@crewnexus.ai', label: 'Email' },
  ];

  const footerLinks = {
    Product: [
      { name: 'Features', href: '/features' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Documentation', href: '/docs' },
      { name: 'API Reference', href: '/api' },
    ],
    Company: [
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' },
    ],
    Community: [
      { name: 'Discord', href: 'https://discord.gg/crewnexus' },
      { name: 'Forum', href: 'https://forum.crewnexus.ai' },
      { name: 'GitHub', href: 'https://github.com/crewnexus' },
      { name: 'Stack Overflow', href: 'https://stackoverflow.com/questions/tagged/crewnexus' },
    ],
    Legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'License', href: '/license' },
    ],
  };

  return (
    <footer className="bg-charcoal border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div 
              className="flex items-center space-x-2 cursor-pointer mb-4"
              onClick={() => router.push('/')}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-electric-cyan to-neon-green rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-deep-space" />
              </div>
              <span className="text-xl font-display font-bold neon-text">
                CrewNexus
              </span>
            </div>
            
            <p className="text-text-secondary mb-6 max-w-md">
              The ultimate multi-agent orchestration platform powered by CrewAI and Cerebras AI. 
              Build the future of intelligent automation.
            </p>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 bg-charcoal border border-gray-700 rounded-lg flex items-center justify-center text-text-secondary hover:text-electric-cyan hover:border-electric-cyan transition-all duration-300"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-lg font-display font-semibold text-text-primary mb-4">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <motion.a
                      href={link.href}
                      whileHover={{ x: 5 }}
                      className="text-text-secondary hover:text-electric-cyan transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-text-secondary text-sm">
              © {currentYear} CrewNexus. All rights reserved.
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-text-secondary">
              <span className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                <span>System Operational</span>
              </span>
              <span>v1.0.0</span>
            </div>
          </div>
        </div>

        {/* Back to Top Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 w-12 h-12 bg-electric-cyan text-deep-space rounded-full flex items-center justify-center shadow-lg hover:shadow-electric-cyan/50 transition-all duration-300 z-50"
          aria-label="Back to top"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </motion.button>
      </div>
    </footer>
  );
}