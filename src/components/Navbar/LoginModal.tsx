import React, { useEffect, useRef } from "react";
import axios from "axios";
import "./LoginModal.css";
import { useUser } from "./UserContext";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

declare global {
  interface Window {
    google: any;
  }
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const googleDivRef = useRef<HTMLDivElement>(null);

  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const { setUser } = useUser();

  useEffect(() => {
    if (!isOpen) return;

    const initializeGoogle = () => {
      if (!window.google || !googleDivRef.current) return;

      window.google.accounts.id.initialize({
        client_id:
          "529538752652-7o91e72iiiq3ij39s1f17p3g1smujo8k.apps.googleusercontent.com",
        callback: async (response: any) => {
          const googleToken = response.credential;
          try {
            const res = await axios.post(`${baseURL}/api/auth/google`, {
              token: googleToken,
            });
            console.log("로그인 성공 응답 데이터:", res.data);
            const accessToken = res.data.token;

            localStorage.setItem("accessToken", accessToken);
            alert("로그인 성공!");

            const profileRes = await axios.get(`${baseURL}/api/auth/profile`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });

            setUser(profileRes.data);

            onClose();
          } catch (err) {
            console.error("구글 로그인 실패", err);
          }
        },
      });

      window.google.accounts.id.renderButton(googleDivRef.current, {
        theme: "outline",
        size: "large",
      });
    };

    if (!window.google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      document.body.appendChild(script);
    } else {
      initializeGoogle();
    }
  }, [isOpen]);

  if (!isOpen) return null; // isOpen 상태에 따라 렌더링

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-button" onClick={onClose}>
          X
        </button>
        <h2>Login</h2>
        <div ref={googleDivRef}></div>
      </div>
    </div>
  );
};

export default LoginModal;
