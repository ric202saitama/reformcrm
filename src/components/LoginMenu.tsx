import { useState,useEffect,useContext } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import LoadingIndicator from "./LoadingIndicator";
import { apihost } from "../api/ServerLink";

import { AuthContext } from "../components/AuthContext";


interface LoginResponse {
    token: string;
    [key: string]: any; 
}

const LoginMenu = ({ onLoginSuccess }: { onLoginSuccess: () => void }) => {
    const [formData, setFormData] = useState({
        emailadd: "",
        user_pass: "",
    });

    const handleChange = (event: { target: { id: any; value: any; }; }) => {
        setFormData({ ...formData, [event.target.id]: event.target.value });
      };
    
    const { emailadd, user_pass } = formData;    
    const [isLoginError, setLoginError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { setLogin, setUserName } = useContext(AuthContext)!; 

    const navigate = useNavigate();

    const fnLoginInputCheck = () =>{
        var haserror = 0;
        if(emailadd.trim()==""){
            haserror++;
        }
        if(user_pass.trim()==""){
            haserror++;
        }
        return haserror;
    }
    const fnLoginCheckserver = async() =>{
        // debugger;
        var haserror = 0;
        const payload = {
            emailadd : emailadd
            ,user_pass : user_pass
        }    
        setIsLoading(true);    
        const valurl = apihost + 'userlogin/validateUser';
        const response = await axios.post<LoginResponse>(valurl,payload);
        try{
            const result = response.data;            
            setIsLoading(false);   
            if(result.handlervalue==1){
                const tokendata = {
                    token : result.token
                    ,user_name : result.user_name                    
                }
                localStorage.setItem("logintoken",JSON.stringify(tokendata));      
                setUserName(result.user_name);
                setLogin(true);
                haserror = 0; 
            } else {
                setUserName("");
                setLogin(false);                
                haserror = 1; 
            }           
        } catch(error){
            setUserName("");
            setLogin(false);                            
            console.log("エラー:",error);
        }
       
        return haserror;
    }
    const fnLogin = async() =>{
        const checkhaserror = fnLoginInputCheck();
        const loginerrormsg = 'ログインに失敗しました。メールアドレスとパスワードを正しく入力してください。';
        if(checkhaserror>0){
            setLoginError(loginerrormsg);
        } else {
            const responselogin = await fnLoginCheckserver();
            if(responselogin>0){
                setLoginError(loginerrormsg);
            } else {
                setLoginError("");
                onLoginSuccess();
                //navigate to dashboard
                navigate("/dashboard");

            }
        }

    }

    //clear all tokens in the login page during login
    useEffect(()=>{
        localStorage.removeItem('logintoken');
    },[]);
    return (
        <>
        <div className="loginmenubackground">
            <div className="loginmenuformcontainer">
                <div className="loginmenucenterform">
                    <center><h2>システムログイン</h2></center>
                    <form>                                                                       
                        <div className="col-12 mb-3">                                    
                            <label className="form-label">メールアドレス</label>
                            <input type="text" className="form-control" placeholder="takume@abc.com" onChange={handleChange} value={emailadd} id="emailadd"></input>                                    
                        </div>                                
                        <div className="col-12 mb-3">                                    
                            <label className="form-label">パスワード</label>
                            <input type="password" className="form-control" placeholder="**********" onChange={handleChange} value={user_pass} id="user_pass"></input>                                    
                        </div>  
                        <p className="loginerror"></p>   
                        <div className="col-12 mb-3">                                    
                            <div className="float-end">
                                <span className="btn btn-primary" onClick={fnLogin}>ログイン</span>                                                
                            </div>   
                        </div>   
                        <div className="clearfix"></div>
                        <div className="col-12 mb-3"> 
                            <p className="loginerror">{isLoginError}</p>
                        </div>
                        <div className="col-12 mb-3"> 
                            <p>パスワードをお忘れの方はこちら <a href="/passforget/">パスワード変更</a><br/>
                            新規ユーザー登録はこちら <a href="/newuser/">新規登録する</a>
                            </p>
                        </div>
                        {isLoading && <LoadingIndicator />}   
                    </form>

                </div>
            </div>
        </div>
        </>
    )
}

export default LoginMenu;