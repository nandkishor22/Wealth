"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { PenBox, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { X, Menu } from "lucide-react";

const Header = () => {
  const { isSignedIn } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b shadow-sm">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between" aria-label="Main navigation">
        <Link href="/">
          <Image
            src={"/logo.png"}
            alt="Wealth Logo"
            width={200}
            height={60}
            className="h-12 w-auto object-contain"
          />
        </Link>

        {/* Navigation Links - Different for signed in/out users */}
        <div className="hidden md:flex items-center space-x-8 mr-4">
          <SignedOut>
            <Link href="/#features" className="text-gray-600 hover:text-blue-600">
              Features
            </Link>
            <Link
              href="/#testimonials"
              className="text-gray-600 hover:text-blue-600"
            >
              Testimonials
            </Link>
          </SignedOut>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          <SignedIn>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-blue-600 flex items-center gap-2"
            >
              <Button variant="outline">
                <LayoutDashboard size={18} />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            </Link>
            <Link href="/transaction/create">
              <Button className="flex items-center gap-2" aria-label="Add transaction">
                <PenBox size={18} />
                <span className="hidden md:inline">Add Transaction</span>
              </Button>
            </Link>
          </SignedIn>
          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button variant="outline" aria-label="Sign in">Login</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          </SignedIn>
        </div>
      </nav>
      {/* Mobile Menu */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2"
          aria-label="Open navigation menu"
        >
          <Menu size={24} />
        </Button>

        {isMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setIsMenuOpen(false)}>
            <div className="absolute top-0 right-0 w-64 h-full bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-end mb-6">
                <Button
                  variant="ghost"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={24} />
                </Button>
              </div>

              <nav className="flex flex-col space-y-4">
                {!isSignedIn ? (
                  <>
                    <Link href="/#features" className="text-gray-600 hover:text-blue-600">
                      Features
                    </Link>
                    <Link href="/#testimonials" className="text-gray-600 hover:text-blue-600">
                      Testimonials
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                      <LayoutDashboard size={18} />
                      Dashboard
                    </Link>
                    <Link href="/transaction/create" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                      <PenBox size={18} />
                      Add Transaction
                    </Link>
                  </>
                )}
              </nav>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <SignedOut>
                  <SignInButton forceRedirectUrl="/dashboard">
                    <Button className="w-full">Login</Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <div className="flex items-center justify-between">
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "w-8 h-8",
                        },
                      }}
                    />
                    <span className="text-sm text-gray-600">Your Account</span>
                  </div>
                </SignedIn>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
