import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ClientRegistrationForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
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
    fName: fname || "",
    lName: lname || "",
    email: oemail || "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    address: "",
    city: "",
    province: "",
    zip: "",
    agreeToTerms: false,
    profilePhoto: null
  });
  const [errors, setErrors] = useState({});
  const [isHoveringPhoto, setIsHoveringPhoto] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
    
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

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.fName.trim()) newErrors.fName = "First name is required";
    if (!formData.lName.trim()) newErrors.lName = "Last name is required";
    
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
    if (!formData.zip.trim()) newErrors.zip = "ZIP code is required";
    if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to the terms";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleRemoveProfilePhoto = () => {
    setFormData({
      ...formData,
      profilePhoto: null
    });
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
    
    toast.success('Profile photo removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep2()) {
      setIsSubmitting(true);
      try {
        const body = new FormData();
        body.append("email", formData.email);
        body.append("password", formData.password);
        body.append("Fname", formData.fName);
        body.append("Lname", formData.lName);          
        // Format phone number for database: +639171234567 (no spaces)
        const phoneNumberForDB = "+63" + formData.phoneNumber.replace(/\D/g, '');
        body.append("phoneNumber", phoneNumberForDB);
        body.append("address", formData.address);
        body.append("city", formData.city);
        body.append("province", formData.province);
        body.append("zip", formData.zip);          
        if (formData.profilePhoto) {
          body.append("profilePhoto", formData.profilePhoto);
          console.log("Profile photo added to FormData:", formData.profilePhoto);
        } else {
          console.log("No profile photo to add");
        }
        console.log("Submitting form with:", body);
        
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/Client`, {
          method: "POST",
          body: body
        });

        if (response.ok) {
          navigate('/signup/verifyClient', { state: { email: formData.email } });
        } else {
          // Try to get error message from backend
          const errorData = await response.json().catch(() => ({}));
          if (
            response.status === 409 ||
            (errorData && errorData.message && errorData.message.toLowerCase().includes("email"))
          ) {
            toast.error("Email already exists.");
            navigate('/signup');
          } else {
            toast.error(errorData.message || "Registration failed. Please try again.");
          }
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error('Registration failed. Please try again.');
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

      <div className="w-full max-w-4xl p-6 mt-24 bg-white border rounded-lg shadow-lg sm:p-8 md:p-10">
        <h2 className="mb-2 text-2xl sm:text-3xl md:text-4xl font-semibold text-center text-[#11265A] font-['Poppins']">Register as a <span className="text-blue-600">Client</span></h2>
        <p className="mb-6 sm:mb-8 text-sm sm:text-base text-center text-gray-450 font-['Poppins']">Create your account to find legal help</p>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full h-1 bg-gray-200 rounded">
            <div 
              className="h-1 bg-blue-500 rounded" 
              style={{ width: step === 1 ? '50%' : '100%' }}
            ></div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs font-medium text-blue-500">Account Information</span>
            <span className={`text-xs font-medium ${step === 2 ? 'text-blue-500' : 'text-gray-400'}`}>
              Personal Details
            </span>
          </div>
        </div>

        <form>
          {step === 1 ? (
            /* Step 1: Basic Information */
            <div className="space-y-4">
              {/* Profile Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 text-start mb-2">Profile Photo</label>
                <div className="flex items-center gap-4 mt-2">
                  <div 
                    className="relative flex-shrink-0 w-20 h-20 cursor-pointer"
                    onMouseEnter={() => setIsHoveringPhoto(true)}
                    onMouseLeave={() => setIsHoveringPhoto(false)}
                  >
                    {formData.profilePhoto ? (
                      <>
                        <img 
                          src={URL.createObjectURL(formData.profilePhoto)} 
                          alt="Profile" 
                          className="object-cover w-full h-full rounded-full"
                        />
                        {/* Hover overlay with remove button */}
                        {isHoveringPhoto && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full transition-opacity">
                            <button
                              type="button"
                              onClick={handleRemoveProfilePhoto}
                              className="p-2 text-white hover:text-red-400 transition-colors"
                              title="Remove photo"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </>
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
                              profilePhoto: file
                            });
                          } else {
                            toast.error("File size should not exceed 5MB");
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
                  <label htmlFor="fName" className="block mb-1 text-sm font-medium text-gray-700 text-start">
                    First Name
                  </label>
                  <input
                    id="fName"
                    type="text"
                    name="fName"
                    placeholder="Enter your first name"
                    className={`w-full p-3 border rounded-lg ${errors.fName ? 'border-red-500' : 'border-neutral-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                    value={formData.fName}
                    onChange={handleChange}
                  />
                  {errors.fName && <p className="mt-1 text-xs text-red-500">{errors.fName}</p>}
                </div>
                <div className="w-1/2">
                  <label htmlFor="lName" className="block mb-1 text-sm font-medium text-gray-700 text-start">
                    Last Name
                  </label>
                  <input
                    id="lName"
                    type="text"
                    name="lName"
                    placeholder="Enter your last name"
                    className={`w-full p-3 border rounded-lg ${errors.lName ? 'border-red-500' : 'border-neutral-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                    value={formData.lName}
                    onChange={handleChange}
                  />
                  {errors.lName && <p className="mt-1 text-xs text-red-500">{errors.lName}</p>}
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
                  className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                  onClick={handleContinue}
                >
                  Continue →
                </button>
              </div>
            </div>
          ) : (
            /* Step 2: Additional Details */
            <div className="space-y-4">
              <div>
                <label htmlFor="phoneNumber" className="block mb-1 text-sm font-medium text-gray-700 text-start">
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
                <label htmlFor="zip" className="block mb-1 text-sm font-medium text-gray-700 text-start">
                  Zip Code
                </label>
                <input
                  id="zip"
                  type="text"
                  name="zip"
                  placeholder="Enter your zip code"
                  className={`w-full p-2.5 border rounded-md ${errors.zip ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={formData.zip}
                  onChange={handleChange}
                />
                {errors.zip && <p className="mt-1 text-xs text-red-500">{errors.zip}</p>}
              </div>
              
              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  id="terms"
                  name="agreeToTerms"
                  className="mr-2"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                />
                <label htmlFor="terms" className="text-xs text-gray-600">
                  I agree to the <a href="#" className="text-blue-500">Terms of Service</a> and <a href="#" className="text-blue-500">Privacy Policy</a>
                </label>
              </div>
              {errors.agreeToTerms && <p className="text-xs text-red-500">{errors.agreeToTerms}</p>}
              
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded"
                  onClick={handleBack}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  className="px-6 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-2"
                  onClick={handleSubmit}
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
          
          <div className="mt-6 text-sm text-center text-gray-600">
            Already have an account? <a href="/login" className="text-blue-500">Login</a>
          </div>
        </form>
      </div>
    </div>
  );
}