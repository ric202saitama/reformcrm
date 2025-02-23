import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from "axios";
import { apihost } from "../api/ServerLink";
import LoadingIndicator from "./LoadingIndicator";

interface ApiResponse{
    handlervalue: number;
    user_id: string;
}

const UserData = () =>{
    const storedToken = localStorage.getItem("logintoken");
    const storeduserdetail = JSON.parse(localStorage.getItem("userdetail") || '{}');   
    const [user_id, setUser_id] = useState(storeduserdetail.user_id);
    
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        user_name: "",
        emailadd: "",
        contactno : "",
        user_pass: "",
        user_passc: "",        
        isadmin: true,
        isactive: true
    });
    const { user_name, emailadd, contactno, user_pass, user_passc, isadmin, isactive } = formData;    

    const handleChange = (event: { target: { id: any; type: any; checked: any; value: any; }; }) => {
        const { id, type, checked, value } = event.target;
        setFormData({
            ...formData,
            [id]: type === 'checkbox' ? checked : value
        });                        
    };
    
    const handleSaveUser = async() =>{
        const errmsg = [];

        if (user_name === ""){
            errmsg.push("お名前を入力してください。");
        }
        if (emailadd === ""){
            errmsg.push("メールアドレスを入力してください。");
        }
        if(contactno === ""){
            errmsg.push("連絡先を入力してください。");
        }
        if (user_pass === ""){
            errmsg.push("パスワードを入力してください。");
        }
        if (user_pass !== user_passc){
            errmsg.push("パスワードが一致しません。");
        }
        if(user_pass.length < 6){
            errmsg.push("パスワードは6文字以上で設定してください。");
        }
        if(errmsg.length > 0){
            var errhtml = "<ul>";
            errmsg.forEach(function(val) {            
                errhtml += "<li>"+val+"</li>";
            });
            errhtml += "</ul>";            
            Swal.fire({
                icon: "error",
                title: "エラー",
                html: errhtml,
                customClass: {
                htmlContainer: 'swal2-html-container-left', 
                },
                showCloseButton: true,
                confirmButtonText: '閉じる'
            });
            return;
        } else {
            setIsLoading(true);
            try{
                const logintoken = JSON.parse(storedToken || '{}');
                const payload = {
                    token: logintoken.token,
                    user_id: user_id,
                    user_name: user_name,
                    emailadd: emailadd,
                    oemailadd: storeduserdetail.emailadd,
                    contactno: contactno,
                    user_pass: user_pass,
                    isadmin: isadmin ? 1 : 0,
                    isactive: isactive ? 1 : 0
                };
                const valurl = `${apihost}userlogin/saveUser`;
                await axios.post<ApiResponse>(valurl, payload)
                .then((response) => {      
                    setIsLoading(false);              
                    const result = response.data;
                    switch (result.handlervalue) {
                        case 1:
                            setUser_id(result.user_id);
                            Swal.fire({            
                                icon: "success",
                                title: "情報を保存されました。",
                                showConfirmButton: false,
                                timer: 1500
                            });      
                            break;
                        case 2:
                            Swal.fire({
                                icon: "error",
                                title: "エラー",
                                text: "入力されたメールアドレスは既に使用されています。",
                                showCloseButton: true,
                                confirmButtonText: '閉じる'
                            });
                            break;
                        case 3:
                            Swal.fire({
                                icon: "error",
                                title: "エラー",
                                text: "メールアドレスが重複しています。",
                                showCloseButton: true,
                                confirmButtonText: '閉じる'
                            });
                            break;
                        default:
                            Swal.fire({
                                icon: "error",
                                title: "エラー",
                                text: "情報を保存できませんでした。",
                                showCloseButton: true,
                                confirmButtonText: '閉じる'
                            });
                            break;
                    }                   
                })
                .catch((error) => {
                    setIsLoading(false);
                    console.error(error);
                    Swal.fire({
                        icon: "error",
                        title: "エラー",
                        text: "情報を保存できませんでした。",
                        showCloseButton: true,
                        confirmButtonText: '閉じる'
                    });
                });
            } catch (error){
                setIsLoading(false);
                console.error(error);
                Swal.fire({
                    icon: "error",
                    title: "エラー",
                    text: "情報を保存できませんでした。",
                    showCloseButton: true,
                    confirmButtonText: '閉じる'
                });
            }
        }               
    }

    const handleNavigateback = () =>{       
        navigate(storeduserdetail.backpage || '/');       
    }

    const handleLoad = () =>{        
        try{
            if (user_id === ""){
                throw new Error("Invalid user id");
            }            
            setFormData({
                user_name: user_id!= 0 ? storeduserdetail.user_name : "",
                emailadd: user_id!= 0 ? storeduserdetail.emailadd : "",
                contactno: user_id!= 0 ? storeduserdetail.contactno : "",
                user_pass: user_id!= 0 ? storeduserdetail.user_pass : "",
                user_passc: user_id!= 0 ? storeduserdetail.user_pass : "",
                isadmin: user_id !== 0 ? Boolean(storeduserdetail.isadmin) : false,
                isactive: user_id !== 0 ? Boolean(storeduserdetail.isactive) : false
            });            
        }catch(error){
            console.error(error);
            navigate('/');
        }
    }

    useEffect(() => {
        handleLoad();
    }, []);

    return(
        <>        
        {isLoading && <LoadingIndicator />}   
        <div className="container-fluid">
            <div className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
                <div className="col-md-6">
                    <span className="btn btn-light border" style={{width: "100px"}} onClick={handleNavigateback}> 戻る </span>
                </div>                    
                <div className="col-md-6">                    
                    <div className="float-end">
                        <span className="btn btn-success" style={{width: "100px"}} onClick={handleSaveUser}> 保存 </span>
                    </div>                    
                </div>                
            </div>            
        </div>

        <div className="container-fluid">
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">お名前</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        id="user_name" 
                        placeholder="田中　太郎"
                        onChange={handleChange}
                        autoComplete="off"
                        value={user_name}
                    />
                </div>
                <div className="clearfix"></div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">メールアドレス</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="takume@abc.com" 
                        id="emailadd" 
                        onChange={handleChange}
                        autoComplete="off"
                        value={emailadd}
                    />
                </div>   
                <div className="col-md-6 mb-3">
                    <label className="form-label">連絡先</label>
                    <input 
                        type="text" 
                        className="form-control"                         
                        id="contactno" 
                        onChange={handleChange}
                        autoComplete="off"
                        placeholder="08000000000"
                        value={contactno}
                    />
                </div>                                
                <div className="clearfix"></div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">パスワード</label>
                    <input 
                        type="password" 
                        className="form-control" 
                        id="user_pass" 
                        onChange={handleChange}
                        autoComplete="off"
                        value={user_pass}
                    />
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">パスワード再入力</label>
                    <input 
                        type="password" 
                        className="form-control" 
                        id="user_passc" 
                        onChange={handleChange}
                        value={user_passc}
                    />
                </div>
                <div className="col-md-2 mb-3">                    
                    <input 
                        type="checkbox" 
                        className="form-check-input" 
                        id="isadmin" 
                        onChange={handleChange}                        
                        checked={isadmin} 
                    />      
                    &nbsp;              
                    <label className="form-label" htmlFor="isadmin"> 管理者</label>
                </div>
                <div className="col-md-2 mb-3">                    
                    <input 
                        type="checkbox" 
                        className="form-check-input" 
                        id="isactive"    
                        onChange={handleChange}                             
                        checked={isactive} 
                    />
                    &nbsp;
                    <label className="form-label" htmlFor="isactive"> 稼働メンバー</label>
                </div>                
                
            </div>
        </div>
        </>
    );
}

export default UserData;