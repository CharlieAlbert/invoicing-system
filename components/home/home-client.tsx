"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ApplicationCard } from "../landing/application-card";
import { TestimonialCard } from "../landing/testimonial";
import { FeatureCard } from "../landing/feature-card";
import Navbar from "../landing/navbar";
import {
  ArrowRight,
  Droplet,
  Paintbrush2,
  Palette,
  Home,
  Building2,
  Factory,
  Hexagon,
  Check,
  Shield,
  Users,
  Star,
  Hammer,
  Award,
} from "lucide-react";

export function HomeClient() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar />

      <section className="relative overflow-hidden">
        {/* Color swatches background decoration */}
        <div className="absolute -top-16 -left-16 w-32 h-32 rounded-full bg-green-500/30 filter blur-2xl"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-orange-400/20 filter blur-3xl"></div>
        <div className="absolute bottom-1/3 -left-8 w-24 h-24 rounded-full bg-yellow-400/20 filter blur-2xl"></div>
        <div className="absolute -bottom-8 right-1/3 w-40 h-40 rounded-full bg-red-500/10 filter blur-2xl"></div>

        <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center relative z-10">
          <div className="md:w-1/2 space-y-6">
            <div className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 rounded-full text-sm font-medium mb-2">
              Premium Quality Paints & Solvents
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
              <span className="text-green-600">Color</span> Your World with
              Amercoatin
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              Explore our premium paint solutions that provide lasting
              protection and vibrant colors for residential, commercial, and
              industrial applications.
            </p>
            <div className="flex space-x-4 pt-6">
              <Button
                asChild
                size="lg"
                className="group bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200/50 dark:shadow-green-900/20 transition-all duration-300"
              >
                <Link href="#">
                  Explore Products
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-green-200 hover:border-green-300 hover:bg-green-50 dark:border-green-800 dark:hover:border-green-700"
              >
                <Link href="#">Find Color Ideas</Link>
              </Button>
            </div>
            <div className="flex items-center space-x-4 pt-4">
              <div className="flex -space-x-2">
                {["#2ECC71", "#27AE60", "#F39C12", "#E67E22"].map(
                  (color, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center"
                      style={{ backgroundColor: color }}
                    ></div>
                  )
                )}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-medium">1,000+</span> color options
                available
              </p>
            </div>
          </div>
          <div className="md:w-1/2 mt-12 md:mt-0 relative">
            <div className="relative w-full h-[450px] rounded-xl overflow-hidden shadow-2xl transform transition-all duration-500 hover:scale-[1.02]">
              {/* Paint can mockup with color splash */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-white dark:from-slate-800 dark:to-slate-900 p-8 flex items-center justify-center">
                <div className="relative">
                  {/* Paint can */}
                  <div className="w-64 h-64 bg-gradient-to-br from-slate-100 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-lg border-t-8 border-green-500 shadow-xl mx-auto relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full">
                      <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full bg-green-500/50 filter blur-md animate-pulse"></div>
                    </div>
                    <div className="absolute top-0 left-0 right-0 flex justify-center">
                      <div className="w-32 h-8 bg-slate-400 dark:bg-slate-600 rounded-b-lg"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                          AMERCOATIN
                        </div>
                        <div className="text-xl text-slate-700 dark:text-slate-300">
                          Premium Paint
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Color splash */}
                  <div className="absolute -bottom-24 -right-24 w-64 h-64">
                    <div className="absolute top-0 left-0 w-full h-full bg-green-500 rounded-full filter blur-3xl opacity-20"></div>
                    <div className="absolute top-10 left-10 w-3/4 h-3/4 bg-orange-400 rounded-full filter blur-2xl opacity-20"></div>
                    <div className="absolute top-20 left-20 w-1/2 h-1/2 bg-yellow-400 rounded-full filter blur-xl opacity-20"></div>
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-5 rounded-lg shadow-xl border border-green-100 dark:border-green-800 transform transition-all duration-500 hover:scale-105">
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    Superior Coverage & Lasting Protection
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Color Palette Display */}
      <section className="py-12 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Discover Our Color Palette
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-6">
            {[
              { name: "Forest Green", color: "#2ECC71" },
              { name: "Lime Green", color: "#32CD32" },
              { name: "Orange", color: "#FFA07A" },
              { name: "Coral", color: "#FFC67D" },
              { name: "Yellow", color: "#F2C464" },
              { name: "Golden", color: "#F8E231" },
              { name: "Brown", color: "#964B00" },
              { name: "Tan", color: "#D2B48C" },
              { name: "Beige", color: "#F5F5DC" },
              { name: "Mint", color: "#B2FFFC" },
              { name: "Teal", color: "#0097A7" },
              { name: "Navy", color: "#03055B" },
            ].map((swatch, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300 h-24 md:h-32"
              >
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: swatch.color }}
                ></div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end">
                  <div className="p-2 w-full transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <div className="bg-white/90 dark:bg-slate-800/90 p-2 rounded text-center text-xs md:text-sm">
                      <p className="font-medium truncate">{swatch.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button
              asChild
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Link href="#">View Full Color Catalog</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24 bg-white dark:bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-100 dark:bg-green-900/20 rounded-full filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-100 dark:bg-orange-900/20 rounded-full filter blur-3xl opacity-30"></div>

        <div className="relative">
          <div className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 rounded-full text-sm font-medium mb-4 mx-auto text-center block">
            Product Features
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Why Choose Amercoatin Paints
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-center max-w-2xl mx-auto mb-16">
            Our premium paints combine cutting-edge technology with superior
            quality ingredients to deliver exceptional performance and
            durability.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={
                <Shield className="h-10 w-10 text-green-600 dark:text-green-400" />
              }
              title="Long-Lasting Protection"
              description="Our paints are formulated to protect surfaces from moisture, UV rays, and environmental damage for years to come."
            />
            <FeatureCard
              icon={
                <Droplet className="h-10 w-10 text-orange-600 dark:text-orange-400" />
              }
              title="Eco-Friendly Formulas"
              description="Low VOC formulas that are better for the environment and create healthier living spaces for you and your family."
            />
            <FeatureCard
              icon={
                <Palette className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
              }
              title="Vibrant, True Colors"
              description="Advanced pigment technology ensures colors stay true and vibrant even after years of exposure to sunlight."
            />
            <FeatureCard
              icon={
                <Home className="h-10 w-10 text-green-600 dark:text-green-400" />
              }
              title="Residential Solutions"
              description="Interior and exterior paints designed specifically for homes, providing beautiful finishes and easy maintenance."
            />
            <FeatureCard
              icon={
                <Building2 className="h-10 w-10 text-orange-600 dark:text-orange-400" />
              }
              title="Commercial Grade"
              description="Durable finishes for high-traffic commercial spaces that withstand heavy use while maintaining appearance."
            />
            <FeatureCard
              icon={
                <Factory className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
              }
              title="Industrial Strength"
              description="Specialized coatings for industrial environments that resist chemicals, abrasion, and extreme temperatures."
            />
          </div>
        </div>
      </section>

      {/* Application Showcase */}
      <section className="py-24 bg-slate-50 dark:bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 rounded-full text-sm font-medium mb-4 mx-auto text-center block">
            Applications
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Perfect for Every Surface
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-center max-w-2xl mx-auto mb-16">
            Amercoatin paints are engineered for specific applications,
            providing optimal performance on a variety of surfaces.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ApplicationCard
              image="interior"
              title="Interior Walls"
              description="Washable, stain-resistant paints that create beautiful living spaces with excellent coverage."
            />
            <ApplicationCard
              image="exterior"
              title="Exterior Facades"
              description="Weather-resistant formulas that protect and beautify your home's exterior for years."
            />
            <ApplicationCard
              image="metal"
              title="Metal Surfaces"
              description="Specialized coatings that prevent rust and corrosion while providing a smooth finish."
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-24 bg-white dark:bg-slate-900">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          What Our Customers Say
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-center max-w-2xl mx-auto mb-16">
          Join thousands of satisfied customers who trust Amercoatin Paints for
          their projects.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <TestimonialCard
            quote="We've used Amercoatin paints for our entire office renovation. The color consistency and coverage are outstanding, and the low odor made it possible to stay operational during painting."
            author="Robert Kamau"
            role="Office Manager"
            rating={5}
          />
          <TestimonialCard
            quote="As a professional painter, I recommend Amercoatin to all my clients. The quality is superior to other brands I've used, and it saves me time with its excellent coverage."
            author="Daniel Mwangi"
            role="Professional Painter"
            rating={5}
          />
          <TestimonialCard
            quote="The color selection is amazing, and the paint quality exceeded our expectations. Our home looks fresh and beautiful, and the finish has held up perfectly."
            author="Jane Wambui"
            role="Homeowner"
            rating={4}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-4xl mx-auto space-y-6 bg-gradient-to-br from-green-500/10 to-orange-400/10 p-12 rounded-2xl border border-green-200 dark:border-green-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm -z-10"></div>
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-300 dark:bg-green-700 rounded-full filter blur-3xl opacity-30 -z-10"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-300 dark:bg-orange-700 rounded-full filter blur-3xl opacity-30 -z-10"></div>

          <div className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 rounded-full text-sm font-medium mb-4 mx-auto">
            Ready to Start Your Project?
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">
            Transform your space with Amercoatin
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Find the perfect color and finish for your next painting project.
          </p>
          <div className="space-y-6 pt-6">
            <Button
              asChild
              size="lg"
              className="px-8 py-6 text-lg bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200/50 dark:shadow-green-900/20 transition-all duration-300"
            >
              <Link href="#">Find a Store Near You</Link>
            </Button>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-8 text-sm text-slate-600 dark:text-slate-400 pt-2">
              <div className="flex items-center">
                <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full mr-2">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span>Professional Color Advice</span>
              </div>
              <div className="flex items-center">
                <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full mr-2">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span>Free Color Samples</span>
              </div>
              <div className="flex items-center">
                <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full mr-2">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span>Project Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-100 dark:bg-slate-800 pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-green-600 to-orange-400 rounded-lg p-1.5 shadow-sm">
                  <Droplet className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-slate-800 dark:text-white">
                  Ankards<span className="text-green-500"> Paints</span>
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Premium paints and solvents for residential, commercial, and
                industrial applications.
              </p>
              <div className="pt-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <strong>Ankards Company Limited</strong>
                  <br />
                  Industrial Area, Nairobi
                  <br />
                  Kenya
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-slate-900 dark:text-slate-100">
                Products
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400"
                  >
                    Interior Paints
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400"
                  >
                    Exterior Paints
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400"
                  >
                    Industrial Coatings
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400"
                  >
                    Specialty Finishes
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
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400"
                  >
                    Color Guide
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400"
                  >
                    Application Tips
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400"
                  >
                    Project Calculator
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400"
                  >
                    Safety Data Sheets
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
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400"
                  >
                    Sustainability
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Ankards Company Limited. All
              rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link
                href="#"
                className="text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400"
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
                className="text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 001.273 3.461 4.106 4.106 0 01-1.273 3.566A11.659 11.659 0 012 18.406a11.685 11.685 0 01-2.774-.473 8.19 8.19 0 012.356-.646A4.118 4.118 0 006.828 16c-1.801.347-3.338 1.721-3.338 3.566 0 2.901 2.41 5.311 5.466 9.601.464.572.213 1.287-.473 1.651-2.466.914-2.773 1.606-2.773 2.773 0 .843.571 1.511 1.313 1.913A3.986 3.986 0 015.82 19.98h-1.057a4.105 4.105 0 00-1.273-3.461 11.65 11.65 0 006.4-15.406z" />
                </svg>
              </Link>
              <Link
                href="#"
                className="text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 001.273 3.461 4.106 4.106 0 01-1.273 3.566A11.659 11.659 0 012 18.406a11.685 11.685 0 01-2.774-.473 8.19 8.19 0 012.356-.646A4.118 4.118 0 006.828 16c-1.801.347-3.338 1.721-3.338 3.566 0 2.901 2.41 5.311 5.466 9.601.464.572.213 1.287-.473 1.651-2.466.914-2.773 1.606-2.773 2.773 0 .843.571 1.511 1.313 1.913A3.986 3.986 0 015.82 19.98h-1.057a4.105 4.105 0 00-1.273-3.461 11.65 11.65 0 006.4-15.406z" />
                </svg>
              </Link>
              <Link
                href="#"
                className="text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                ></svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
