import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from './Logo';

export default function LawyerRegistrationForm() {const [step, setStep] = useState(1); // Start with step 1 for proper form flow
  const oemail = localStorage.getItem("email");
  const fname = localStorage.getItem("fName");
  const lname = localStorage.getItem("lName");
  console.log("Initial email from search params:", oemail);
  console.log("Initial first name from search params:", fname);
  console.log("Initial last name from search params:", lname);
  const [formData, setFormData] = useState({
    firstName: fname || "",
    lastName: lname || "",
    email: oemail || "",
    password: "",
    confirmPassword: "",
    profilePhoto: null,
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
    professionalBio: "",
    credentials: null,
    agreeToTerms: false
  });
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
    if (!formData.province.trim()) newErrors.province = "Province is required";
    if (!formData.zipCode.trim()) newErrors.zipCode = "ZIP code is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    // Disabled: if (!formData.prcNumber.trim()) newErrors.prcNumber = "Bar Number is required";
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
      try {
        const body = new FormData();
        body.append("email", formData.email);
        body.append("password", formData.password);
        body.append("Fname", formData.firstName);             
        body.append("Lname", formData.lastName);               
        body.append("phoneNumber", formData.phoneNumber);      
        body.append("address", formData.address);
        body.append("city", formData.city);
        body.append("province", formData.province);              
        body.append("zip", formData.zipCode);                  
        body.append("barNumber", formData.prcNumber);          
        body.append("experience", formData.yearsOfExperience);


        const practiceAreas = formData.practiceAreas;

        Object.keys(practiceAreas).forEach(area => {
       if (practiceAreas[area]) {
    body.append("specialization", area);
  }
});
        body.append("credentials", formData.credentials); 

        fetch("http://localhost:8080/users/Lawyer", {
        method: "POST",
        body: body 
      })
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log("Form submitted with:", body);
      alert("Registration successful!");
      navigate('/signup/verifyLawyer', { state: { email: formData.email } });
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    }
  };
  return (      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-6 bg-white">
      <Logo className="hidden mb-6 md:block" />
      <div className={`bg-stone-100 p-4 sm:p-6 md:p-8 rounded-lg shadow-sm w-full ${
        step === 3 
          ? 'max-w-[1200px] lg:max-w-[70%]' 
          : step === 2 
            ? 'max-w-[900px]' 
            : 'max-w-[836px]'
      } mx-auto overflow-hidden`}>        <h2 className="py-2 mb-2 text-xl font-bold text-center sm:text-2xl">Register as a Lawyer</h2>
        <p className="py-2 mb-6 text-xs text-center text-gray-600 sm:text-sm">Create your professional account to connect with clients</p>
        
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
                <label className="block text-sm font-medium text-gray-700 text-start">Profile Photo</label>
                <div className="flex flex-row items-center gap-6 mt-2">
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

              <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                <div className="w-full sm:w-1/2">
                  <label htmlFor="firstName" className="block py-2 mb-1 text-sm font-medium text-gray-700 text-start">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    className={`w-full p-2.5 border rounded-md ${errors.firstName ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
                </div>                <div className="w-full sm:w-1/2">
                  <label htmlFor="lastName" className="block py-2 mb-1 text-sm font-medium text-gray-700 text-start">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    className={`w-full p-2.5 border rounded-md ${errors.lastName ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                  {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block py-2 mb-1 text-sm font-medium text-gray-700 text-start">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className={`w-full p-2.5 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
              
              <div>
                <label htmlFor="password" className="block py-2 mb-1 text-sm font-medium text-gray-700 text-start">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  className={`w-full p-2.5 border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                <p className="mt-1 text-xs text-gray-400 text-start">Password must be at least 8 characters long</p>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block py-2 mb-1 text-sm font-medium text-gray-700 text-start">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  className={`w-full p-2.5 border rounded-md ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
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
                </label>                <div className="relative">
                  <span className="absolute text-gray-500 transform -translate-y-1/2 left-3 top-1/2">+63</span>
                  <input
                    id="phoneNumber"
                    type="tel"
                    name="phoneNumber"
                    placeholder="9XXXXXXXXX"
                    className={`w-full p-2.5 pl-11 border rounded-md ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
                {errors.phoneNumber && <p className="mt-1 text-xs text-red-500">{errors.phoneNumber}</p>}
              </div>
              
              <div>
                <label htmlFor="address" className="block py-2 mb-1 text-sm font-medium text-gray-700 text-start">
                  Address
                </label>
                <input
                  id="address"
                  type="text"
                  name="address"
                  className={`w-full p-2.5 border rounded-md ${errors.address ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={formData.address}
                  onChange={handleChange}
                />
                {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
              </div>
              
              <div className="space-y-4">                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="w-full sm:w-1/2">
                    <label htmlFor="city" className="block py-2 mb-1 text-sm font-medium text-gray-700 text-start">
                      City
                    </label>
                    <input
                      id="city"
                      type="text"
                      name="city"
                      className={`w-full p-2.5 border rounded-md ${errors.city ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      value={formData.city}
                      onChange={handleChange}
                    />
                    {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
                  </div>                  <div className="w-full sm:w-1/2">
                    <label htmlFor="province" className="block py-2 mb-1 text-sm font-medium text-gray-700 text-start">
                      Province
                    </label>
                    <input
                      id="province"
                      type="text"
                      name="province"
                      className={`w-full p-2.5 border rounded-md ${errors.province ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      value={formData.province}
                      onChange={handleChange}
                    />
                    {errors.province && <p className="mt-1 text-xs text-red-500">{errors.province}</p>}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="zipCode" className="block py-2 mb-1 text-sm font-medium text-gray-700 text-start">
                    ZIP Code
                  </label>
                  <input
                    id="zipCode"
                    type="text"
                    name="zipCode"
                    className={`w-full p-2.5 border rounded-md ${errors.zipCode ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    value={formData.zipCode}
                    onChange={handleChange}
                  />
                  {errors.zipCode && <p className="mt-1 text-xs text-red-500">{errors.zipCode}</p>}
                </div>
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
                  className={`w-full p-2 border rounded ${errors.prcNumber ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.prcNumber}
                  onChange={handleChange}
                />
                {errors.prcNumber && <p className="mt-1 text-xs text-red-500">{errors.prcNumber}</p>}
              </div>
             
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 text-start">Practice Areas</label>                <div className="p-3 border border-gray-300 rounded">                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="familyLaw"
                        name="practiceAreas.familyLaw"
                        className="w-4 h-4 text-blue-500 border-gray-300 rounded"
                        checked={formData.practiceAreas.familyLaw}
                        onChange={handleChange}
                      />
                      <label htmlFor="familyLaw" className="ml-2 text-xs text-gray-700">
                        Family Law
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="criminalDefense"
                        name="practiceAreas.criminalDefense"
                        className="w-4 h-4 text-blue-500 border-gray-300 rounded"
                        checked={formData.practiceAreas.criminalDefense}
                        onChange={handleChange}
                      />
                      <label htmlFor="criminalDefense" className="ml-2 text-xs text-gray-700">
                        Criminal Defense
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="realEstate"
                        name="practiceAreas.realEstate"
                        className="w-4 h-4 text-blue-500 border-gray-300 rounded"
                        checked={formData.practiceAreas.realEstate}
                        onChange={handleChange}
                      />
                      <label htmlFor="realEstate" className="ml-2 text-xs text-gray-700">
                        Real Estate
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="businessLaw"
                        name="practiceAreas.businessLaw"
                        className="w-4 h-4 text-blue-500 border-gray-300 rounded"
                        checked={formData.practiceAreas.businessLaw}
                        onChange={handleChange}
                      />
                      <label htmlFor="businessLaw" className="ml-2 text-xs text-gray-700">
                        Business Law
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="personalInjury"
                        name="practiceAreas.personalInjury"
                        className="w-4 h-4 text-blue-500 border-gray-300 rounded"
                        checked={formData.practiceAreas.personalInjury}
                        onChange={handleChange}
                      />
                      <label htmlFor="personalInjury" className="ml-2 text-xs text-gray-700">
                        Personal Injury
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="estatePlanning"
                        name="practiceAreas.estatePlanning"
                        className="w-4 h-4 text-blue-500 border-gray-300 rounded"
                        checked={formData.practiceAreas.estatePlanning}
                        onChange={handleChange}
                      />
                      <label htmlFor="estatePlanning" className="ml-2 text-xs text-gray-700">
                        Estate Planning
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="immigration"
                        name="practiceAreas.immigration"
                        className="w-4 h-4 text-blue-500 border-gray-300 rounded"
                        checked={formData.practiceAreas.immigration}
                        onChange={handleChange}
                      />
                      <label htmlFor="immigration" className="ml-2 text-xs text-gray-700">
                        Immigration
                      </label>
                    </div>                  </div>
                  <div className="mt-4">
                    <label htmlFor="otherPracticeArea" className="block mb-2 text-sm font-medium text-gray-700">
                      Others (specify)
                    </label>
                    <input
                      type="text"
                      id="otherPracticeArea"
                      name="otherPracticeArea"
                      placeholder="Enter your other specialty areas"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.otherPracticeArea}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 text-start">Years of Experience</label>
                <input
                  type="number"
                  name="yearsOfExperience"
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
                  className="order-1 w-full px-4 py-2 text-white bg-blue-500 rounded-lg sm:w-auto hover:bg-blue-600 sm:order-2"
                >
                  Submit Application
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
    </div>
  );
}