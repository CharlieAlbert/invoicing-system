"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  FileText,
  CreditCard,
  BarChart3,
  LineChart,
  PieChart,
  Check,
  Users,
  Star,
} from "lucide-react";
import type { ReactNode } from "react";

export function HomeClient() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-purple-50 dark:from-slate-950 dark:to-slate-900">
      {/* Navigation */}
      <nav className="container mx-auto py-6 px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-violet-600 rounded-lg p-1.5 shadow-lg shadow-violet-200 dark:shadow-violet-900/20">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            InvoiceFlow
          </span>
        </div>
        <div className="flex space-x-4">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hover:text-violet-600 hover:bg-violet-50"
          >
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/20"
          >
            <Link href="/auth/signup">Sign Up</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 space-y-6">
          <div className="inline-block px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 rounded-full text-sm font-medium mb-2">
            Invoicing Software
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Invoicing Made Simple
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
            Professional invoices, streamlined payments, and powerful financial
            insights for freelancers and small businesses.
          </p>
          <div className="flex space-x-4 pt-6">
            <Button
              asChild
              size="lg"
              className="group bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200/50 dark:shadow-violet-900/20 transition-all duration-300"
            >
              <Link href="/auth/signup">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-violet-200 hover:border-violet-300 hover:bg-violet-50 dark:border-violet-800 dark:hover:border-violet-700"
            >
              <Link href="/auth/login">Log In</Link>
            </Button>
          </div>
          <div className="flex items-center space-x-4 pt-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-violet-100 dark:bg-violet-800 flex items-center justify-center text-xs font-medium text-violet-600 dark:text-violet-300"
                >
                  {i}
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium">1,000+</span> businesses trust
              InvoiceFlow
            </p>
          </div>
        </div>
        <div className="md:w-1/2 mt-12 md:mt-0 relative">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-300 dark:bg-purple-900/30 rounded-full filter blur-3xl opacity-30"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-violet-300 dark:bg-violet-900/30 rounded-full filter blur-3xl opacity-30"></div>

          <div className="relative w-full h-[400px] rounded-xl overflow-hidden shadow-2xl transform transition-all duration-500 hover:scale-[1.02] hover:shadow-violet-200/50 dark:hover:shadow-violet-900/20">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-600/10 backdrop-blur-sm"></div>

            {/* Dashboard mockup */}
            <div className="absolute inset-0 bg-white dark:bg-slate-800 p-4 flex flex-col">
              {/* Mock header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/50 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="w-32 h-6 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                </div>
                <div className="flex space-x-3">
                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-violet-400 dark:bg-violet-500 rounded-full"></div>
                  </div>
                  <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/50 rounded-lg flex items-center justify-center">
                    <Users className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  </div>
                </div>
              </div>

              {/* Mock stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-md border border-slate-100 dark:border-slate-600">
                  <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/50 rounded-full mb-2 flex items-center justify-center">
                    <LineChart className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="w-16 h-4 bg-slate-200 dark:bg-slate-600 rounded mb-1"></div>
                  <div className="w-24 h-6 bg-violet-200 dark:bg-violet-800/50 rounded font-medium"></div>
                </div>
                <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-md border border-slate-100 dark:border-slate-600">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-full mb-2 flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="w-16 h-4 bg-slate-200 dark:bg-slate-600 rounded mb-1"></div>
                  <div className="w-24 h-6 bg-purple-200 dark:bg-purple-800/50 rounded font-medium"></div>
                </div>
                <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-md border border-slate-100 dark:border-slate-600">
                  <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/50 rounded-full mb-2 flex items-center justify-center">
                    <PieChart className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div className="w-16 h-4 bg-slate-200 dark:bg-slate-600 rounded mb-1"></div>
                  <div className="w-24 h-6 bg-pink-200 dark:bg-pink-800/50 rounded font-medium"></div>
                </div>
              </div>

              {/* Mock table */}
              <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md border border-slate-100 dark:border-slate-600 flex-1 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-32 h-6 bg-slate-200 dark:bg-slate-600 rounded"></div>
                  <div className="w-24 h-8 bg-violet-100 dark:bg-violet-900/50 rounded-md flex items-center justify-center">
                    <div className="w-16 h-4 bg-violet-400 dark:bg-violet-500 rounded"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-600/50 rounded-md transition-colors">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-violet-100 dark:bg-violet-900/50 rounded-full"></div>
                      <div className="w-40 h-4 bg-slate-200 dark:bg-slate-600 rounded"></div>
                    </div>
                    <div className="w-20 h-4 bg-green-200 dark:bg-green-900/50 rounded"></div>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-600/50 rounded-md transition-colors">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/50 rounded-full"></div>
                      <div className="w-36 h-4 bg-slate-200 dark:bg-slate-600 rounded"></div>
                    </div>
                    <div className="w-20 h-4 bg-yellow-200 dark:bg-yellow-900/50 rounded"></div>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-600/50 rounded-md transition-colors">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-pink-100 dark:bg-pink-900/50 rounded-full"></div>
                      <div className="w-44 h-4 bg-slate-200 dark:bg-slate-600 rounded"></div>
                    </div>
                    <div className="w-20 h-4 bg-red-200 dark:bg-red-900/50 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-5 rounded-lg shadow-xl border border-violet-100 dark:border-violet-800 transform transition-all duration-500 hover:scale-105">
                <p className="text-lg font-semibold text-violet-600 dark:text-violet-400">
                  Beautiful Dashboard Interface
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24 bg-white dark:bg-slate-900 rounded-t-3xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-violet-50 to-white dark:from-slate-950 dark:to-slate-900"></div>

        <div className="relative">
          <div className="inline-block px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 rounded-full text-sm font-medium mb-4 mx-auto text-center block">
            Features
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Powerful Features for Your Business
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-center max-w-2xl mx-auto mb-16">
            Everything you need to manage your invoices, clients, and payments
            in one place.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={
                <FileText className="h-10 w-10 text-violet-600 dark:text-violet-400" />
              }
              title="Invoice Management"
              description="Create, send, and track professional invoices. Monitor payment status and get alerts for overdue invoices."
            />
            <FeatureCard
              icon={
                <Users className="h-10 w-10 text-purple-600 dark:text-purple-400" />
              }
              title="Client Management"
              description="Maintain a comprehensive database of your clients with contact details, payment history, and business information."
            />
            <FeatureCard
              icon={
                <CreditCard className="h-10 w-10 text-pink-600 dark:text-pink-400" />
              }
              title="Payment Tracking"
              description="Track paid, pending, and overdue payments. Get insights into your cash flow and outstanding balances."
            />
            <FeatureCard
              icon={
                <BarChart3 className="h-10 w-10 text-violet-600 dark:text-violet-400" />
              }
              title="Financial Analytics"
              description="View detailed reports on revenue, top clients, and payment performance with visual dashboards and metrics."
            />
            <FeatureCard
              icon={
                <FileText className="h-10 w-10 text-purple-600 dark:text-purple-400" />
              }
              title="Quotation System"
              description="Create and manage quotations that can be easily converted to invoices once approved by your clients."
            />
            <FeatureCard
              icon={
                <LineChart className="h-10 w-10 text-pink-600 dark:text-pink-400" />
              }
              title="Product Inventory"
              description="Manage your product catalog with pricing and descriptions for quick addition to invoices and quotations."
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-24 bg-gradient-to-b from-white to-violet-50 dark:from-slate-900 dark:to-slate-900">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          What Our Users Say
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-center max-w-2xl mx-auto mb-16">
          Join a list of satisfied customers who have transformed their
          invoicing process.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <TestimonialCard
            quote="InvoiceFlow has completely transformed how I manage my business. Invoicing used to take hours and alot of paper work, now it takes minutes."
            author="Joseph Nderitu"
            role="Business Owner"
            rating={5}
          />
          <TestimonialCard
            quote="The analytics dashboard gives me insights I never had before. I can finally see which clients are most profitable."
            author="Anne Wanjiku"
            role="Business Owner"
            rating={5}
          />
          <TestimonialCard
            quote="The automated payment reminders have cut my late payments by 75%. This tool pays for itself many times over."
            author="Tracy Wanjiru"
            role="Business Owner"
            rating={4}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-4xl mx-auto space-y-6 bg-gradient-to-br from-violet-500/10 to-purple-600/10 p-12 rounded-2xl border border-violet-200 dark:border-violet-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm -z-10"></div>
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-300 dark:bg-violet-700 rounded-full filter blur-3xl opacity-30 -z-10"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-300 dark:bg-purple-700 rounded-full filter blur-3xl opacity-30 -z-10"></div>

          <div className="inline-block px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 rounded-full text-sm font-medium mb-4 mx-auto">
            Get Started Today
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to streamline your invoicing?
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Join a list of freelancers and small businesses who trust
            InvoiceFlow.
          </p>
          <div className="space-y-6 pt-6">
            <Button
              asChild
              size="lg"
              className="px-8 py-6 text-lg bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200/50 dark:shadow-violet-900/20 transition-all duration-300"
            >
              <Link href="/auth/signup">Create Your Free Account</Link>
            </Button>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-8 text-sm text-slate-600 dark:text-slate-400 pt-2">
              <div className="flex items-center">
                <div className="bg-violet-100 dark:bg-violet-900/30 p-1 rounded-full mr-2">
                  <Check className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </div>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <div className="bg-violet-100 dark:bg-violet-900/30 p-1 rounded-full mr-2">
                  <Check className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </div>
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center">
                <div className="bg-violet-100 dark:bg-violet-900/30 p-1 rounded-full mr-2">
                  <Check className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </div>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-violet-100 dark:border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-violet-600 rounded-lg p-1.5 shadow-sm">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                InvoiceFlow
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Professional invoicing software for freelancers and small
              businesses.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-slate-900 dark:text-slate-100">
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400"
                >
                  Integrations
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400"
                >
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-slate-900 dark:text-slate-100">
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400"
                >
                  Guides
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400"
                >
                  API Docs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-slate-900 dark:text-slate-100">
              Company
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400"
                >
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-violet-100 dark:border-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} InvoiceFlow. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link
              href="#"
              className="text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
            <Link
              href="#"
              className="text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </Link>
            <Link
              href="#"
              className="text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
            <Link
              href="#"
              className="text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md border border-violet-100 dark:border-violet-900/20 hover:shadow-lg hover:shadow-violet-100/50 dark:hover:shadow-violet-900/10 transition-all duration-300 group">
      <div className="bg-violet-100 dark:bg-violet-900/30 rounded-xl p-4 w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  );
}

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  rating: number;
}

function TestimonialCard({
  quote,
  author,
  role,
  rating,
}: TestimonialCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md border border-violet-100 dark:border-violet-900/20 hover:shadow-lg hover:shadow-violet-100/50 dark:hover:shadow-violet-900/10 transition-all duration-300">
      <div className="mb-6 text-violet-600 dark:text-violet-400">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 opacity-80"
        >
          <path
            d="M9.59 4.59A2 2 0 1 1 11 8H9.5C8.67 8 8 8.67 8 9.5v.5h2a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-5c0-2.21 1.79-4 4-4Zm10 0A2 2 0 1 1 21 8h-1.5c-.83 0-1.5.67-1.5 1.5v.5h2a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-5c0-2.21 1.79-4 4-4Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <div className="flex mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"
            }`}
          />
        ))}
      </div>
      <p className="text-slate-600 dark:text-slate-300 mb-6 italic leading-relaxed">
        "{quote}"
      </p>
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-semibold mr-3">
          {author.charAt(0)}
        </div>
        <div>
          <p className="font-semibold">{author}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{role}</p>
        </div>
      </div>
    </div>
  );
}
