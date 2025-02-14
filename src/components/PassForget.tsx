import { useState } from "react";
import axios from "axios";
import { apihost } from "../api/ServerLink";
import LoadingIndicator from "./LoadingIndicator";

interface resetPasswordResponse {
    handlervalue: number;
    message : string;
    mailmessageid: string;
}

const PassForget = () =>{
    const [formData, setFormData] = useState({
        emailadd: "",        
    });
    const handleChange = (event: { target: { id: any; value: any; }; }) => {
        setFormData({ ...formData, [event.target.id]: event.target.value });
    };
    const { emailadd } = formData;   
    const [mailCheckerror, setMailCheckerror] = useState("");
    const [isMailCheck,setMailCheck] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckServer = async() =>{
        if(emailadd.trim()!=""){
            var payload ={
                emailadd : emailadd
            }
            setIsLoading(true);    
            const valurl = apihost + 'userlogin/resetPasswordMail';
            const response = await axios.post<resetPasswordResponse>(valurl,payload);   
            try{
                const result = response.data;     
                if(result.handlervalue==1){
                    setMailCheck(true);
                } else {
                    setMailCheck(false);
                    setMailCheckerror("入力されたメールアドレスが見つかりませんでした。スペルに間違いがないかご確認の上、再度入力してください。");
                }
                setIsLoading(false);    
            } catch(error){
                setIsLoading(false);    
                console.log("エラー:",error);
            }
        } else {
            setMailCheckerror("メールをご入力してをください");
        }
    }

    return(
        <>
        {isLoading && <LoadingIndicator />}   
        <div className="loginmenubackground">
            <div className="loginmenuformcontainer">
                <div className="loginmenucenterform">        
        {!isMailCheck ? (
            <>
                <div className="col-12 mb-3">
                    <center><h2>メール入力</h2></center>
                    <p>パスワードを変更するには、以下にメールアドレスを入力してください。<br/>
                    入力後、「メールを確認」ボタンをクリックしてください。
                    </p>
                </div>
                <div className="col-12 mb-3">                                    
                    <label className="form-label">メールアドレス</label>
                    <input type="text" className="form-control" placeholder="takume@abc.com" onChange={handleChange} value={emailadd} id="emailadd"></input>                                    
                </div>      
                <div className="float-end">  
                    <span className="btn btn-primary" onClick={handleCheckServer}>メールを確認</span>                
                </div>
                <div className="clearfix"></div>
                <div className="col-12 mb-3"> 
                    <p className="loginerror">{mailCheckerror}</p>
                </div>                    
            </>
        ) : (
            <>
            <div className="col-12 mb-3">
                <center><h2>メールの確認が完了しました。</h2></center>
                <p>
                    {emailadd}にメールを送信しました。メールの手順に従ってパスワードを変更してください。
                </p>
                <p>
                ログインするには、こちらをクリックしてください <a href="../">【ログイン】</a>                
                </p>                
            </div>            
            </>
        )
        }
                </div>
            </div>
        </div>        
        </>
    )
}

export default PassForget;