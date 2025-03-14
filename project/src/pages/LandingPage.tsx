"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Briefcase, ChevronRight, Facebook, Hammer, HardHat, Instagram, Linkedin, PenTool, Search, Shield, Star, Twitter, Wrench, Menu, X } from 'lucide-react'

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  update: () => void;
  draw: () => void;
}

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Background effect setup
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Create particles
    const particlesArray: Particle[] = []

    const numberOfParticles = 50
    const colors = ["rgba(38, 166, 154, 0.3)", "rgba(77, 208, 225, 0.3)"]

    class Particle implements Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 5 + 1
        this.speedX = Math.random() * 0.5 - 0.25
        this.speedY = Math.random() * 0.5 - 0.25
        this.color = colors[Math.floor(Math.random() * colors.length)]
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (this.x > canvas.width) this.x = 0
        if (this.x < 0) this.x = canvas.width
        if (this.y > canvas.height) this.y = 0
        if (this.y < 0) this.y = canvas.height
      }

      draw() {
        if (!ctx) return
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.closePath()
        ctx.fill()
      }
    }

    const init = () => {
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle())
      }
    }

    const animate = () => {
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update()
        particlesArray[i].draw()
      }
      requestAnimationFrame(animate)
    }

    init()
    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [])

  // Sample testimonial data with Kenyan names and African faces
  const testimonials = [
    {
      name: "Wanjiku Kamau",
      role: "Electrician",
      quote:
        "KaziHub helped me find consistent work as an electrician. I've built relationships with contractors who now hire me regularly.",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1531384441138-2736e62e0919?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
    },
    {
      name: "Otieno Ochieng",
      role: "Construction Manager",
      quote:
        "Finding reliable workers quickly is essential. KaziHub streamlined our hiring process and delivered skilled talent.",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1539701938214-0d9736e1c16b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
    },
    {
      name: "Njeri Wangari",
      role: "HVAC Technician",
      quote:
        "I struggled to find steady work until KaziHub. Now I have more opportunities than I can handle and better rates.",
      rating: 4,
      avatar:
        "https://images.unsplash.com/photo-1589156280159-27698a70f29e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=772&q=80",
    },
  ]

  // Duplicate testimonials for seamless scrolling
  const doubledTestimonials = [...testimonials, ...testimonials]

  const handleSearch = (e) => {
    e.preventDefault()
    // Handle search functionality
    console.log("Searching for:", searchQuery, "in", location)
  }

  // Inline styles
  const styles = {
    canvas: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      opacity: 0.3,
      zIndex: 0,
    },
    gradientBlob1: {
      position: "absolute",
      top: "10%",
      left: "10%",
      width: "40%",
      height: "40%",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(38, 166, 154, 0.2) 0%, rgba(38, 166, 154, 0) 70%)",
      filter: "blur(50px)",
      opacity: 0.5,
      animation: "float 6s ease-in-out infinite",
    },
    gradientBlob2: {
      position: "absolute",
      bottom: "10%",
      right: "10%",
      width: "60%",
      height: "60%",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(77, 208, 225, 0.2) 0%, rgba(77, 208, 225, 0) 70%)",
      filter: "blur(50px)",
      opacity: 0.5,
      animation: "float 6s ease-in-out infinite 2s",
    },
    gradientBlob3: {
      position: "absolute",
      top: "20%",
      right: "20%",
      width: "40%",
      height: "40%",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(38, 166, 154, 0.2) 0%, rgba(38, 166, 154, 0) 70%)",
      filter: "blur(50px)",
      opacity: 0.5,
      animation: "float 6s ease-in-out infinite 1s",
    },
    gradientBlob4: {
      position: "absolute",
      bottom: "20%",
      left: "20%",
      width: "60%",
      height: "60%",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(77, 208, 225, 0.2) 0%, rgba(77, 208, 225, 0) 70%)",
      filter: "blur(50px)",
      opacity: 0.5,
      animation: "float 6s ease-in-out infinite 3s",
    },
    gradientOverlay1: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "16px",
      height: "100%",
      background: "linear-gradient(to right, rgba(249, 250, 251, 1), rgba(249, 250, 251, 0))",
      pointerEvents: "none",
    },
    gradientOverlay2: {
      position: "absolute",
      top: 0,
      right: 0,
      width: "16px",
      height: "100%",
      background: "linear-gradient(to left, rgba(249, 250, 251, 1), rgba(249, 250, 251, 0))",
      pointerEvents: "none",
    },
    ctaBlob1: {
      position: "absolute",
      top: 0,
      right: 0,
      width: "64px",
      height: "64px",
      borderRadius: "50%",
      background: "rgba(255, 255, 255, 0.2)",
      filter: "blur(30px)",
      opacity: 0.1,
    },
    ctaBlob2: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "64px",
      height: "64px",
      borderRadius: "50%",
      background: "rgba(255, 255, 255, 0.2)",
      filter: "blur(30px)",
      opacity: 0.1,
    },
  }

  // Custom keyframes for animations
  useEffect(() => {
    const styleSheet = document.createElement("style")
    styleSheet.textContent = `
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
      }
      
      @keyframes scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `
    document.head.appendChild(styleSheet)

    return () => {
      document.head.removeChild(styleSheet)
    }
  }, [])

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const mobileMenu = document.getElementById('mobile-menu')
      const menuButton = document.getElementById('menu-button')
      if (mobileMenu && !mobileMenu.contains(event.target as Node) && 
          menuButton && !menuButton.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-teal-600 to-cyan-500 shadow-md">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
              <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              <span className="text-xl sm:text-2xl font-bold text-white">KaziHub</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex justify-center flex-1">
              <ul className="flex">
                {[
                  { name: "Jobs", href: "/jobs" },
                  { name: "Profile", href: "/profile" },
                  { name: "Post a Job", href: "/post-job" },
                  { name: "Messages", href: "/messages" }
                ].map((item) => (
                  <li key={item.name} className="mx-6">
                    <Link href={item.href} className="relative py-2 inline-block">
                      <span className="text-lg font-bold transition-colors duration-300 text-white">
                        {item.name}
                      </span>
                      <span className="absolute bottom-0 left-0 h-[3px] bg-white transition-all duration-300"></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Login/Signup Buttons */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/login" className="hidden md:block text-white hover:text-teal-100 font-medium">
                Log in
              </Link>
              <Link
                href="/register"
                className="bg-white text-teal-600 px-4 py-2 rounded-lg font-medium hover:bg-teal-50 transition-all hover:shadow-lg hover:scale-105"
              >
                Sign Up
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              id="menu-button"
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-white hover:bg-teal-700 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          id="mobile-menu"
          className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} bg-teal-600 border-t border-teal-700`}
        >
          <div className="container mx-auto px-4 py-4">
            <ul className="space-y-4">
              {[
                { name: "Jobs", href: "/jobs" },
                { name: "Profile", href: "/profile" },
                { name: "Post a Job", href: "/post-job" },
                { name: "Messages", href: "/messages" }
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="block text-white hover:text-teal-100 font-medium py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              <li className="pt-4 border-t border-teal-700">
                <Link
                  href="/login"
                  className="block text-white hover:text-teal-100 font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Log in
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="block bg-white text-teal-600 px-4 py-2 rounded-lg font-medium hover:bg-teal-50 transition-all hover:shadow-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-teal-50/80 to-white overflow-hidden">
          {/* Inline 3D background effect */}
          <canvas ref={canvasRef} style={styles.canvas} />
          <div style={styles.gradientBlob1}></div>
          <div style={styles.gradientBlob2}></div>

          <div className="container mx-auto px-4 sm:px-6 relative">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-6 text-center lg:text-left animate-in fade-in slide-in-from-bottom-5 duration-700">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl">
                  <span className="block text-teal-600">Connecting</span>
                  Blue Collar Workers with Great Opportunities
                </h1>
                <p className="max-w-[600px] mx-auto lg:mx-0 text-gray-600 text-base sm:text-lg md:text-xl">
                  KaziHub helps skilled workers find jobs and employers hire reliable talent in construction,
                  manufacturing, maintenance, and more.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row justify-center lg:justify-start">
                  <Link href="/jobs" className="group bg-teal-600 text-white hover:bg-teal-700 inline-flex items-center transition-all hover:shadow-lg hover:scale-105 px-4 py-2 rounded-lg">
                    Find Jobs
                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link href="/post-job" className="border-teal-600 text-teal-600 hover:bg-teal-50 transition-all hover:shadow-lg px-4 py-2 rounded-lg border">
                    Post a Job
                  </Link>
                </div>
              </div>
              {/* Hero Image */}
              <div className="relative rounded-xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.02]">
                <img
                  src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                  alt="African construction workers collaborating"
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="w-full py-12 md:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl bg-white rounded-xl shadow-xl p-8 -mt-16 sm:-mt-20 relative z-10 transform transition-all hover:shadow-2xl">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-hover:text-teal-600" />
                  <input
                    type="text"
                    placeholder="Job title or keyword"
                    className="pl-10 transition-all border-gray-200 focus:border-teal-500 focus:ring-teal-500 group-hover:border-teal-300 w-full p-2 rounded-md border"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex-1 relative group">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-hover:text-teal-600" />
                  <input
                    type="text"
                    placeholder="Location"
                    className="pl-10 transition-all border-gray-200 focus:border-teal-500 focus:ring-teal-500 group-hover:border-teal-300 w-full p-2 rounded-md border"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="bg-teal-600 text-white hover:bg-teal-700 w-full sm:w-auto transition-all hover:shadow-lg hover:scale-105 px-4 py-2 rounded-md"
                >
                  Search Jobs
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:20px_20px] opacity-5"></div>
          <div className="container mx-auto px-4 sm:px-6 relative">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="inline-block rounded-full bg-teal-100 px-4 py-1 text-sm font-medium text-teal-800 transform transition-all hover:scale-105">
                How It Works
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                Simple Process, Powerful Results
              </h2>
              <p className="max-w-2xl text-gray-600 text-base sm:text-lg md:text-xl">
                KaziHub makes it easy to connect workers with employers in just a few simple steps.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {[
                {
                  icon: <HardHat className="h-8 w-8 text-teal-600" />,
                  title: "Create a Profile",
                  content: "Sign up and create your profile showcasing your skills, experience, and availability.",
                },
                {
                  icon: <Search className="h-8 w-8 text-teal-600" />,
                  title: "Find Opportunities",
                  content: "Browse job listings or get matched with employers looking for your specific skills.",
                },
                {
                  icon: <Briefcase className="h-8 w-8 text-teal-600" />,
                  title: "Get Hired",
                  content:
                    "Apply for jobs, connect with employers, and start working on projects that match your skills.",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="border border-teal-100 p-6 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow transform hover:scale-105 duration-300"
                >
                  <div className="mb-4">
                    <div className="mx-auto rounded-full bg-teal-100 p-3 w-14 h-14 flex items-center justify-center transform transition-all hover:scale-110 hover:bg-teal-200">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 text-center mt-4">{item.title}</h3>
                  </div>
                  <div className="text-gray-600">
                    <p className="text-center">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For Workers Section */}
        <section id="for-workers" className="w-full py-12 md:py-24 lg:py-32 bg-teal-50/50 relative overflow-hidden">
          <div className="relative w-full h-full">
            <div style={styles.gradientBlob3}></div>
            <div style={styles.gradientBlob4}></div>
          </div>
          <div className="container mx-auto px-4 sm:px-6 relative">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="relative rounded-xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.02]">
                <img
                  src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80"
                  alt="African professional worker"
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 to-transparent"></div>
              </div>
              <div className="space-y-6 text-center lg:text-left">
                <div className="inline-block rounded-full bg-teal-100 px-4 py-1 text-sm font-medium text-teal-800 transform transition-all hover:scale-105">
                  For Workers
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                  Find Your Next Job Opportunity
                </h2>
                <p className="max-w-lg mx-auto lg:mx-0 text-gray-600 text-base sm:text-lg">
                  KaziHub helps skilled workers find stable employment and advance their careers.
                </p>
                <ul className="space-y-4 text-gray-600">
                  {[
                    "Access to hundreds of job opportunities",
                    "Create a profile that showcases your skills",
                    "Get matched with jobs that fit your experience",
                    "Secure payment protection and fair wages",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3 justify-center lg:justify-start group">
                      <div className="rounded-full bg-teal-100 p-1.5 transition-all group-hover:bg-teal-200">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#14b8a6"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 text-teal-600"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span className="transition-colors group-hover:text-teal-600">{item}</span>
                    </li>
                  ))}
                </ul>
                <button className="bg-teal-600 text-white hover:bg-teal-700 transition-all hover:shadow-lg hover:scale-105 px-4 py-2 rounded-lg">
                  Create Worker Profile
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* For Employers Section */}
        <section id="for-employers" className="w-full py-12 md:py-24 lg:py-32 bg-white relative overflow-hidden">
          <div className="relative w-full h-full">
            <div style={{ ...styles.gradientBlob1, top: "20%", right: "20%", left: "auto" }}></div>
            <div style={{ ...styles.gradientBlob2, bottom: "20%", left: "20%", right: "auto" }}></div>
          </div>
          <div className="container mx-auto px-4 sm:px-6 relative">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-6 text-center lg:text-left order-2 lg:order-1">
                <div className="inline-block rounded-full bg-teal-100 px-4 py-1 text-sm font-medium text-teal-800 transform transition-all hover:scale-105">
                  For Employers
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                  Hire Skilled Workers Quickly
                </h2>
                <p className="max-w-lg mx-auto lg:mx-0 text-gray-600 text-base sm:text-lg">
                  Find reliable, pre-vetted workers for your projects and jobs with KaziHub's employer tools.
                </p>
                <ul className="space-y-4 text-gray-600">
                  {[
                    "Post jobs and receive qualified applicants",
                    "Browse worker profiles and invite them to apply",
                    "Verify skills and experience with our rating system",
                    "Manage your workforce efficiently with our tools",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3 justify-center lg:justify-start group">
                      <div className="rounded-full bg-teal-100 p-1.5 transition-all group-hover:bg-teal-200">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#14b8a6"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 text-teal-600"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span className="transition-colors group-hover:text-teal-600">{item}</span>
                    </li>
                  ))}
                </ul>
                <button className="bg-teal-600 text-white hover:bg-teal-700 transition-all hover:shadow-lg hover:scale-105 px-4 py-2 rounded-lg">
                  Post a Job
                </button>
              </div>
              <div className="relative rounded-xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.02] order-1 lg:order-2">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/office.jpg-YcXHacXlxQ0abNWKhaO88t3QfX64It.jpeg"
                  alt="Employer reviewing applications"
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Job Categories Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:20px_20px] opacity-5"></div>
          <div className="container mx-auto px-4 sm:px-6 relative">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="inline-block rounded-full bg-teal-100 px-4 py-1 text-sm font-medium text-teal-800 transform transition-all hover:scale-105">
                Job Categories
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Explore Jobs by Category</h2>
              <p className="max-w-2xl text-gray-600 text-base sm:text-lg md:text-xl">
                KaziHub connects workers and employers across a wide range of blue collar industries.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {[
                {
                  icon: <HardHat className="h-6 w-6 text-teal-600" />,
                  title: "Construction",
                  content: "Find jobs in general construction, carpentry, electrical work, plumbing, and more.",
                },
                {
                  icon: <PenTool className="h-6 w-6 text-teal-600" />,
                  title: "Manufacturing",
                  content: "Explore opportunities in production, assembly, machine operation, and quality control.",
                },
                {
                  icon: <Wrench className="h-6 w-6 text-teal-600" />,
                  title: "Maintenance",
                  content: "Find maintenance, repair, janitorial, and facilities management positions.",
                },
                {
                  icon: <Hammer className="h-6 w-6 text-teal-600" />,
                  title: "Skilled Trades",
                  content: "Connect with employers looking for welders, electricians, HVAC technicians, and more.",
                },
                {
                  icon: <TruckIcon className="h-6 w-6 text-teal-600" />,
                  title: "Transportation",
                  content: "Find jobs for drivers, delivery personnel, warehouse workers, and logistics staff.",
                },
                {
                  icon: <Shield className="h-6 w-6 text-teal-600" />,
                  title: "Security",
                  content: "Explore security guard, loss prevention, and safety officer positions.",
                },
              ].map((category, index) => (
                <div
                  key={index}
                  className="bg-white p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow transform hover:scale-105 duration-300"
                >
                  <div className="mb-4 flex flex-row items-center gap-4">
                    <div className="rounded-full bg-teal-100 p-2 transition-all group-hover:bg-teal-200">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">{category.title}</h3>
                  </div>
                  <div className="text-gray-500">
                    <p>{category.content}</p>
                  </div>
                  <div className="mt-4">
                    <Link
                      href="#"
                      className="text-teal-600 hover:text-teal-700 text-sm font-medium group flex items-center"
                    >
                      Browse {category.title} Jobs
                      <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-12">
              <button className="bg-teal-600 text-white hover:bg-teal-700 transition-all hover:shadow-lg hover:scale-105 px-4 py-2 rounded-lg">
                View All Categories
              </button>
            </div>
          </div>
        </section>

        {/* Testimonials Section with Horizontal Scroll */}
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 overflow-hidden relative">
          <div className="relative w-full h-full">
            <div style={{ ...styles.gradientBlob1, top: "25%", left: "25%" }}></div>
            <div style={{ ...styles.gradientBlob2, bottom: "25%", right: "25%" }}></div>
          </div>
          <div className="container mx-auto px-4 sm:px-6 relative">
            <div className="flex flex-col items-center space-y-6 text-center mb-12">
              <div className="inline-block rounded-full bg-teal-100 px-4 py-1 text-sm font-medium text-teal-800">
                Testimonials
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">What Our Users Say</h2>
              <p className="max-w-2xl text-gray-600 text-base sm:text-lg md:text-xl">
                Hear from workers and employers who've found success with KaziHub.
              </p>
            </div>
            <div className="relative">
              <div className="flex overflow-x-auto pb-4 scrollbar-hide">
                {doubledTestimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="min-w-[280px] sm:min-w-[320px] mx-3 bg-white rounded-xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-transform duration-300"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={testimonial.avatar || "/placeholder.svg"}
                        alt={`${testimonial.name}'s avatar`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-teal-200"
                      />
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">{testimonial.name}</h4>
                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="flex mb-3">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <Star
                            key={i}
                            className={i < testimonial.rating ? "text-yellow-400 fill-yellow-400 h-5 w-5" : "text-gray-300 h-5 w-5"}
                          />
                        ))}
                    </div>
                    <p className="text-gray-600 italic text-sm sm:text-base">"{testimonial.quote}"</p>
                  </div>
                ))}
              </div>
              {/* Gradient overlays for fade effect */}
              <div style={styles.gradientOverlay1}></div>
              <div style={styles.gradientOverlay2}></div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-teal-600 relative overflow-hidden">
          <div className="relative w-full h-full">
            <div style={styles.ctaBlob1}></div>
            <div style={styles.ctaBlob2}></div>
          </div>
          <div className="container mx-auto px-4 sm:px-6 relative">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter text-white md:text-4xl">Ready to Get Started?</h2>
                <p className="max-w-[600px] mx-auto text-teal-100 md:text-xl/relaxed">
                  Join thousands of workers and employers who are already using KaziHub to connect and get work done.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/jobs"
                  className="bg-white text-teal-600 hover:bg-teal-50 inline-flex h-11 items-center justify-center transition-all hover:shadow-lg hover:scale-105 px-4 py-2 rounded-lg"
                >
                  Find Jobs
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
                <Link
                  href="/post-job"
                  className="border-white text-white hover:bg-teal-700 transition-all hover:shadow-lg px-4 py-2 rounded-lg border"
                >
                  Post a Job
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-6 w-6 text-teal-600" />
                <span className="text-xl font-bold text-teal-600">KaziHub</span>
              </div>
              <p className="text-gray-500">
                Connecting blue collar workers with employers for better job opportunities.
              </p>
              <div className="flex space-x-4">
                {[
                  { icon: <Facebook className="h-5 w-5" />, label: "Facebook" },
                  { icon: <Twitter className="h-5 w-5" />, label: "Twitter" },
                  { icon: <Instagram className="h-5 w-5" />, label: "Instagram" },
                  { icon: <Linkedin className="h-5 w-5" />, label: "LinkedIn" },
                ].map((social, index) => (
                  <Link
                    key={index}
                    href="#"
                    className="text-gray-500 hover:text-teal-600 transition-colors transform hover:scale-110"
                    aria-label={social.label}
                  >
                    {social.icon}
                    <span className="sr-only">{social.label}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">For Workers</h3>
              <ul className="space-y-2">
                {[
                  { name: "Find Jobs", href: "/jobs" },
                  { name: "Create Profile", href: "/profile" },
                  { name: "Worker Success Stories", href: "/success-stories" },
                  { name: "Resources", href: "/resources" }
                ].map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="text-gray-500 hover:text-teal-600 transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">For Employers</h3>
              <ul className="space-y-2">
                {[
                  { name: "Post a Job", href: "/post-job" },
                  { name: "Browse Workers", href: "/workers" },
                  { name: "Pricing", href: "/pricing" },
                  { name: "Enterprise Solutions", href: "/enterprise" }
                ].map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="text-gray-500 hover:text-teal-600 transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Company</h3>
              <ul className="space-y-2">
                {[
                  { name: "About Us", href: "/about" },
                  { name: "Contact", href: "/contact" },
                  { name: "Privacy Policy", href: "/privacy" },
                  { name: "Terms of Service", href: "/terms" }
                ].map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="text-gray-500 hover:text-teal-600 transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center">
            <p className="text-gray-500">© {new Date().getFullYear()} KaziHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function TruckIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 17h4V5H2v12h3" />
      <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1" />
      <circle cx="7.5" cy="17.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  )
}