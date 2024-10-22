// VerificationPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/apiConfig';
import VerificationModal from './VerificationModal';

const VerificationPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);
  const [showModal, setShowModal] = useState(true); // Modal başlangıçta açık
  const [message, setMessage] = useState('Verifying your email...'); // Mesaj durumu

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/bands/verify/${token}`);
        const data = await response.json();

        if (response.ok && data.verified) {
          setIsVerified(true);
          setMessage('Your email has been verified. You can login now.');
        } else {
          setMessage(data.message || 'Verification failed. Please try again.');
        }
      } catch (error) {
        console.error('Verification Error:', error);
        setMessage('An error occurred while verifying your email.');
      }
    };

    verifyEmail();
  }, [token]);

  const handleClose = () => {
    setShowModal(false);
    navigate('/'); // Doğrulama sonrası login sayfasına yönlendir
  };

  return (
    <VerificationModal show={showModal} onClose={handleClose} message={message} />
  );
};

export default VerificationPage;
