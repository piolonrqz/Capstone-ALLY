import React, { useEffect, useState } from "react";
import { useNavigate, Link, data } from "react-router-dom";
import { Shield, CheckCircle, Clock, Users, Award, Lock, Zap, Quote, Star, Bot, Search, MessageSquare, Phone } from 'lucide-react';
import Footer from '../components/Footer';
import NavigationBar from '../components/NavigationBar';

const LandingPage = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");
  const isLawyer =  localStorage.getItem("role")  ;
  const [showTokenExpired, setShowTokenExpired] = useState(false);
  const [credentialsStatus, setCredentialsStatus] = useState(null);

  const checkUserCredentials = async () => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  if (!token || !userId) return null;

  try {
    const response = await fetch(`http://localhost:8080/users/${userId}/checkcredentials`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch credentials');
    }
    const data = await response.json();
    setCredentialsStatus(data);
    return data;
  } catch (error) {
    console.error('Error checking credentials:', error);
    setCredentialsStatus(null);
    return null;
  }
};

useEffect(() => {
  if (isLawyer === "LAWYER") {
    checkUserCredentials();
  }
}, [isLawyer]);

  // JWT Expiry Check
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && Date.now() >= payload.exp * 1000) {
          setShowTokenExpired(true);
          localStorage.removeItem('token');
        }
      } catch (e) {
        console.error("Internal Server Error", e);
      }
    };
    checkToken();
    const interval = setInterval(checkToken, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const companies = [
    { name: "LegalCorp", icon: "/legal_corp.png" },
    { name: "JusticeFirm", icon: "/justice_firm.png" },
    { name: "LawWorks", icon: "/law.png" },
    { name: "EthicsLaw", icon: "/timbangan.png" },
    { name: "JusticeAid", icon: "/hammer.png" },
  ];

  const stats = [
    {
      number: "50,000+",
      title: "Clients Helped",
      description: "Successfully matched with legal experts",
      icon: Users
    },
    {
      number: "500+",
      title: "Verified Lawyers",
      description: "Licensed professionals in our network",
      icon: Award
    },
    {
      number: "100%",
      title: "Confidential",
      description: "Your privacy is always protected",
      icon: Lock
    },
    {
      number: "< 2 min",
      title: "Average Response",
      description: "Quick connections to legal help",
      icon: Zap
    }
  ];

  const testimonials = [
    {
      name: "Kim Yu",
      role: "Small Business Owner",
      image: "/testimonial-profile-1.png",
      quote: "I was completely overwhelmed trying to figure out where to start with a legal issue I'd never dealt with before. ALLY made it so easy to connect with a lawyer who understood my situation. The AI consultation gave me a clear idea of what to expect, and I didn't have to wait days for a response. Everything was smooth, secure, and honestly a relief. This platform gave me peace of mind when I needed it most."
    },
    {
      name: "Piolo Enriquez", 
      role: "Civil Litigation Attorney",
      image: "/testimonial-profile-2.png",
      quote: "ALLY has transformed the way I manage my practice. The case-matching system brings me clients that are actually relevant to my area of expertise, and the centralized document access saves hours each week. Plus, clients are better informed when they reach out, thanks to the AI consultation feature. It's a smarter, more efficient way to work—and I wouldn't go back."
    }
  ];  return (
    <>
      {/* Token Expired Modal */}
      {showTokenExpired && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-sm p-8 text-center bg-white rounded-lg shadow-lg">
            <h2 className="mb-4 text-xl font-bold text-red-600">Session Expired</h2>
            <p className="mb-6 text-gray-700">Your session has expired. Please log in again to continue.</p>
            <button
              className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              onClick={() => { setShowTokenExpired(false); navigate('/login'); }}
            >
              Log In
            </button>
          </div>
        </div>
      )}
      
      {/* Navigation Bar */}
      <NavigationBar />

      {isLawyer === "LAWYER" && credentialsStatus && credentialsStatus.credentialsVerified === false && (
  credentialsStatus.credentials ? (
    <div className="w-full bg-yellow-100 border-b border-yellow-300 text-yellow-900 py-3 px-4 text-center font-medium">
      Your credentials have been submitted and are pending verification by the admin.
    </div>
  ) : (
    <div className="w-full bg-red-100 border-b border-red-400 text-red-800 py-3 px-4 text-center font-medium">
      Your credentials were rejected. Please upload valid credentials to proceed.
    </div>
  )
)}
      <div className="flex flex-col min-h-screen bg-white">

      {/* Hero Section */}
      <section className="bg-[#F7FBFF] px-8 pt-32 pb-40 min-h-[900px] flex items-center">
        <div className="max-w-[1440px] mx-auto w-full">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main Heading */}
            <h1 className="mb-6 text-6xl font-bold leading-tight">
              <span className="text-[#11265A]">Find Legal Help,</span><br />
              <span className="text-[#1A6EFF]">Anonymously & Securely</span>
            </h1>
            
            {/* Subheading */}
            <p className="text-2xl text-[#7C7C7C] mb-12 leading-relaxed">
              Connect with verified legal professionals instantly.<br />
              Get expert guidance without compromising your privacy.
            </p>

            {/* Buttons Section */}
            <div className="flex items-center justify-center w-full max-w-2xl gap-6 mx-auto mb-12">
              <button
                onClick={() => navigate('/consult')}
                className="flex items-center justify-center gap-3 px-6 py-4 text-lg font-medium text-white whitespace-nowrap transition-colors rounded-xl bg-[#1A6EFF] hover:bg-blue-700 min-w-[280px]"
              >
                <Bot className="w-6 h-6" />
                Try AI Consultation - Free
              </button>
              {isLawyer !== "LAWYER" && (
                <button
                  onClick={() => navigate('/lawyers')}
                  className="flex items-center justify-center gap-3 px-6 py-4 text-lg font-medium text-[#11265A] whitespace-nowrap transition-colors bg-white border border-gray-200 rounded-xl hover:bg-gray-50 min-w-[220px]"
                >
                  <Users className="w-6 h-6" />
                  Find Expert Lawyers
                </button>
              )}
            </div>

            {/* Feature Badges */}
            <div className="flex justify-center gap-12">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-white rounded">
                  <Shield className="w-5 h-5 text-[#00C06F]" strokeWidth={2} />
                </div>
                <span className="text-[#363636] text-lg">100% Anonymous</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-white rounded">
                  <CheckCircle className="w-5 h-5 text-[#1A6EFF]" strokeWidth={2} />
                </div>
                <span className="text-[#363636] text-lg">Verified Lawyers</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-white rounded">
                  <Clock className="w-5 h-5 text-[#7578DA]" strokeWidth={2} />
                </div>
                <span className="text-[#363636] text-lg">24/7 Available</span>
              </div>
            </div>
          </div>
        </div>
      </section>{/* How It Works Section */}
      <section className="pt-32 pb-20">
        <div className="max-w-[1200px] mx-auto px-8">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <h2 className="text-5xl font-semibold text-[#11265A] mb-4">HOW IT WORKS</h2>
            <p className="text-xl text-[#545454] font-normal">
              Getting legal help has never been easier. Follow these simple steps<br />
              to connect with expert Lawyers.
            </p>
          </div>

          {/* Step 1 */}
          <div className="flex items-center gap-20 mb-20">
            <div className="flex-1">
              <div className="mb-6">
                <span className="text-3xl text-[#1A6EFF] font-medium">/ 01</span>
              </div>
              <div className="mb-6">
                <h3 className="text-[#545454] text-3xl">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#1A6EFF] text-white px-3 py-1 rounded-lg">
                      the ease of submitting
                    </span>
                    <span>queries</span>
                  </div>
                  <span className="block mt-2">can provide a different</span>
                  <span className="block mt-2">experience</span>
                </h3>
              </div>
              <p className="text-base text-[#7B7B7B] mb-8 leading-relaxed">
                Describe your legal issue anonymously in just a few minutes.<br />
                our platform makes it easy for you to find the right legal help<br />
                quickly and securely.
              </p>
              <button className="border border-[#BBBBBB] text-[#292929] px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                Learn More
              </button>
            </div>
            
            <div className="relative flex-1">
              <div className="bg-[#B9DEFF] rounded-[18px] shadow-lg h-[296px] relative p-4">
                <div className="bg-white shadow-lg rounded-[18px] h-full relative overflow-hidden">
                  {/* Top Icon */}
                  <div className="absolute top-6 left-6 bg-[#1A6EFF] p-2 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  
                  {/* Top Right Logo */}
                  <div className="absolute top-6 right-6 flex items-center gap-2">
                    <img src="/ally_logo.svg" alt="ALLY" className="w-[70px]" />
                  </div>
                  
                  {/* Mock Content Lines */}
                  <div className="absolute space-y-2 top-24 left-6 right-6">
                    <div className="bg-[#BBBBBB] h-2 rounded w-3/4"></div>
                    <div className="bg-[#BBBBBB] h-2 rounded w-1/2"></div>
                  </div>
                  
                  {/* Blue Button */}
                  <div className="absolute bottom-20 left-6 right-6">
                    <div className="bg-[#E8EEFC] text-[#1A6EFF] px-3 py-2 rounded text-sm font-medium text-center mb-3 border border-[#1A6EFF]">
                      Legal Question Form
                    </div>
                  </div>
                  
                  {/* Get Started Button */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-[#1A6EFF] text-white px-6 py-2 rounded text-sm font-medium text-center">
                      Get Started
                    </div>
                  </div>
                </div>
              </div>
              {/* Step Number */}
              <div className="absolute -bottom-6 right-8 bg-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-2 border-[#1A6EFF] text-[#1A6EFF] text-2xl font-semibold">
                01
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-20 mb-20">
            <div className="relative flex-1">
              <div className="bg-[#B9DEFF] rounded-[18px] shadow-lg h-[296px] relative p-4">
                <div className="bg-white shadow-lg rounded-[18px] h-full relative overflow-hidden">
                  {/* Top Icon */}
                  <div className="absolute top-6 left-6 bg-[#1A6EFF] p-2 rounded-lg">
                    <Users className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  
                  {/* Top Right Logo */}
                  <div className="absolute top-6 right-6 flex items-center gap-2">
                    <img src="/ally_logo.svg" alt="ALLY" className="w-[70px]" />
                  </div>
                  
                  {/* Mock Content Lines */}
                  <div className="absolute space-y-2 top-24 left-6 right-6">
                    <div className="bg-[#BBBBBB] h-2 rounded w-3/4"></div>
                    <div className="bg-[#BBBBBB] h-2 rounded w-1/2"></div>
                  </div>
                  
                  {/* Blue Button */}
                  <div className="absolute bottom-20 left-6 right-6">
                    <div className="bg-[#E8EEFC] text-[#1A6EFF] px-3 py-2 rounded text-sm font-medium text-center mb-3 border border-[#1A6EFF]">
                      Expert Matching
                    </div>
                  </div>
                  
                  {/* Get Started Button */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-[#1A6EFF] text-white px-6 py-2 rounded text-sm font-medium text-center">
                      Get Started
                    </div>
                  </div>
                </div>
              </div>
              {/* Step Number */}
              <div className="absolute -bottom-6 right-8 bg-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-2 border-[#1A6EFF] text-[#1A6EFF] text-2xl font-semibold">
                02
              </div>
            </div>

            <div className="flex-1">
              <div className="mb-6">
                <span className="text-3xl text-[#1A6EFF] font-medium">/ 02</span>
              </div>
              <div className="mb-6">
                <h3 className="text-[#545454] text-3xl">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#1A6EFF] text-white px-3 py-1 rounded-lg">
                      the ease of matching
                    </span>
                    <span>with</span>
                  </div>
                  <span className="block mt-2">experts can provide a different</span>
                  <span className="block mt-2">experience</span>
                </h3>
              </div>
              <p className="text-base text-[#7B7B7B] mb-8 leading-relaxed">
                Our AI connects you with the right legal expert for your case.<br />
                We categorize queries properly so that users can easily find<br />
                the perfect match.
              </p>
              <button className="border border-[#BBBBBB] text-[#292929] px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                Learn More
              </button>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-center gap-20">
            <div className="flex-1">
              <div className="mb-6">
                <span className="text-3xl text-[#1A6EFF] font-medium">/ 03</span>
              </div>
              <div className="mb-6">
                <h3 className="text-[#545454] text-3xl">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#1A6EFF] text-white px-3 py-1 rounded-lg">
                      connecting with lawyers
                    </span>
                    <span>can</span>
                  </div>
                  <span className="block mt-2">now be done by looking at the</span>
                  <span className="block mt-2">actual availability</span>
                </h3>
              </div>
              <p className="text-base text-[#7B7B7B] mb-8 leading-relaxed">
                Start chatting or schedule a call with your matched lawyer.<br />
                Connect directly and get the legal guidance you need when<br />
                you need it.
              </p>
              <button className="border border-[#BBBBBB] text-[#292929] px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                Learn More
              </button>
            </div>

            <div className="relative flex-1">
              <div className="bg-[#B9DEFF] rounded-[18px] shadow-lg h-[296px] relative p-4">
                <div className="bg-white shadow-lg rounded-[18px] h-full relative overflow-hidden">
                  {/* Top Icon */}
                  <div className="absolute top-6 left-6 bg-[#1A6EFF] p-2 rounded-lg">
                    <Phone className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  
                  {/* Top Right Logo */}
                  <div className="absolute top-6 right-6 flex items-center gap-2">
                    <img src="/ally_logo.svg" alt="ALLY" className="w-[70px]" />
                  </div>
                  
                  {/* Mock Content Lines */}
                  <div className="absolute space-y-2 top-24 left-6 right-6">
                    <div className="bg-[#BBBBBB] h-2 rounded w-3/4"></div>
                    <div className="bg-[#BBBBBB] h-2 rounded w-1/2"></div>
                  </div>
                  
                  {/* Blue Button */}
                  <div className="absolute bottom-20 left-6 right-6">
                    <div className="bg-[#E8EEFC] text-[#1A6EFF] px-3 py-2 rounded text-sm font-medium text-center mb-3 border border-[#1A6EFF]">
                      Secure Chat
                    </div>
                  </div>
                  
                  {/* Get Started Button */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-[#1A6EFF] text-white px-6 py-2 rounded text-sm font-medium text-center">
                      Get Started
                    </div>
                  </div>
                </div>
              </div>
              {/* Step Number */}
              <div className="absolute -bottom-6 right-8 bg-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-2 border-[#1A6EFF] text-[#1A6EFF] text-2xl font-semibold">
                03
              </div>
            </div>
          </div>
        </div>
      </section>      {/* Mobile App Section */}
      <section className="pt-4 pb-20">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="bg-[#F7FBFF] border border-[#BBBBBB] rounded-xl p-8 text-center shadow-lg shadow-[rgba(26,110,255,0.25)]">
            <h3 className="text-3xl text-[#07284A] font-normal mb-8">
              Legal Support at Your Fingertips
            </h3>
            <p className="text-lg text-[#545454] mb-8 leading-relaxed">
              With our mobile app, exploring legal advice is easy and private. Ask questions anonymously, get<br />
              the guidance you need, and when you're ready to take the next step, you can register on our<br />
              website to connect with a lawyer.
            </p>
            <button className="bg-[#1A6EFF] text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors">
              Get the App
            </button>
          </div>
        </div>
      </section>      {/* Statistics Section */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-32">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-semibold text-[#07284A] mb-6">
              Trusted by Legal Professionals & Clients
            </h2>
            <p className="text-xl text-[#545454]">
              Join thousands who have found reliable legal help through our secure platform
            </p>
          </div>
          
          <div className="grid grid-cols-4 gap-0 mb-16">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="relative w-[75px] h-[75px] rounded-full bg-[#1A6EFF] flex items-center justify-center">
                      <div className="absolute flex items-center justify-center w-10 h-10 transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                        <IconComponent className="w-6 h-6 text-white" strokeWidth={2} />
                      </div>
                    </div>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-black">{stat.number}</h3>
                  <h4 className="mb-2 text-xs font-medium text-black">{stat.title}</h4>
                  <p className="text-xs text-black">{stat.description}</p>
                </div>
              );
            })}
          </div>

          {/* Satisfaction Guarantee */}
          <div className="bg-[#EDFFF7] p-8 rounded-lg text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12">
                <CheckCircle className="w-8 h-8 text-[#00C06F]" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-semibold text-[#003722]">
                100% Satisfaction Guarantee
              </h3>
            </div>
            <p className="text-base text-[#545454] leading-relaxed">
              We stand behind our service. If you're not completely satisfied with your legal consultation,<br />
              we'll work to make it right or provide a full refund.
            </p>
          </div>
        </div>
      </section>      {/* Testimonials Section */}
      <section className="py-20 bg-[#2553A7]">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-5xl font-semibold text-white">What Our Clients Say</h2>
            <p className="text-lg text-[#B9DFFE]">
              Hear from real clients who have experienced the power of AI-enhanced legal services
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-[48px] p-8 relative shadow-lg" style={{
                borderTopRightRadius: '48px',
                borderBottomLeftRadius: '48px',
                borderTopLeftRadius: index === 0 ? '48px' : '0px',
                borderBottomRightRadius: index === 0 ? '0px' : '48px',
              }}>
                <div className="flex gap-6 items-start">
                  {/* Profile Image */}
                  <img 
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />

                  {/* Content */}
                  <div className="flex-1">
                    {/* Name and Role */}
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="text-lg font-semibold text-[#11265A]">{testimonial.name}</h4>
                      <span className="text-[#545454]">/</span>
                      <span className="text-sm text-[#545454]">{testimonial.role}</span>
                    </div>

                    {/* Testimonial Text */}
                    <p className="text-[#545454] text-sm leading-relaxed pr-8">
                      {testimonial.quote}
                    </p>
                  </div>

                  {/* Quote Mark */}
                  <div className="absolute top-4 right-6">
                    <Quote className="w-16 h-16 text-[#1A6EFF] opacity-50" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
    </>
  );
};

export default LandingPage;

