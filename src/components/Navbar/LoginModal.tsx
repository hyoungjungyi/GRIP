import React, { useEffect, useRef } from "react";
import axios from "axios";
import "./LoginModal.css"

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

  useEffect(() => {
    if (!isOpen) return;

    const initializeGoogle = () => {
      if (!window.google || !googleDivRef.current) return;

      window.google.accounts.id.initialize({
        client_id: "752175459323-dvph1oe4dn8ljikgomme8c01ucfhptn2.apps.googleusercontent.com",
        callback: async (response: any) => {
          const googleToken = response.credential;
          try {
            const res = await axios.post("http://localhost:5500/api/auth/google", { token: googleToken });
            console.log("로그인 성공 응답 데이터:", res.data);
            const jwt = res.data.jwt;

            localStorage.setItem("jwt", jwt);
            alert("로그인 성공!");
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
        <button className="close-button" onClick={onClose}>X</button>
        <h2>Login</h2>
        <div ref={googleDivRef}></div>
      </div>
    </div>
  );
};

export default LoginModal;
