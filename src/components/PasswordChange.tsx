import { useState } from "react";
import LoadingIndicator from "./LoadingIndicator";
import { apihost } from "../api/ServerLink";
import axios from "axios";

interface resetPasswordResponsePositive {
    handlervalue: number;
    message : string;    
}


const PasswordChange = () => {
    const [formData, setFormData] = useState({
        user_pass: "",        
        user_passc : ""
    });    
    const [isLoading, setIsLoading] = useState(false);
    const { user_pass,user_passc } = formData;   
    const [errMessage,setErrMessage] = useState("");
    const storedToken = localStorage.getItem("logintoken");
    const [tokenState, setTokenState] = useState(1);

    const handleChange = (event: { target: { id: any; value: any; }; }) => {
        setFormData({ ...formData, [event.target.id]: event.target.value });
    };    

    const handlePasswordChange = async() =>{
        let errcnt = 0;
        if(user_pass.length<6){
            setErrMessage("パスワードは6文字以上で設定してください。");       
            setTokenState(1);     
            errcnt++;
        }
        if(user_pass!==user_passc){
            setErrMessage("パスワードが一致しません。入力内容をご確認ください。");            
            setTokenState(1);
            errcnt++;
        }
        if(errcnt==0 && storedToken){
            const logintoken = JSON.parse(storedToken);
            setIsLoading(true);   
            const payload ={
                token : logintoken.token
                ,user_pass : user_pass
            }
            const valurl = apihost + 'userlogin/validateChangePasswordToken';
            const response = await axios.post<resetPasswordResponsePositive>(valurl,payload);   
            try{
                const result = response.data;   
                if(result.handlervalue==0){     
                    setIsLoading(false);
                    setTokenState(3);                                   
                }
                if(result.handlervalue==1){     
                    setIsLoading(false);
                    setTokenState(1);     
                    setErrMessage("パスワードが正常にリセットされました。");
                }
            } catch(error){
                setErrMessage("エラーが発生しました。システム管理者にお問い合わせください。");
            }
        }
    }

    return (
        <>
            {isLoading && <LoadingIndicator />}              
            <div className="loginmenuformcontainer">
                <div className="loginmenucenterform"> 
                    {tokenState==1 ? (
                        <>
                        <div className="col-12 mb-3">
                            <center><h2>新しいパスワード入力</h2></center>
                            <p>パスワードは6文字以上で設定してください。</p>
                        </div>
                        <div className="col-12 mb-3">
                            <label className="form-label">パスワード</label>
                            <input type="password" className="form-control" id="user_pass" value={user_pass} onChange={handleChange}></input>
                        </div>
                        <div className="col-12 mb-3">
                            <label className="form-label">パスワード再入力</label>
                            <input type="password" className="form-control" id="user_passc" value={user_passc} onChange={handleChange}></input>
                        </div>                    
                        <div className="col-12 mb-3">
                            <div className="float-end">
                                <span className="btn btn-primary" onClick={handlePasswordChange}>パスワードを変更する</span>
                            </div>
                        </div>
                        <div className="clearfix"></div>
                        <div className="col-12 mb-3">
                            <p className="loginerror">{errMessage}</p>
                        </div>  
                        </>
                    ) : null }                
                    {tokenState==3 ? (
                        <>
                        <div className="col-12 mb-3">
                            <h2>パスワード変更の有効期限が切れました。</h2>
                            <p>新しいパスワード変更用メールを受け取るには、<a href="../passforget">【リセットパスワード】</a> をクリックしてください。
                            </p>
                        </div>                        
                        </>
                    ) : null
                    }                    
                </div>
            </div>
        </>
    )
}

export default PasswordChange;