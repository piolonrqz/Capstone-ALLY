import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, CheckCircle, Clock, Users, Award, Lock, Zap, Quote, Star } from 'lucide-react';
import Footer from '../components/Footer';

const LandingPage = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");
  const isLawyer =  localStorage.getItem("role")  ;



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
    <div className="flex flex-col min-h-screen bg-white">

      {/* Hero Section */}
      <section className="bg-[#F7FBFF] px-8 py-20 min-h-[900px] flex items-center">
        <div className="max-w-[1440px] mx-auto w-full">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main Heading */}
            <h1 className="mb-6 text-6xl font-bold leading-tight text-black">
              Find Legal Help,<br />
              Anonymously & Securely
            </h1>
            
            {/* Subheading */}
            <p className="text-3xl text-[#7C7C7C] mb-12 leading-relaxed">
              Connect with verified legal professionals instantly. Get the help you<br />
              need without compromising your privacy or breaking your budget.
            </p>

            {/* Consult with ALLY & Get Legal Help Now Buttons */}
            <div className="flex items-center justify-between w-full max-w-2xl gap-6 mx-auto mb-12">
              <div className="flex flex-col items-start gap-2">
                <button
                  onClick={() => navigate('/consult')}
                  className="px-8 py-5 text-2xl font-normal text-white transition-colors rounded-lg shadow-lg bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
                >
                  Consult with ALLY
                </button>
              </div>
              {isLawyer !== "LAWYER" &&  (
                <button
                  onClick={() => navigate('/lawyers')}
                  className="bg-[#1A6EFF] text-white px-8 py-5 rounded-lg text-2xl font-normal hover:bg-blue-700 transition-colors"
                >
                  Get Legal Help Now
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
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-8">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <h2 className="text-6xl font-semibold text-[#07284A] mb-4">HOW IT WORKS</h2>
            <p className="text-2xl text-[#545454] font-normal">
              Getting legal help has never been easier. Follow these simple steps<br />
              to connect with expert Lawyers.
            </p>
          </div>

          {/* Step 1 */}
          <div className="flex items-center gap-20 mb-20">
            <div className="flex-1">
              <div className="mb-6">
                <span className="text-2xl text-[#1A6EFF] font-normal">/ 01</span>
              </div>
              <div className="mb-6">
                <div className="bg-[#1A6EFF] text-white p-3 rounded-lg inline-block">
                  <span className="text-3xl font-semibold">the ease of submitting</span>
                </div>
                <p className="text-3xl text-[#545454] mt-3">
                  queries can provide a different experience
                </p>
              </div>
              <p className="text-lg text-[#7B7B7B] mb-8 leading-relaxed">
                Describe your legal issue anonymously in just a few minutes.<br />
                our platform makes it easy for you to find the right legal help<br />
                quickly and securely.
              </p>
              <button className="border border-[#BBBBBB] text-[#292929] px-8 py-3 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors">
                Learn More
              </button>
            </div>              
            <div className="relative flex-1">
              <div className="bg-[#B9DEFF] rounded-[18px] shadow-lg h-[296px] relative p-4">
                <div className="bg-white shadow-lg rounded-[18px] h-full relative overflow-hidden">
                  {/* Top Icon */}
                  <div className="absolute top-6 left-6 bg-[#1A6EFF] p-2 rounded-lg">
                    <div className="flex items-center justify-center w-5 h-5">
                      <Shield className="w-5 h-5 text-white" strokeWidth={2} />
                    </div>
                  </div>
                  
                  {/* Top Right Logo */}
                  <img src="/ally_logo.svg" alt="ALLY" className="absolute top-6 right-6 w-12 h-4 text-[#1A6EFF]" />
                  
                  {/* Mock Content Lines */}
                  <div className="absolute space-y-2 top-16 left-6 right-6">
                    <div className="bg-[#BBBBBB] h-2 rounded w-3/4"></div>
                    <div className="bg-[#BBBBBB] h-2 rounded w-1/2"></div>
                  </div>
                  
                  {/* Blue Button */}
                  <div className="absolute top-32 left-6 right-6">
                    <div className="bg-[#E8EEFC] text-[#1A6EFF] px-3 py-3 rounded text-sm font-medium text-center mb-3 border border-[#1A6EFF]">
                      Legal Question Form
                    </div>
                  </div>
                  
                  {/* Get Started Button */}
                  <div className="absolute top-48 left-6 right-6">
                    <div className="bg-[#1A6EFF] text-white px-6 py-3 rounded text-sm font-medium text-center">
                      Get Started
                    </div>
                  </div>
                  
                  {/* Bottom Text */}
                  <p className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-[#545454]">
                    Anonymous & Secure
                  </p>
                </div>
              </div>
              {/* Step Number */}
              <div className="absolute -bottom-6 right-8 bg-[#B9DEFF] w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                <div className="flex items-center justify-center bg-white rounded-full w-11 h-11">
                  <span className="text-[#1A6EFF] font-normal text-base">01</span>
                </div>
              </div>
            </div>
          </div>          
          {/* Step 2 */}          <div className="flex items-center gap-20 mb-20">            <div className="relative flex-1">
              <div className="bg-[#B9DEFF] rounded-[18px] shadow-lg h-[296px] relative p-4">
                <div className="bg-white shadow-lg rounded-[18px] h-full relative overflow-hidden">
                  {/* Top Icon */}
                  <div className="absolute top-6 left-6 bg-[#1A6EFF] p-2 rounded-lg">
                    <div className="flex items-center justify-center w-5 h-5">
                      <Users className="w-5 h-5 text-white" strokeWidth={2} />
                    </div>
                  </div>
                  
                  {/* Top Right Logo */}
                  <img src="/ally_logo.svg" alt="ALLY" className="absolute top-6 right-6 w-12 h-4 text-[#1A6EFF]" />
                  
                  {/* Mock Content Lines */}
                  <div className="absolute space-y-2 top-16 left-6 right-6">
                    <div className="bg-[#BBBBBB] h-2 rounded w-3/4"></div>
                    <div className="bg-[#BBBBBB] h-2 rounded w-1/2"></div>
                  </div>
                  
                  {/* Blue Button */}
                  <div className="absolute top-32 left-6 right-6">
                    <div className="bg-[#E8EEFC] text-[#1A6EFF] px-3 py-3 rounded text-sm font-medium text-center mb-3 border border-[#1A6EFF]">
                      Expert Matching
                    </div>
                  </div>
                  
                  {/* Get Started Button */}
                  <div className="absolute top-48 left-6 right-6">
                    <div className="bg-[#1A6EFF] text-white px-6 py-3 rounded text-sm font-medium text-center">
                      Get Started
                    </div>
                  </div>
                  
                  {/* Bottom Text */}
                  <p className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-[#545454]">
                    AI-Powered Selection
                  </p>
                </div>
              </div>
              {/* Step Number */}
              <div className="absolute -bottom-6 right-8 bg-[#B9DEFF] w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                <div className="flex items-center justify-center bg-white rounded-full w-11 h-11">
                  <span className="text-[#1A6EFF] font-normal text-base">02</span>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="mb-6">
                <span className="text-2xl text-[#1A6EFF] font-normal">/ 02</span>
              </div>
              <div className="mb-6">
                <div className="bg-[#1A6EFF] text-white p-3 rounded-lg inline-block">
                  <span className="text-3xl font-semibold">the ease of matching</span>
                </div>
                <p className="text-3xl text-[#545454] mt-3">
                  with experts can provide a different experience
                </p>
              </div>
              <p className="text-lg text-[#7B7B7B] mb-8 leading-relaxed">
                Our AI connects you with the right legal expert for your case. We categorize queries properly so that users can easily find the perfect match.
              </p>
              <button className="border border-[#BBBBBB] text-[#292929] px-8 py-3 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors">
                Learn More
              </button>
            </div>
          </div>          {/* Step 3 */}
          <div className="flex items-center gap-20">
            <div className="flex-1">
              <div className="mb-6">
                <span className="text-2xl text-[#1A6EFF] font-normal">/ 03</span>
              </div>
              <div className="mb-6">
                <div className="bg-[#1A6EFF] text-white p-3 rounded-lg inline-block">
                  <span className="text-3xl font-semibold">connecting with lawyers</span>
                </div>
                <p className="text-3xl text-[#545454] mt-3">
                  can now be done by looking at the actual availability
                </p>
              </div>
              <p className="text-lg text-[#7B7B7B] mb-8 leading-relaxed">
                Start chatting or schedule a call with your matched lawyer. Connect directly and get the legal guidance you need when you need it.
              </p>
              <button className="border border-[#BBBBBB] text-[#292929] px-8 py-3 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors">
                Learn More
              </button>
            </div>            <div className="relative flex-1">
              <div className="bg-[#B9DEFF] rounded-[18px] shadow-lg h-[296px] relative p-4">
                <div className="bg-white shadow-lg rounded-[18px] h-full relative overflow-hidden">
                  {/* Top Icon */}
                  <div className="absolute top-6 left-6 bg-[#1A6EFF] p-2 rounded-lg">
                    <div className="flex items-center justify-center w-5 h-5">
                      <Clock className="w-5 h-5 text-white" strokeWidth={2} />
                    </div>
                  </div>
                  
                  {/* Top Right Logo */}
                  <img src="/ally_logo.svg" alt="ALLY" className="absolute top-6 right-6 w-12 h-4 text-[#1A6EFF]" />
                  
                  {/* Mock Content Lines */}
                  <div className="absolute space-y-2 top-16 left-6 right-6">
                    <div className="bg-[#BBBBBB] h-2 rounded w-3/4"></div>
                    <div className="bg-[#BBBBBB] h-2 rounded w-1/2"></div>
                  </div>
                  
                  {/* Blue Button */}
                  <div className="absolute top-32 left-6 right-6">
                    <div className="bg-[#E8EEFC] text-[#1A6EFF] px-3 py-3 rounded text-sm font-medium text-center mb-3 border border-[#1A6EFF]">
                      Secure Chat
                    </div>
                  </div>
                  
                  {/* Get Started Button */}
                  <div className="absolute top-48 left-6 right-6">
                    <div className="bg-[#1A6EFF] text-white px-6 py-3 rounded text-sm font-medium text-center">
                      Get Started
                    </div>
                  </div>
                  
                  {/* Bottom Text */}
                  <p className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-[#545454]">
                    Direct Communication
                  </p>
                </div>
              </div>
              {/* Step Number */}
              <div className="absolute -bottom-6 right-8 bg-[#B9DEFF] w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                <div className="flex items-center justify-center bg-white rounded-full w-11 h-11">
                  <span className="text-[#1A6EFF] font-normal text-base">03</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>      {/* Mobile App Section */}
      <section className="py-20">
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
              <div className="flex items-center justify-center w-15 h-15">
                <CheckCircle className="w-10 h-10 text-[#00C06F]" strokeWidth={2.5} />
              </div>
              <h3 className="text-4xl font-semibold text-[#003722]">
                100% Satisfaction Guarantee
              </h3>
            </div>
            <p className="text-xl text-[#545454] leading-relaxed">
              We stand behind our service. If you're not completely satisfied with your legal consultation,<br />
              we'll work to make it right or provide a full refund.
            </p>
          </div>
        </div>
      </section>      {/* Testimonials Section */}
      <section className="py-20 bg-[#2553A7]">
        <div className="max-w-[1200px] mx-auto px-32">
          <div className="mb-16 text-center">
            <h2 className="mb-8 text-6xl font-semibold text-white">What Our Clients Say</h2>
            <p className="text-xl text-[#B9DFFE]">
              Hear from real clients who have experienced the power of AI-enhanced legal services
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-0">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-0 bg-white shadow-2xl" style={{
                borderRadius: '0px 200px 0px 200px'
              }}>
                <div className="p-8 h-[227px] relative">
                  {/* Quote Icon */}
                  <div className="absolute w-16 h-16 top-32 right-8">
                    <Quote className="w-8 h-8 text-[#1A6EFF]" strokeWidth={2} />
                  </div>
                  
                  {/* Profile Image */}
                  <div 
                    className="absolute top-0 left-0 w-[183px] h-[183px] bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${testimonial.image})`,
                      borderRadius: '0px 100px 0px 100px'
                    }}
                  ></div>
                  
                  {/* Name and Role */}
                  <div className="absolute top-8 left-48 flex items-center gap-1.5 px-4 py-4">
                    <span className="text-xl font-semibold text-black">{testimonial.name}</span>
                    <span className="text-base text-[#545454]">/</span>
                    <span className="text-xs text-[#545454]">{testimonial.role}</span>
                  </div>
                  
                  {/* Testimonial Text */}
                  <div className="absolute top-20 left-48 right-16 bottom-8">
                    <p className="text-xs text-[#545454] leading-relaxed overflow-hidden">
                      "{testimonial.quote}"
                    </p>
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
  );
};

export default LandingPage;
