import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, ChevronRight, Hammer, HardHat, Search, Shield, Star, PenToolIcon as Tool, Wrench, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

// Enhanced Button component
const Button = ({ children, className, variant, size, ...props }) => (
  <button
    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
      variant === 'outline'
        ? 'border-2 border-teal-600 text-teal-600 hover:bg-teal-50'
        : 'bg-teal-600 text-white hover:bg-teal-700'
    } ${size === 'sm' ? 'text-sm px-3 py-1' : 'text-base'} ${className}`}
    {...props}
  >
    {children}
  </button>
);

// Enhanced Card components
const Card = ({ children, className }) => (
  <div className={`p-6 border rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow ${className}`}>
    {children}
  </div>
);
const CardHeader = ({ children }) => <div className="mb-4">{children}</div>;
const CardTitle = ({ children }) => <h3 className="text-xl font-semibold text-gray-800">{children}</h3>;
const CardDescription = ({ children }) => <p className="text-sm text-gray-500">{children}</p>;
const CardContent = ({ children }) => <div className="text-gray-600">{children}</div>;
const CardFooter = ({ children }) => <div className="mt-4">{children}</div>;

// Enhanced Input component
const Input = ({ className, ...props }) => (
  <input
    className={`w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${className}`}
    {...props}
  />
);

// Testimonial Card with Stylish Framing
const TestimonialCard = ({ name, role, quote, rating, avatar }) => (
  <div className="min-w-[280px] sm:min-w-[320px] mx-3 bg-white rounded-xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-transform duration-300">
    <div className="flex items-center gap-4 mb-4">
      <img
        src={avatar || '/placeholder.svg?height=60&width=60'}
        alt={`${name}'s avatar`}
        className="w-12 h-12 rounded-full object-cover border-2 border-teal-200"
      />
      <div>
        <h4 className="text-lg font-semibold text-gray-800">{name}</h4>
        <p className="text-sm text-gray-500">{role}</p>
      </div>
    </div>
    <div className="flex mb-3">
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
    </div>
    <p className="text-gray-600 italic text-sm sm:text-base">"{quote}"</p>
  </div>
);

