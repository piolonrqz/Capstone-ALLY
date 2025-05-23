import { useState } from "react";

export default function ClientRegistrationForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});

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
    
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.zipCode.trim()) newErrors.zipCode = "ZIP code is required";
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep2()) {
      // Here you would typically send the data to your backend
      console.log("Form submitted with:", formData);
      // Show success message or redirect user
      alert("Registration successful!");
    }
  };
  return (    
    <div className="flex justify-center items-center min-h-screen w-full bg-white overflow-hidden">
      <div className="bg-stone-100 border-stone-300 p-12 rounded-xl shadow-lg w-full max-w-4xl mx-auto font-inter">
        <h2 className="text-3xl font-bold text-center mb-3 text-neutral-900">Register as a Client</h2>
        <p className="text-center text-neutral-600 text-base mb-8">Create your account to find legal help</p>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-1 w-full bg-gray-200 rounded">
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
            <div className="space-y-4">              <div className="flex gap-6">
                <div className="w-1/2">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    className={`w-full p-3 border rounded-lg ${errors.firstName ? 'border-red-500' : 'border-neutral-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div className="w-1/2">
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    className={`w-full p-3 border rounded-lg ${errors.lastName ? 'border-red-500' : 'border-neutral-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>
              
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              
              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className={`w-full p-2 border rounded ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                <p className="text-gray-400 text-xs mt-1">Password must be at least 8 characters long</p>
              </div>
              
              <div>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  className={`w-full p-2 border rounded ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  onClick={handleContinue}
                >
                  Continue →
                </button>
              </div>
            </div>
          ) : (
            /* Step 2: Additional Details */
            <div className="space-y-4">
              <div>                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">+63</span>
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="9XXXXXXXXX"
                    className={`w-full p-2 pl-11 border rounded ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
                {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
              </div>
              
              <div>
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  className={`w-full p-2 border rounded ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.address}
                  onChange={handleChange}
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>
              
              <div className="flex gap-4">
                <div className="w-1/2">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    className={`w-full p-2 border rounded ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                    value={formData.city}
                    onChange={handleChange}
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
                <div className="w-1/2">
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    className={`w-full p-2 border rounded ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
                    value={formData.state}
                    onChange={handleChange}
                  />
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>
              </div>
              
              <div>
                <input
                  type="text"
                  name="zipCode"
                  placeholder="Zip Code"
                  className={`w-full p-2 border rounded ${errors.zipCode ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.zipCode}
                  onChange={handleChange}
                />
                {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
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
              {errors.agreeToTerms && <p className="text-red-500 text-xs">{errors.agreeToTerms}</p>}
              
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  className="border border-gray-300 text-gray-600 px-4 py-2 rounded flex items-center"
                  onClick={handleBack}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  onClick={handleSubmit}
                >
                  Register →
                </button>
              </div>
            </div>
          )}
          
          <div className="text-center mt-6 text-sm text-gray-600">
            Already have an account? <a href="#" className="text-blue-500">Login</a>
          </div>
        </form>
      </div>
    </div>
  );
}