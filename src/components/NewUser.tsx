import { useState } from "react";
import CustomModal from "./CustomModal";
import LoadingIndicator from "./LoadingIndicator";
import { apihost } from "../api/ServerLink";

function NewUser(){
    const [formData, setFormData] = useState({        
        comp_name: "",
        comp_address: "",
        comp_contactno: "",        
        user_name : "",
        contactno : "",
        emailadd : "",        
        user_pass : "",
        user_passc : ""
    });
    interface Error {
        msg: string;
    }      
    const handleChange = (event: { target: { id: any; value: any; }; }) => {
        setFormData({ ...formData, [event.target.id]: event.target.value });
      };
    
    const {            
        comp_name
        ,comp_address
        ,comp_contactno        
        ,user_name 
        ,contactno 
        ,emailadd         
        ,user_pass 
        ,user_passc 
    } = formData;    

    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false); 
    const [isSuccessReg, setSuccessReg] = useState(false); 
    const [modalTitle, setModalTitle] = useState('');
    const [errors, setErrors] = useState<Error[]>([]); 

    function validatePassword(password: string): boolean {
        const minLength = 6;
        const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(password);
        return password.length >= minLength && isAlphanumeric;
      }    

    const fnvalidateinput = () => {         
        const err: Error[] = []; 

        if(comp_name.trim()==""){
            err.push({
                msg: "会社名"
            });
        }
        if(comp_address.trim()==""){
            err.push({
                msg: "会社の住所"
            });
        }        
        if(comp_contactno.trim()==""){
            err.push({
                msg: "会社のTEL"
            });
        }
        if(user_name.trim()==""){
            err.push({
                msg: "担当者の名前"
            });
        }        
        if(contactno.trim()==""){
            err.push({
                msg: "担当者のTEL"
            });
        }                
        if(emailadd.trim()==""){
            err.push({
                msg: "担当者のメールアドレス"
            });
        }                        
        if(user_pass.trim()==""){
            err.push({
                msg: "担当者のパスワード入力"
            });            
        }                        
        if(user_pass.trim()!=""){
            if(user_pass!=user_passc){
                err.push({
                    msg: "パスワードが一致しません。もう一度入力してください。"
                });                 
            }
            const isvalidpass = validatePassword(user_pass);
            if(!isvalidpass){
                err.push({
                    msg: "パスワードは英字または数字で6文字以上設定してください。"
                });                                 
            }
        }   
        return err;     
    }

    const fnshintourokupositive = async() =>{
        const err: Error[] = []; 
        const payload = {
            comp_id : 0
            ,comp_name : comp_name
            ,comp_address : comp_address
            ,comp_contactno : comp_contactno
            ,user_id : 0
            ,user_name : user_name
            ,user_pass : user_pass
            ,contactno : contactno
            ,emailadd : emailadd
            ,isadmin : 1
            ,isactive : 1
        }
        setIsLoading(true);        
        const valurl = apihost + 'api/validatecompany';
        try {
            const response = await fetch(valurl, { 
                method: "POST",
                headers: {
                    "Content-Type": "application/json", 
                },
                body: JSON.stringify(payload), 
            });            
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();            
    
            if (data.handlervalue === 2) {
                err.push({
                    msg: data.message
                });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            err.push({
                msg: "データの取得中にエラーが発生しました。"
            });                
        } finally {
            setIsLoading(false);
        }
        return err;
    }

    const fnshintouroku = async() =>{        
        const newErrors = fnvalidateinput();
        setModalTitle('お手数をおかけしますが、必要の入力ご確認ください。');
        setErrors(newErrors);
        setShowModal(newErrors.length>0);
        if(newErrors.length==0){            
            const responseerrorData = await fnshintourokupositive();            
            setModalTitle("登録中にエラーが発生しました");
            setErrors(responseerrorData);
            setShowModal(responseerrorData.length>0);
            if(responseerrorData.length==0){
                setSuccessReg(true);
            }
        }

    }
    return (
        <>           
        <CustomModal 
                errors={errors} 
                    title={modalTitle} 
                    show={showModal} 
                    onClose={() => setShowModal(false)} 
        />        
        <div className="newusertopheader">
            <h2>リフォームアプリ新規登録</h2>            
        </div>       
        { isSuccessReg && (
            <div className="container">
                <div className="row">
                    <p className="newuseraisatsu">
                    登録が完了しました。こちらからログインしてください。
                    </p>
                    <div className="col-md-3">
                    <a href="../" className="btn btn-primary"> ログイン　</a>
                    </div>
                    
                </div>
            </div>
        )}
        { !isSuccessReg && (
        <div className="container">            
            <div className="row">                                
                {isLoading && <LoadingIndicator />}                  
                <div className="col-md-12">
                    <p className="newuseraisatsu">
                    アプリにご関心をお寄せいただき、ありがとうございます。
                    システムをご利用いただくには、会社名および詳細情報の登録が必要です。
                    以下のフォームに必要事項をご記入ください。
                    </p>
                </div>
            </div>
            <div className="row">
                <div className="col-md-12">
                    <div className="card mb-3">                        
                        <label className="form-label">会社名</label>
                        <input type="text" className="form-control" id="comp_name" value={comp_name} onChange={handleChange}></input>
                    </div>
                </div>
                <div className="col-md-8">
                    <div className="card mb-3">                        
                        <label className="form-label">住所</label>
                        <input type="text" className="form-control" id="comp_address" value={comp_address} onChange={handleChange}></input>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card mb-3">                        
                        <label className="form-label">TEL</label>
                        <input type="text" className="form-control" id="comp_contactno" value={comp_contactno} onChange={handleChange}></input>
                    </div>
                </div>                
            </div>
            <div className="row">
                <div className="col-12">担当者</div>
                <div className="col-md-6 col-md-offset-6 ">
                    <div className="card mb-3">
                        <label className="form-label">お名前</label>
                        <input type="text" className="form-control" id="user_name" value={user_name} onChange={handleChange}></input>
                    </div>
                </div>            
                <div className="col-md-6 ">
                    <div className="card mb-3">
                        <label className="form-label">TEL</label>
                        <input type="text" className="form-control" id="contactno" value={contactno} onChange={handleChange}></input>
                    </div>
                </div>                
                <div className="col-md-6 ">
                    <div className="card mb-3">
                        <label className="form-label">メールアドレス</label>
                        <input type="text" className="form-control" id="emailadd" value={emailadd} onChange={handleChange}></input>
                    </div>
                </div>
                <div className="clearfix"></div>
                <div className="col-md-6 ">
                    <div className="card mb-3">
                        <label className="form-label">パスワード</label>
                        <input type="password" className="form-control" id="user_pass" value={user_pass} onChange={handleChange}></input>
                    </div>
                </div>
                <div className="col-md-6 ">
                    <div className="card mb-3">
                        <label className="form-label">パスワード再入力</label>
                        <input type="password" className="form-control" id="user_passc" value={user_passc} onChange={handleChange}></input>
                    </div>
                </div>                
            </div>
            <div className="row">
                <div className="col-12">
                    <div className="float-end">
                        <span className="btn btn-primary" onClick={fnshintouroku}> 
                        <span className="fa fa fa-sign-in"></span> 新規登録する                             
                        </span>
                    </div>                                        
                </div>

            </div>        
        </div> 
        )} 
        </>
    )
}

export default NewUser;