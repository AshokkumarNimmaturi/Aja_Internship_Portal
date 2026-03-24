import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => {
    return sessionStorage.getItem("accessToken") || null;
  });

  const login = (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    sessionStorage.setItem("accessToken", accessToken);
    sessionStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
  };

  const isAuthenticated = !!token;

  const hasRole = (role) => user?.role === role;

  const hasAnyRole = (roles) => roles.includes(user?.role);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated,
        hasRole,
        hasAnyRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
