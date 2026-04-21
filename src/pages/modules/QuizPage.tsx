import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const QuizPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/modules/webview', {
      replace: true,
      state: { url: 'https://dhsig86.github.io/SIMULOTTO/' },
    });
  }, [navigate]);

  return null;
};