export default function LandingPage() {
  const navigate = useNavigate(); // Add navigation hook
  const [searchQuery, setSearchQuery] = useState(''); // State for job title/keyword
  const [location, setLocation] = useState(''); // State for location

  // Sample testimonial data (duplicated for continuous scroll effect)
  const testimonials = [
    {
      name: 'James Wilson',
      role: 'Electrician',
      quote:
        'KaziHub helped me find consistent work as an electrician. I\'ve built relationships with contractors who now hire me regularly.',
      rating: 5,
      avatar: '/placeholder.svg?height=60&width=60',
    },
    {
      name: 'Maria Rodriguez',
      role: 'Construction Manager',
      quote:
        'Finding reliable workers quickly is essential. KaziHub streamlined our hiring process and delivered skilled talent.',
      rating: 5,
      avatar: '/placeholder.svg?height=60&width=60',
    },
    {
      name: 'David Thompson',
      role: 'HVAC Technician',
      quote:
        'I struggled to find steady work until KaziHub. Now I have more opportunities than I can handle and better rates.',
      rating: 4,
      avatar: '/placeholder.svg?height=60&width=60',
    },
  ];

  // Duplicate testimonials for seamless scrolling
  const doubledTestimonials = [...testimonials, ...testimonials];

  const handleSearch = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent default button behavior if wrapped in a form
    // Navigate to Jobs page with query parameters
    navigate(`/jobs?query=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(location)}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header - Enhanced with better transitions */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 transition-all duration-300">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 transition-transform hover:scale-105">
            <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-teal-600" />
            <span className="text-xl sm:text-2xl font-bold text-teal-600">KaziHub</span>
          </div>
          <nav className="hidden md:flex gap-6">
            {['How It Works', 'For Workers', 'For Employers', 'Testimonials'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors relative after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-0 after:bg-teal-600 after:transition-all hover:after:w-full"
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/login">
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex text-teal-600 hover:text-teal-700 hover:bg-teal-50 transition-colors"
              >
                Log in
              </Button>
            </Link>
            <Link to="/register">
              <Button 
                size="sm" 
                className="bg-teal-600 text-white hover:bg-teal-700 transition-all hover:shadow-lg hover:scale-105"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section - Enhanced with gradient overlay and animations */}
        <section className="relative w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-teal-50/80 to-white overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container mx-auto px-4 sm:px-6 relative">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-6 text-center lg:text-left animate-fade-in">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl">
                  <span className="block text-teal-600">Connecting</span>
                  Blue Collar Workers with Great Opportunities
                </h1>
                <p className="max-w-[600px] mx-auto lg:mx-0 text-gray-600 text-base sm:text-lg md:text-xl">
                  KaziHub helps skilled workers find jobs and employers hire reliable talent in construction,
                  manufacturing, maintenance, and more.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row justify-center lg:justify-start">
                  <Link to="/jobs">
                    <Button className="group bg-teal-600 text-white hover:bg-teal-700 inline-flex items-center transition-all hover:shadow-lg hover:scale-105">
                      Find Jobs
                      <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link to="/post-job">
                    <Button 
                      variant="outline" 
                      className="border-teal-600 text-teal-600 hover:bg-teal-50 transition-all hover:shadow-lg"
                    >
                      Post a Job
                    </Button>
                  </Link>
                </div>
              </div>
              {/* Hero Image - Enhanced with responsive images and overlay */}
              <div className="relative rounded-xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.02]">
                <picture>
                  <source media="(max-width: 640px)" srcSet="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/phone%20Hero-u4BF0Pt4K2Qzu6hy0X2nWn2kZ2qtZO.png" />
                  <source media="(min-width: 641px)" srcSet="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/laptopHero-pQlYPE5yx8BwPSFIDMocnF7zFXDGMp.png" />
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/laptopHero-pQlYPE5yx8BwPSFIDMocnF7zFXDGMp.png"
                    alt="Construction workers collaborating"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Search Section - Enhanced with animation and shadow */}
        <section className="w-full py-12 md:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl bg-white rounded-xl shadow-xl p-8 -mt-16 sm:-mt-20 relative z-10 transform transition-all hover:shadow-2xl">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-hover:text-teal-600" />
                  <Input 
                    type="text" 
                    placeholder="Job title or keyword" 
                    className="pl-10 transition-all border-gray-200 focus:border-teal-500 focus:ring-teal-500 group-hover:border-teal-300" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex-1 relative group">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-hover:text-teal-600" />
                  <Input 
                    type="text" 
                    placeholder="Location" 
                    className="pl-10 transition-all border-gray-200 focus:border-teal-500 focus:ring-teal-500 group-hover:border-teal-300" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <Button 
                  className="bg-teal-600 text-white hover:bg-teal-700 w-full sm:w-auto transition-all hover:shadow-lg hover:scale-105"
                  onClick={handleSearch}
                >
                  Search Jobs
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="inline-block rounded-full bg-teal-100 px-4 py-1 text-sm font-medium text-teal-800 transform transition-all hover:scale-105">
                How It Works
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 gradient-text">
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
                  content: "Sign up and create your profile showcasing your skills, experience, and availability."
                },
                {
                  icon: <Search className="h-8 w-8 text-teal-600" />,
                  title: "Find Opportunities",
                  content: "Browse job listings or get matched with employers looking for your specific skills."
                },
                {
                  icon: <Briefcase className="h-8 w-8 text-teal-600" />,
                  title: "Get Hired",
                  content: "Apply for jobs, connect with employers, and start working on projects that match your skills."
                }
              ].map((item, index) => (
                <Card key={index} className="border-teal-100 card-hover">
                  <CardHeader>
                    <div className="mx-auto rounded-full bg-teal-100 p-3 w-14 h-14 flex items-center justify-center transform transition-all hover:scale-110 hover:bg-teal-200">
                      {item.icon}
                    </div>
                    <CardTitle className="text-center mt-4">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center">
                      {item.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* For Workers Section - Enhanced with consistent image and effects */}
        <section id="for-workers" className="w-full py-12 md:py-24 lg:py-32 bg-teal-50/50">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="relative rounded-xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.02]">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/phoneworker-glR4cg3BEHTLOqa0OiEWxCxIgHuPzS.png"
                  alt="Professional worker"
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
                    'Access to hundreds of job opportunities',
                    'Create a profile that showcases your skills',
                    'Get matched with jobs that fit your experience',
                    'Secure payment protection and fair wages'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3 justify-center lg:justify-start group">
                      <div className="rounded-full bg-teal-100 p-1.5 transition-all group-hover:bg-teal-200">
                        <Check className="h-4 w-4 text-teal-600" />
                      </div>
                      <span className="transition-colors group-hover:text-teal-600">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button className="bg-teal-600 text-white hover:bg-teal-700 transition-all hover:shadow-lg hover:scale-105">
                    Create Worker Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* For Employers Section */}
        <section id="for-employers" className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container mx-auto px-4 sm:px-6">
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
                    'Post jobs and receive qualified applicants',
                    'Browse worker profiles and invite them to apply',
                    'Verify skills and experience with our rating system',
                    'Manage your workforce efficiently with our tools'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3 justify-center lg:justify-start group">
                      <div className="rounded-full bg-teal-100 p-1.5 transition-all group-hover:bg-teal-200">
                        <Check className="h-4 w-4 text-teal-600" />
                      </div>
                      <span className="transition-colors group-hover:text-teal-600">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/post-job">
                  <Button className="bg-teal-600 text-white hover:bg-teal-700 transition-all hover:shadow-lg hover:scale-105">
                    Post a Job
                  </Button>
                </Link>
              </div>
              <div className="relative rounded-xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.02] order-1 lg:order-2">
                <img
                  src="/placeholder.svg?height=500&width=500"
                  alt="Employer reviewing applications"
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Job Categories Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="inline-block rounded-full bg-teal-100 px-4 py-1 text-sm font-medium text-teal-800 transform transition-all hover:scale-105">
                Job Categories
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 gradient-text">
                Explore Jobs by Category
              </h2>
              <p className="max-w-2xl text-gray-600 text-base sm:text-lg md:text-xl">
                KaziHub connects workers and employers across a wide range of blue collar industries.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {[
                {
                  icon: <HardHat className="h-6 w-6 text-teal-600" />,
                  title: "Construction",
                  content: "Find jobs in general construction, carpentry, electrical work, plumbing, and more."
                },
                {
                  icon: <Tool className="h-6 w-6 text-teal-600" />,
                  title: "Manufacturing",
                  content: "Explore opportunities in production, assembly, machine operation, and quality control."
                },
                {
                  icon: <Wrench className="h-6 w-6 text-teal-600" />,
                  title: "Maintenance",
                  content: "Find maintenance, repair, janitorial, and facilities management positions."
                },
                {
                  icon: <Hammer className="h-6 w-6 text-teal-600" />,
                  title: "Skilled Trades",
                  content: "Connect with employers looking for welders, electricians, HVAC technicians, and more."
                },
                {
                  icon: <Truck className="h-6 w-6 text-teal-600" />,
                  title: "Transportation",
                  content: "Find jobs for drivers, delivery personnel, warehouse workers, and logistics staff."
                },
                {
                  icon: <Shield className="h-6 w-6 text-teal-600" />,
                  title: "Security",
                  content: "Explore security guard, loss prevention, and safety officer positions."
                }
              ].map((category, index) => (
                <Card key={index} className="bg-white hover:shadow-md transition-shadow card-hover">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="rounded-full bg-teal-100 p-2 transition-all group-hover:bg-teal-200">
                      {category.icon}
                    </div>
                    <CardTitle>{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">
                      {category.content}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link to={`/jobs/category/${category.title.toLowerCase()}`} className="text-teal-600 hover:text-teal-700 text-sm font-medium group flex items-center">
                      Browse {category.title} Jobs
                      <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <div className="flex justify-center mt-12">
              <Link to="/jobs/categories">
                <Button className="bg-teal-600 text-white hover:bg-teal-700 transition-all hover:shadow-lg hover:scale-105">
                  View All Categories
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials Section with Horizontal Scroll */}
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col items-center space-y-6 text-center mb-12">
              <div className="inline-block rounded-full bg-teal-100 px-4 py-1 text-sm font-medium text-teal-800">
                Testimonials
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 gradient-text">
                What Our Users Say
              </h2>
              <p className="max-w-2xl text-gray-600 text-base sm:text-lg md:text-xl">
                Hear from workers and employers who've found success with KaziHub.
              </p>
            </div>
            <div className="relative">
              <div className="flex animate-scroll whitespace-nowrap">
                {doubledTestimonials.map((testimonial, index) => (
                  <TestimonialCard
                    key={index}
                    name={testimonial.name}
                    role={testimonial.role}
                    quote={testimonial.quote}
                    rating={testimonial.rating}
                    avatar={testimonial.avatar}
                  />
                ))}
              </div>
              {/* Gradient overlays for fade effect */}
              <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-gray-50 to-transparent pointer-events-none" />
              <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-teal-600">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter text-white md:text-4xl">
                  Ready to Get Started?
                </h2>
                <p className="max-w-[600px] mx-auto text-teal-100 md:text-xl/relaxed">
                  Join thousands of workers and employers who are already using KaziHub to connect and get work done.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link to="/jobs">
                  <Button 
                    size="lg" 
                    className="bg-white text-teal-600 hover:bg-teal-50 inline-flex h-11 items-center justify-center transition-all hover:shadow-lg hover:scale-105"
                  >
                    Find Jobs
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/post-job">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-white text-white hover:bg-teal-700 transition-all hover:shadow-lg"
                  >
                    Post a Job
                  </Button>
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
                  { icon: <Linkedin className="h-5 w-5" />, label: "LinkedIn" }
                ].map((social, index) => (
                  <Link 
                    key={index} 
                    to="#" 
                    className="text-gray-500 hover:text-teal-600 transition-colors hover-lift"
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
                {["Find Jobs", "Create Profile", "Worker Success Stories", "Resources"].map((item, index) => (
                  <li key={index}>
                    <Link to="#" className="text-gray-500 hover:text-teal-600 transition-colors hover-lift">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">For Employers</h3>
              <ul className="space-y-2">
                {["Post a Job", "Browse Workers", "Pricing", "Enterprise Solutions"].map((item, index) => (
                  <li key={index}>
                    <Link to="#" className="text-gray-500 hover:text-teal-600 transition-colors hover-lift">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Company</h3>
              <ul className="space-y-2">
                {["About Us", "Contact", "Privacy Policy", "Terms of Service"].map((item, index) => (
                  <li key={index}>
                    <Link to="#" className="text-gray-500 hover:text-teal-600 transition-colors hover-lift">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center">
            <p className="text-gray-500">
              © {new Date().getFullYear()} KaziHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Check(props) {
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
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Truck(props) {
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
  );
}