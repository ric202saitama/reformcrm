import { useState } from "react";
import LoadingIndicator from "./LoadingIndicator";
import { apihost } from "../api/ServerLink";
import { useParams } from 'react-router-dom';
import axios from "axios";

interface resetPasswordResponsePositive {
    handlervalue: number;
    message : string;    
}

const Security = () =>{
    const [formData, setFormData] = useState({
        user_pass: "",        
        user_passc : ""
    });
    const handleChange = (event: { target: { id: any; value: any; }; }) => {
        setFormData({ ...formData, [event.target.id]: event.target.value });
    };
    const { user_pass,user_passc } = formData;   
    const { token } = useParams();  
    
    /* tokenState is use to load the window in SPA
    1 : password change window
    2 : permission denied to access the page
    3 : token has expired
    4 : password change successfully go back to login
    */
    const [tokenState, setTokenState] = useState(1);
    const [errMessage,setErrMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    localStorage.removeItem('logintoken');
    const handleValidateToken = async () =>{
                 
        if(!token){
            setTokenState(2);
        } else {
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
            if(errcnt==0){
                setIsLoading(true);   
                const payload ={
                    token : token
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
                        setTokenState(4);
                    }
                } catch(error){
                    setIsLoading(false);    
                    console.log("エラー:",error);                    
                }

            }
        }

    }

    return(
        <>
        {isLoading && <LoadingIndicator />}           
        <div className="loginmenubackground">
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
                            <span className="btn btn-primary" onClick={handleValidateToken}>パスワードを変更する</span>
                        </div>
                    </div>
                    <div className="clearfix"></div>
                    <div className="col-12 mb-3">
                        <p className="loginerror">{errMessage}</p>
                    </div>
                    </>
                    ) : null
                    }
                    {tokenState==2 ? (
                        <>
                        <div className="col-12 mb-3">
                            <h2>無効なURLです。パスワードを変更できません。</h2>
                            <p>ログイン画面へ戻る場合は、こちらをクリックしてください。<a href="../">ログイン画面に戻る</a>                            
                            </p>
                        </div>
                        </>
                    ) : null
                    }
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
                    {tokenState==4 ? (
                        <>
                        <h2>パスワードが変更されました。</h2>
                        <p>
                        <a href="../">【ログイン画面】</a>をクリックしてログインしてください。
                        </p>
                        </>
                    ) : null
                    }
                </div>
            </div>
        </div>
        </>
    )
}

export default Security
