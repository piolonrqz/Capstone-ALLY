import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from './Logo';


export default function ClientRegistrationForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const oemail = localStorage.getItem("email");
  const fname = localStorage.getItem("fName");
  const lname = localStorage.getItem("lName");
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
    
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
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

  const handleSubmit = async (e) => {
    e.preventDefault();    if (validateStep2()) {
        try {
          const body = new FormData();
          body.append("email", formData.email);
          body.append("password", formData.password);
          body.append("Fname", formData.fName);
          body.append("Lname", formData.lName);          body.append("phoneNumber", formData.phoneNumber);
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
          
        await fetch("http://localhost:8080/users/Client", {
          method: "POST",
          body: body
        })
        console.log("Form submitted with:", body);
      alert("Registration successful! Please login.");
      navigate('/login');
      }
      catch (error) {
        console.error("Error submitting form:", error);
        alert('Registration failed. Please try again.');
      }
    }
  };
  return (    
    <div className="flex items-center justify-center w-full min-h-screen overflow-hidden bg-white font-['Poppins'] relative">
      <Logo />
      <div className="w-full max-w-4xl p-12 mx-auto shadow-lg bg-stone-100 border-stone-300 rounded-xl">
        <h2 className="mb-3 text-4xl font-semibold text-center text-blue-900">Register as a Client</h2>
        <p className="mb-8 text-base text-center text-neutral-600">Create your account to find legal help</p>
        
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
                <label className="block text-sm font-medium text-gray-700 text-start">Profile Photo</label>
                <div className="flex items-center gap-6 mt-2">
                  <div className="relative flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32">
                    {formData.profilePhoto ? (
                      <img 
                        src={URL.createObjectURL(formData.profilePhoto)} 
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
                    <label className="inline-block px-4 py-2 text-white bg-blue-500 rounded-lg cursor-pointer hover:bg-blue-600">
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
                            alert("File size should not exceed 5MB");
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
                  <input
                    type="text"
                    name="fName"
                    placeholder="First Name"
                    className={`w-full p-3 border rounded-lg ${errors.fName ? 'border-red-500' : 'border-neutral-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                    value={formData.fName}
                    onChange={handleChange}
                  />
                  {errors.fName && <p className="mt-1 text-xs text-red-500">{errors.fName}</p>}
                </div>
                <div className="w-1/2">
                  <input
                    type="text"
                    name="lName"
                    placeholder="Last Name"
                    className={`w-full p-3 border rounded-lg ${errors.lName ? 'border-red-500' : 'border-neutral-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                    value={formData.lName}
                    onChange={handleChange}
                  />
                  {errors.lName && <p className="mt-1 text-xs text-red-500">{errors.lName}</p>}
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
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
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
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                <p className="mt-1 text-xs text-gray-400">Password must be at least 8 characters long</p>
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
              <div>                <div className="relative">
                  <span className="absolute text-gray-500 transform -translate-y-1/2 left-3 top-1/2">+63</span>
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="9XXXXXXXXX"
                    className={`w-full p-2 pl-11 border rounded ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
                {errors.phoneNumber && <p className="mt-1 text-xs text-red-500">{errors.phoneNumber}</p>}
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
                {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
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
                  {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
                </div>
                <div className="w-1/2">
                  <input
                    type="text"
                    name="province"
                    placeholder="Province"
                    className={`w-full p-2 border rounded ${errors.province ? 'border-red-500' : 'border-gray-300'}`}
                    value={formData.province}
                    onChange={handleChange}
                  />
                  {errors.province && <p className="mt-1 text-xs text-red-500">{errors.province}</p>}
                </div>
              </div>
              
              <div>
                <input
                  type="text"
                  name="zip"
                  placeholder="Zip Code"
                  className={`w-full p-2 border rounded ${errors.zip ? 'border-red-500' : 'border-gray-300'}`}
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
                  className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                  onClick={handleSubmit}
                >
                  Register →
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