import React, { useState, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from '../firebase/config';

const EditProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    file: null, // For profile picture upload
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imgSrc, setImgSrc] = useState('/api/placeholder/100/100');
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  // Load current user details from localStorage
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }
    // Fetch lawyer settings from backend
    fetch(`http://localhost:8080/users/getUser/${currentUser.id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        setFormData(prev => ({
          ...prev,
          name: data.Fname || '',
          email: data.email || '',
          // Add more fields as needed from lawyer settings
        }));
        setImgSrc(data.profilePhoto || '/api/placeholder/100/100');
      })
      .catch(error => {
        console.error('Failed to fetch lawyer settings:', error);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        file,
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgSrc(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToFirebase = async (file) => {
    const storageRef = ref(storage, `profilePhotos/${currentUser.id}_${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!formData.currentPassword) {
      setError('Current password is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser?.id || isNaN(currentUser.id)) {
        throw new Error('Invalid user ID');
      }

      let profilePhotoUrl = currentUser.prof_pic || '';
      if (formData.file) {
        // Upload to Firebase Storage
        profilePhotoUrl = await uploadImageToFirebase(formData.file);
        setImgSrc(profilePhotoUrl); // Update preview immediately
      }

      const formDataPayload = new FormData();
      formDataPayload.append('userId', currentUser.id);
      formDataPayload.append('name', formData.name);
      formDataPayload.append('email', formData.email);
      formDataPayload.append('currentPassword', formData.currentPassword);
      if (formData.newPassword) {
        formDataPayload.append('newPassword', formData.newPassword);
      }
      // Send the Firebase URL to backend
      if (profilePhotoUrl) {
        formDataPayload.append('prof_pic', profilePhotoUrl);
      }

      const response = await fetch(`http://localhost:8080/user/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: formDataPayload
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      const updatedUser = await response.json();

      // 1. Update localStorage with the new user data including the profile picture
      localStorage.setItem('currentUser', JSON.stringify({
        ...currentUser,
        name: updatedUser.name,
        email: updatedUser.email,
        prof_pic: updatedUser.prof_pic // Update profile picture if returned
      }));

      setImgSrc(updatedUser.prof_pic); // Update profile image in the state

      setSuccess('Profile updated successfully!');

      // Clear sensitive form fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        file: null
      }));
    } catch (error) {
      if (error.message.includes('401')) {
        setError('Current password is incorrect or session expired');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('jwtToken');
        window.location.href = '/login';
      } else {
        setError(error.message || 'Failed to update profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Profile Picture</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <img src={imgSrc} alt="Profile" width={100} height={100} />
      </div>
      <div>
        <label>Name</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} />
      </div>
      <div>
        <label>Email</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} />
      </div>
      <div>
        <label>Current Password</label>
        <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} />
      </div>
      <div>
        <label>New Password</label>
        <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} />
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      <button type="submit" disabled={isLoading}>{isLoading ? 'Updating...' : 'Update Profile'}</button>
    </form>
  );
};

export default EditProfile;
