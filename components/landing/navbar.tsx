"use client";

import React from "react";
import { Droplet } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="container mx-auto py-6 px-4 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-teal-400 rounded-lg p-1.5 shadow-lg">
          <Droplet className="h-6 w-6 text-white" />
        </div>
        <span className="text-xl font-bold text-slate-800 dark:text-white">
          Ankards<span className="text-blue-500"> Paints</span>
        </span>
      </div>
      <div className="hidden md:flex space-x-6">
        <Link
          href="#"
          className="text-slate-600 hover:text-blue-500 dark:text-slate-300 dark:hover:text-blue-400"
        >
          Products
        </Link>
        <Link
          href="#"
          className="text-slate-600 hover:text-blue-500 dark:text-slate-300 dark:hover:text-blue-400"
        >
          Color Gallery
        </Link>
        <Link
          href="#"
          className="text-slate-600 hover:text-blue-500 dark:text-slate-300 dark:hover:text-blue-400"
        >
          Applications
        </Link>
        <Link
          href="#"
          className="text-slate-600 hover:text-blue-500 dark:text-slate-300 dark:hover:text-blue-400"
        >
          Resources
        </Link>
        <Link
          href="#"
          className="text-slate-600 hover:text-blue-500 dark:text-slate-300 dark:hover:text-blue-400"
        >
          About Us
        </Link>
      </div>
      <div className="flex space-x-4">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          <Link href="#">Find a Dealer</Link>
        </Button>
        <Button
          asChild
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
        >
          <Link href="#">Contact Us</Link>
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
