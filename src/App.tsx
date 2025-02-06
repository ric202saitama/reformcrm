import { useState,useEffect } from 'react';
import axios from "axios";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginMenu from "./components/LoginMenu";
import NewUser from './components/NewUser';
import DashBoard from './components/DashBoard';
import { apihost } from "./api/ServerLink";

interface LoginResponse {
  token: string;
  [key: string]: any; 
}


function App() {
  const [isLogin,setLogin] = useState(false);

  const validateToken = async() => {    
    const storedToken = localStorage.getItem("logintoken");
    if(!storedToken){
      setLogin(false);
    } else {
      const logintoken = JSON.parse(storedToken);
      const valurl = apihost + 'userlogin/validateToken';
      const response = await axios.post<LoginResponse>(valurl,logintoken.token);
      try{
        const result = response.data;
        if(result.handlervalue==1){
          const tokendata = {
              token : result.token
          }
          localStorage.setItem("logintoken",JSON.stringify(tokendata));     
          setLogin(true);     
        } else {
          setLogin(false);     
        }
      } catch(error){
        console.error(error);
        setLogin(false);     

      }
    }
  }

  useEffect(() => {
    validateToken();
  },[]);

  return (
    <BrowserRouter>
    <Routes>          
        <Route path="/" element={isLogin ? <Navigate to="/dashboard" replace /> : <LoginMenu onLoginSuccess={() => setLogin(true)} />} />
        <Route path="/newuser" element={<NewUser/>}></Route>      
        {isLogin ? (
          <>
          <Route path="/dashboard" element={<DashBoard/>}></Route>    
          <Route path="/customermaster"></Route>    
          </>
        ) : (
          <Route path="*" element={<Navigate to="/" replace />} />
        )}
    </Routes>
    </BrowserRouter>
  )
}

export default App
