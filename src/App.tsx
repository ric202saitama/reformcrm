import { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NavigationBar from "./components/NavigationBar";
import LoginMenu from "./components/LoginMenu";
import NewUser from "./components/NewUser";
import DashBoard from "./components/DashBoard";
import PassForget from "./components/PassForget";
import Security from "./components/Security";
import PasswordChange from "./components/PasswordChange";
import { apihost } from "./api/ServerLink";
import { AuthContext } from "./components/AuthContext";
import UserSetting from "./components/UserSetting";
import UserData from "./components/UserData";
import BranchMaster from "./components/BranchMaster";
import BranchDetail from "./components/BranchDetail";
import CustomerMater from "./components/CustomerMaster";
import CustomerMasterInput from "./components/CustomermasterInput";
interface LoginResponse {
  token: string;
  user_name: string;  
  handlervalue: number;
}

function App() {
  const [isLogin, setLogin] = useState<boolean | null>(null);  // Initial state set to null to handle loading state
  const [userName, setUserName] = useState("");  
  const storedToken = localStorage.getItem("logintoken");

  // Validate token during initial render
  const validateToken = async () => {
    
    if (!storedToken) {
      setLogin(false);  // If no token, set login state to false
      setUserName("");
    } else {
      const logintoken = JSON.parse(storedToken);
      const payload = { token: logintoken.token };            
      try {
        const valurl = apihost + "userlogin/validateToken";
        const response = await axios.post<LoginResponse>(valurl, payload);
        const result = response.data;

        if (result.handlervalue === 1) {
          const tokendata = { token: result.token, user_name: result.user_name };
          localStorage.setItem("logintoken", JSON.stringify(tokendata));
          setUserName(result.user_name);
          setLogin(true);  // Set login state to true if validation succeeds
        } else {
          setUserName("");
          setLogin(false);  // If validation fails, set login state to false
          console.log("Token validation failed");
        }
      } catch (error) {
        console.error(error);
        setLogin(false);  // On error, set login state to false
        setUserName("");
      }
    }
  };

  useEffect(() => {
    validateToken();  // Run validation on mount
  }, []);

  // Wait for the token validation to complete before rendering the routes
  if (isLogin === null) {
    // Loading state while waiting for validation
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ isLogin, userName, setLogin, setUserName }}>
      <BrowserRouter>
        {/* Navigation Bar only appears if logged in */}
        {isLogin && <NavigationBar />}
        <Routes>
          {/* Login Page */}
          <Route
            path="/"
            element={isLogin ? <Navigate to="/dashboard" replace /> : <LoginMenu onLoginSuccess={() => setLogin(true)} />}
          />
          <Route path="/newuser" element={<NewUser />} />
          <Route path="/passforget" element={<PassForget />} />
          <Route path="/security/:token" element={<Security />} />

          {/* Protected Routes */}
          {isLogin ? (
            <>
              <Route path="/dashboard" element={<DashBoard />} />
              <Route path="/usermanage" element={<UserSetting />} />
              <Route path="/passwordchange" element={<PasswordChange />} />              
              <Route path="/userdata" element={<UserData />} />              
              <Route path="/branchmaster" element={<BranchMaster />} />              
              <Route path="/BranchDetail" element={<BranchDetail />} />              
              <Route path="/customermaster" element={<CustomerMater />} />              
              <Route path="/customermasterinput" element={<CustomerMasterInput />} />              
            </>
          ) : (
            // Redirect to login page if not logged in
            <Route path="*" element={<Navigate to="/" replace />} />
          )}
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
