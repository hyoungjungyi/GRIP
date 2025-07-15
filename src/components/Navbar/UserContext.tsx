import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { getApiBaseUrl } from '../../utils/apiUtils';

//로그인 후 구현
type User = {
  id: number;
  username: string;
  email: string;
  profileImage?: string;
} | null;

type UserContextType = {
  user: User;
  setUser: (user: User) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);

  const fetchProfile = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const baseUrl = getApiBaseUrl();
      const res = await axios.get(`${baseUrl}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(res.data); // 프로필 정보 저장
    } catch (error) {
      console.error("프로필 불러오기 실패", error);
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};
