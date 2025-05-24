import React from "react";
import { useNavigate, Link } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  const steps = [
    {
      number: "1.",
      title: "Describe Your Need",
      description:
        "Tell us about your legal issue and what type of assistance you're looking for.",
      icon: "/search.png",
    },
    {
      number: "2.",
      title: "Match with Experts",
      description:
        "We'll connect you with qualified legal professionals who specialize in your specific needs.",
      icon: "/match.png",
    },
    {
      number: "3.",
      title: "Collaborate Securely",
      description:
        "Communicate, share documents, and work together in our secure platform.",
      icon: "/collab.png",
    },
  ];
  const companies = [
    { name: "LegalCorp", icon: "/legal_corp.png" },
    { name: "JusticeFirm", icon: "/justice_firm.png" },
    { name: "LawWorks", icon: "/law.png" },
    { name: "EthicsLaw", icon: "/timbangan.png" },
    { name: "JusticeAid", icon: "/hammer.png" },
  ];
  return (
    <div className="bg-white min-h-screen flex flex-col">


      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm w-full h-16 px-32 fixed top-0 left-0 right-0 z-[100] shadow-sm">
        <div className="w-full h-full flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="flex items-center justify-center">
              <img src="/small_logo.png" alt="Logo" className="w-10 h-10" />
            </div>
            <span className="text-2xl font-bold text-blue-500">ALLY</span>
          </div>
          <button
            onClick={() => navigate('/signup')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors font-medium text-base"
          >
            Sign Up Free
          </button>
        </div>
      </header>
      {/* Hero Section */}
        <section
          className="top-0 left-0 right-0 w-full h-[55.5svh] flex items-center justify-center overflow-hidden z-[10] bg-[url('/justice.png')] bg-cover bg-center mt-[64px]"
        >
          {/* <div className="absolute inset-0 bg-white/0 backdrop-blur-sm"></div> Optional overlay for readability */}
          <div className="relative z-10 w-full py-8 max-w-[1560px] mx-auto">
            <div className="flex flex-col items-start gap-8 max-w-2xl">
              <div className="w-50%">
                <h1 className="text-4xl md:text-4xl font-bold text-gray-900 leading-tight mb-7xl">
                  Connect with Expert Legal
                </h1>
                <h1 className="text-4xl md:text-4xl font-bold text-gray-900 leading-tight mb-7xl">
                  Help When You Need It Most
                </h1>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  ALLY bridges the gap between clients seeking legal assistance
                  and qualified professionals ready to help. Simplified legal
                  solutions for everyone.
                </p>                <div className="flex flex-wrap gap-4 mb-2">
                  <button 
                    onClick={() => navigate('/signup/client')} 
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors font-semibold shadow-lg text-base">
                    Find Legal Help Now
                  </button>
                  <button 
                    onClick={() => navigate('/signup/lawyer')} 
                    className="bg-white text-blue-600 px-6 py-2 rounded-lg border hover:bg-blue-50 transition-colors font-md text-base">
                    Join as a Lawyer
                  </button>
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex -space-x-3">
                    <img src="/user1.png" alt="User 1" className="w-8 h-8 rounded-full border-2 border-white relative z-30" />
                    <img src="/user2.png" alt="User 2" className="w-8 h-8 rounded-full border-2 border-white relative z-20" />
                    <img src="/user3.png" alt="User 3" className="w-8 h-8 rounded-full border-2 border-white relative z-10" />
                  </div>
                  <span className="text-gray-100 font-medium text-sm">
                    10,000+ clients helped this month
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>


      {/* Trusted Companies */}
      <section className="min-h-[20svh] flex items-center bg-white w-full">
        <div className="w-full px-6 max-w-[1440px] mx-auto">
          <p className="text-center text-gray-500 mb-6 text-base">
            Trusted by leading organizations
          </p>
          <div className="flex justify-center items-center gap-32 flex-wrap">
            {companies.map((company, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-slate-500 hover:text-gray-700 transition-colors"
              >                <img src={company.icon} alt={company.name} className="w-8 h-8 object-contain" />
                <span className="font-semibold text-base">{company.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How ALLY Works */}
      <section className="w-full bg-gray-50">
        <div className="w-full px-6 py-20 max-w-[1440px] mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-600 mb-3">
              How ALLY WORKS
            </h2>
            <p className="text-base text-gray-600">
              Our platform makes finding and connecting with legal help simple
              and efficient
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="text-center p-6"
              >                <div className="mb-10">
                  <div className="flex items-center justify-center mx-auto mb-6">
                    <img src={step.icon} alt={step.title} className="w-16 h-16 object-contain" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-600">
                  {step.number} {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-md">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
