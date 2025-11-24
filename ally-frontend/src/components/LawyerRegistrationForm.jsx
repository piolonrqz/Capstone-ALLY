import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from '../firebase/config';
import { Eye, EyeOff } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function LawyerRegistrationForm() {
  const [step, setStep] = useState(1); // Start with step 1 for proper form flow
  const [isSubmitting, setIsSubmitting] = useState(false);
  const oemail = localStorage.getItem("email");
  const fname = localStorage.getItem("fName");
  const lname = localStorage.getItem("lName");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  console.log("Initial email from search params:", oemail);
  console.log("Initial first name from search params:", fname);
  console.log("Initial last name from search params:", lname);
  const [formData, setFormData] = useState({
    firstName: fname || "",
    lastName: lname || "",
    email: oemail || "",
    password: "",
    confirmPassword: "",
    profile_photo: null,
    phoneNumber: "",
    address: "",
    city: "",
    province: "",
    zipCode: "",
    prcNumber: "",
    practiceAreas: {
      familyLaw: false,
      realEstate: false,
      personalInjury: false,
      immigration: false,
      criminalDefense: false,
      businessLaw: false,
      estatePlanning: false,
      employmentLaw: false
    },
    otherPracticeArea: "",
    yearsOfExperience: "",
    educationInstitution: "",
    professionalBio: "",
    credentials: null,
    agreeToTerms: false
  });
  const [selectedPracticeAreas, setSelectedPracticeAreas] = useState([]);
  const [practiceAreaInput, setPracticeAreaInput] = useState("");
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested objects (like practiceAreas.familyLaw)
      const [objectName, property] = name.split('.');
      setFormData({
        ...formData,
        [objectName]: {
          ...formData[objectName],
          [property]: checked
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value
      });
    }
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    // Remove all non-numeric characters
    const numbersOnly = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limitedNumbers = numbersOnly.slice(0, 10);
    
    // Format with spaces for display: 917 123 4567
    let formatted = limitedNumbers;
    if (limitedNumbers.length > 3) {
      formatted = limitedNumbers.slice(0, 3) + ' ' + limitedNumbers.slice(3);
    }
    if (limitedNumbers.length > 6) {
      formatted = limitedNumbers.slice(0, 3) + ' ' + limitedNumbers.slice(3, 6) + ' ' + limitedNumbers.slice(6);
    }
    
    setFormData({
      ...formData,
      phoneNumber: formatted
    });
    
    // Clear error if exists
    if (errors.phoneNumber) {
      setErrors({
        ...errors,
        phoneNumber: ""
      });
    }
  };

  const handlePracticeAreaInputChange = (e) => {
    setPracticeAreaInput(e.target.value);
  };

  const handleAddPracticeArea = (area) => {
    const trimmedArea = area.trim();
    if (trimmedArea && !selectedPracticeAreas.includes(trimmedArea)) {
      setSelectedPracticeAreas([...selectedPracticeAreas, trimmedArea]);
      setPracticeAreaInput("");
      // Clear error if exists
      if (errors.practiceAreas) {
        setErrors({
          ...errors,
          practiceAreas: ""
        });
      }
    }
  };

  const handleRemovePracticeArea = (areaToRemove) => {
    setSelectedPracticeAreas(selectedPracticeAreas.filter(area => area !== areaToRemove));
  };

  const handlePracticeAreaKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddPracticeArea(practiceAreaInput);
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else {
      const numbersOnly = formData.phoneNumber.replace(/\D/g, '');
      if (numbersOnly.length !== 10) {
        newErrors.phoneNumber = "Phone number must be 10 digits";
      } else if (!numbersOnly.startsWith('9')) {
        newErrors.phoneNumber = "Phone number must start with 9";
      }
    }
    
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.province.trim()) newErrors.province = "Province is required";
    if (!formData.zipCode.trim()) newErrors.zipCode = "ZIP code is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    // Disabled: if (!formData.prcNumber.trim()) newErrors.prcNumber = "Bar Number is required";
    if (selectedPracticeAreas.length === 0) newErrors.practiceAreas = "At least one practice area is required";
    if (!formData.educationInstitution.trim()) newErrors.educationInstitution = "Education institution is required";
    if (!formData.yearsOfExperience.trim()) newErrors.yearsOfExperience = "Years of experience is required";
    if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to the terms";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };  
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep3()) {
      setIsSubmitting(true);
      try {
        const body = new FormData();
        body.append("email", formData.email);
        body.append("password", formData.password);
        body.append("Fname", formData.firstName);
        body.append("Lname", formData.lastName);
        // Format phone number for database: +639171234567 (no spaces)
        const phoneNumberForDB = "+63" + formData.phoneNumber.replace(/\D/g, '');
        body.append("phoneNumber", phoneNumberForDB);
        body.append("address", formData.address);
        body.append("city", formData.city);
        body.append("province", formData.province);
        body.append("zip", formData.zipCode);
        body.append("barNumber", formData.prcNumber);
        body.append("experience", formData.yearsOfExperience);
        body.append("educationInstitution", formData.educationInstitution);
        if (formData.profile_photo) {
          body.append("profilePhoto", formData.profile_photo);
          console.log("Profile photo added to FormData:", formData.profile_photo);
        } else {
          console.log("No profile photo to add");
        }
          
        // Send selected practice areas
        selectedPracticeAreas.forEach(area => {
          body.append("specialization", area);
        });
        body.append("credentials", formData.credentials);
        console.log("Submitting form with:", body);
        
        const response = await fetch("http://localhost:8080/users/Lawyer", {
          method: "POST",
          body: body
        });

        if (response.ok) {
          navigate('/signup/verifyLawyer', { state: { email: formData.email } });
        } else {
          // Try to get error message from backend
          const errorData = await response.json().catch(() => ({}));
          if (
            response.status === 409 ||
            (errorData && errorData.message && errorData.message.toLowerCase().includes("email"))
          ) {
            toast.error("Email already exists.", { duration: 3000 });
            setTimeout(() => {
              navigate('/signup');
            }, 3000);
          } else {
            toast.error(errorData.message || "Registration failed. Please try again.", { duration: 3000 });
          }
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error('Registration failed. Please try again.', { duration: 3000 });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen font-['Poppins'] relative p-4">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div onClick={() => navigate('/')} className="cursor-pointer">
              <img src="/ally_logo.svg" alt="ALLY" className="w-28 h-10" />
            </div>
          </div>
        </div>
      </nav>

      <div className={`w-full p-6 mt-24 bg-white border rounded-lg shadow-lg sm:p-8 md:p-10 ${
        step === 3 
          ? 'max-w-4xl' 
          : step === 2 
            ? 'max-w-[900px]' 
            : 'max-w-4xl'
      } mx-auto`}>
        <h2 className="mb-2 text-2xl sm:text-3xl md:text-4xl font-semibold text-center text-[#11265A] font-['Poppins']">Register as a <span className="text-blue-600">Lawyer</span></h2>
        <p className="mb-6 sm:mb-8 text-sm sm:text-base text-center text-gray-450 font-['Poppins']">Create your professional account to connect with clients</p>
        
        {/* Progress Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-blue-500 rounded-full" 
              style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}
            ></div>
          </div>          <div className="flex justify-between mt-1">
            <span className={`text-[10px] sm:text-xs font-medium ${step >= 1 ? 'text-blue-500' : 'text-gray-400'}`}>Account</span>
            <span className={`text-[10px] sm:text-xs font-medium ${step >= 2 ? 'text-blue-500' : 'text-gray-400'}`}>Personal</span>
            <span className={`text-[10px] sm:text-xs font-medium ${step >= 3 ? 'text-blue-500' : 'text-gray-400'}`}>Professional</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 ? (
            /* Step 1: Basic Information */
            <div className="space-y-6">
              {/* Profile Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 text-start mb-2">Profile Photo</label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="relative flex-shrink-0 w-20 h-20">
                    {formData.profile_photo ? (
                      <img 
                        src={URL.createObjectURL(formData.profile_photo)} 
                        alt="Profile" 
                        className="object-cover w-full h-full rounded-full"
                      />
                    ) : (
                      <img 
                        src="/add_profile.png" 
                        alt="Add Profile" 
                        className="w-full h-full"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="inline-block px-4 py-2 text-sm text-white bg-blue-500 rounded-lg cursor-pointer hover:bg-blue-600">
                      Upload Photo
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/gif"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file && file.size <= 5 * 1024 * 1024) { // 5MB limit
                            setFormData({
                              ...formData,
                              profile_photo: file
                            });
                          } else {
                            toast.error("File size should not exceed 5MB", { duration: 3000 });
                          }
                        }}
                      />
                    </label>
                    <p className="text-xs text-gray-500">JPEG, PNG or GIF, max 5MB</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-1/2">
                  <label htmlFor="firstName" className="block mb-1 text-sm font-medium text-gray-700 text-start">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    placeholder="Enter your first name"
                    className={`w-full p-3 border rounded-lg ${errors.firstName ? 'border-red-500' : 'border-neutral-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
                </div>
                <div className="w-1/2">
                  <label htmlFor="lastName" className="block mb-1 text-sm font-medium text-gray-700 text-start">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    placeholder="Enter your last name"
                    className={`w-full p-3 border rounded-lg ${errors.lastName ? 'border-red-500' : 'border-neutral-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                  {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700 text-start">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="your.email@example.com"
                  className={`w-full p-2.5 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
              
              <div>
                <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700 text-start">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    className={`w-full p-2.5 pr-10 border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeOff className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                <p className="mt-1 text-xs text-gray-400 text-start">Password must be at least 6 characters long</p>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block mb-1 text-sm font-medium text-gray-700 text-start">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    className={`w-full p-2.5 pr-10 border rounded-md ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeOff className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                  onClick={handleContinue}
                >
                  Continue →
                </button>
              </div>
            </div>
          ) : step === 2 ? (
            /* Step 2: Personal Details */
            <div className="space-y-4">
              <div>
                <label htmlFor="phoneNumber" className="block py-2 mb-1 text-sm font-medium text-gray-700 text-start">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute text-gray-500 transform -translate-y-1/2 left-3 top-1/2">+63</span>
                  <input
                    id="phoneNumber"
                    type="tel"
                    name="phoneNumber"
                    placeholder="917 123 4567"
                    className={`w-full p-2.5 pl-11 border rounded-md ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    value={formData.phoneNumber}
                    onChange={handlePhoneChange}
                  />
                </div>
                {errors.phoneNumber && <p className="mt-1 text-xs text-red-500">{errors.phoneNumber}</p>}
                <p className="mt-1 text-xs text-gray-400 text-start">Enter 10-digit mobile number starting with 9</p>
              </div>
              
              <div>
                <label htmlFor="address" className="block mb-1 text-sm font-medium text-gray-700 text-start">
                  Address
                </label>
                <input
                  id="address"
                  type="text"
                  name="address"
                  placeholder="Enter your street address"
                  className={`w-full p-2.5 border rounded-md ${errors.address ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={formData.address}
                  onChange={handleChange}
                />
                {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
              </div>
              
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label htmlFor="city" className="block mb-1 text-sm font-medium text-gray-700 text-start">
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    placeholder="Enter your city"
                    className={`w-full p-2.5 border rounded-md ${errors.city ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    value={formData.city}
                    onChange={handleChange}
                  />
                  {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
                </div>
                <div className="w-1/2">
                  <label htmlFor="province" className="block mb-1 text-sm font-medium text-gray-700 text-start">
                    Province
                  </label>
                  <input
                    id="province"
                    type="text"
                    name="province"
                    placeholder="Enter your province"
                    className={`w-full p-2.5 border rounded-md ${errors.province ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    value={formData.province}
                    onChange={handleChange}
                  />
                  {errors.province && <p className="mt-1 text-xs text-red-500">{errors.province}</p>}
                </div>
              </div>
                
              <div>
                <label htmlFor="zipCode" className="block mb-1 text-sm font-medium text-gray-700 text-start">
                  Zip Code
                </label>
                <input
                  id="zipCode"
                  type="text"
                  name="zipCode"
                  placeholder="Enter your zip code"
                  className={`w-full p-2.5 border rounded-md ${errors.zipCode ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={formData.zipCode}
                  onChange={handleChange}
                />
                {errors.zipCode && <p className="mt-1 text-xs text-red-500">{errors.zipCode}</p>}
              </div>
                <div className="flex flex-col justify-between gap-4 mt-6 sm:flex-row">
                <button
                  type="button"
                  className="order-2 w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg sm:w-auto bg-gray-50 sm:order-1"
                  onClick={handleBack}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  className="order-1 w-full px-4 py-2 text-white bg-blue-500 rounded-lg sm:w-auto sm:order-2"
                  onClick={handleContinue}
                >
                  Continue →
                </button>
              </div>
            </div>
          ) : (
            /* Step 3: Professional Information - Matches the image design */
            <div className="space-y-4">
              {/* Disabled Bar Number field */}
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 text-start">Bar Number</label>
                <input
                  type="text"
                  name="prcNumber"
                  placeholder="e.g., 123456"
                  className={`w-full p-2 border rounded ${errors.prcNumber ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.prcNumber}
                  onChange={handleChange}
                />
                {errors.prcNumber && <p className="mt-1 text-xs text-red-500">{errors.prcNumber}</p>}
              </div>
             
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 text-start">Practice Areas</label>
                
                {/* Display selected practice areas as chips */}
                {selectedPracticeAreas.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 mb-2 border border-gray-300 rounded bg-gray-50">
                    {selectedPracticeAreas.map((area, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 text-sm text-blue-700 bg-blue-100 border border-blue-300 rounded-full"
                      >
                        {area}
                        <button
                          type="button"
                          onClick={() => handleRemovePracticeArea(area)}
                          className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Input field with datalist for suggestions */}
                <div className="relative">
                  <input
                    type="text"
                    list="practiceAreaOptions"
                    placeholder="Type or select a practice area and press Enter"
                    className={`w-full p-2 border rounded ${errors.practiceAreas ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    value={practiceAreaInput}
                    onChange={handlePracticeAreaInputChange}
                    onKeyDown={handlePracticeAreaKeyDown}
                  />
                  <datalist id="practiceAreaOptions">
                    <option value="Criminal Law" />
                    <option value="Civil Law" />
                    <option value="Family Law" />
                    <option value="Corporate & Business Law" />
                    <option value="Labor & Employment Law" />
                    <option value="Property & Real Estate Law" />
                    <option value="Immigration Law" />
                    <option value="Taxation Law" />
                    <option value="Intellectual Property Law" />
                    <option value="Estate Planning & Succession" />
                    <option value="Environmental & Energy Law" />
                    <option value="Litigation & Dispute Resolution" />
                  </datalist>
                  <button
                    type="button"
                    onClick={() => handleAddPracticeArea(practiceAreaInput)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>
                {errors.practiceAreas && <p className="mt-1 text-xs text-red-500">{errors.practiceAreas}</p>}
                <p className="mt-1 text-xs text-gray-400 text-start">Select from suggestions or type your own specialty areas</p>
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 text-start">Years of Experience</label>
                <input
                  type="number"
                  name="yearsOfExperience"
                  placeholder="e.g., 5"
                  className={`w-full p-2 border rounded ${errors.yearsOfExperience ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                />
                {errors.yearsOfExperience && <p className="mt-1 text-xs text-red-500">{errors.yearsOfExperience}</p>}
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 text-start">Credentials & Certifications</label>
                <div className="p-6 text-center border border-gray-300 border-dashed rounded">
                  <div className="flex justify-center mb-4">
                    <svg className="w-12 h-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                  </div>
                  <p className="mb-2 text-gray-600">Drag and drop files here or</p>
                  <label className="px-4 py-2 text-white bg-blue-500 rounded cursor-pointer hover:bg-blue-600">
                    Browse Files
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          credentials: e.target.files[0]
                        });
                      }}
                    />
                  </label>
                  {formData.credentials && (
                    <p className="mt-2 text-xs text-gray-700">
                      Selected file: {formData.credentials.name}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">PDF, DOC, DOCX, JPG, JPEG, PNG (max 10MB each)</p>
                </div>
              </div>
              <div>
                <label htmlFor="educationInstitution" className="block py-2 mb-1 text-sm font-medium text-gray-700 text-start">
                  Education Institution
                </label>
                <input
                  id="educationInstitution"
                  type="text"
                  name="educationInstitution"
                  placeholder="e.g., University of the Philippines College of Law"
                  className={`w-full p-2.5 border rounded-md ${errors.educationInstitution ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={formData.educationInstitution}
                  onChange={handleChange}
                />
                {errors.educationInstitution && <p className="mt-1 text-xs text-red-500">{errors.educationInstitution}</p>}
              </div>
              
              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  className="w-4 h-4 text-blue-500 border-gray-300 rounded"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                />
                <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-600">
                  I agree to the <a href="#" className="text-blue-500">Terms of Service</a> and <a href="#" className="text-blue-500">Privacy Policy</a>
                </label>
              </div>
              {errors.agreeToTerms && <p className="text-xs text-red-500">{errors.agreeToTerms}</p>}
                <div className="flex flex-col justify-between gap-4 mt-6 sm:flex-row">
                <button
                  type="button"
                  className="order-2 w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg sm:w-auto sm:order-1"
                  onClick={handleBack}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="order-1 w-full px-6 py-2 text-white bg-blue-500 rounded-lg sm:w-auto hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-2 sm:order-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit'
                  )}
                </button>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="pt-6 mt-8 text-center border-t">
              <p className="text-sm text-gray-600">
                Already have an account? <a href="/login" className="text-blue-500">Login</a>
              </p>
            </div>
          )}
        </form>
      </div>
      <Toaster position="top-center" richColors />
    </div>
  );
}