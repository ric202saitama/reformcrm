import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../components/AuthContext";
import { useNavigate } from "react-router-dom";

const NagivationBar = () => {
    const { userName,setLogin, setUserName } = useContext(AuthContext)!;      
    const [isUserNameLoaded, setIsUserNameLoaded] = useState(false); 
    const navigate = useNavigate();    

    useEffect(() => {
        if (userName) {
            setIsUserNameLoaded(true); // Set to true once userName is available
        } 
    }, [userName]);

    const handleLogout = () => {
      localStorage.removeItem("logintoken"); // Clear token
      setLogin(false); //
      setUserName("");
      navigate("/"); // Redirect to login page
    };
    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container-fluid">
                    
                    <a className="navbar-brand" href="/dashboard">リフォーム</a>

                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>        

                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <a className="nav-link" href="/dashboard"><span className="bi bi-graph-up-arrow"></span> ダッシュボード</a>
                            </li>                            
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle"  data-bs-toggle="dropdown" role="button" aria-expanded="false" href="#"><span className="bi bi-people-fill"></span> 設定管理</a>
                                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                                    <li><a className="dropdown-item" href="/usermanage"><span className="bi bi-person"></span> ユーザー管理</a></li>
                                    <li><hr className="dropdown-divider" /></li> 
                                    <li><a className="dropdown-item" href="/branchmaster"><span className="bi bi-shop"></span> 店舗管理</a></li>
                                    <li><hr className="dropdown-divider" /></li> 
                                    <li><a className="dropdown-item" href="#"><span className="bi bi-buildings"></span> 取引先マスター</a></li>
                                </ul>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/customermaster"><span className="bi bi-houses"></span> 顧客管理</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#"><span className="bi bi-speedometer2"></span> 商談管理</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#"><span className="bi bi-file-earmark-text"></span> 契約管理</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#"><span className="bi bi-house-gear"></span> 現場管理</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#"><span className="bi bi-table"></span> 回収管理</a>
                            </li>                            
                        </ul>
                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i className="fa fa-user"></i>
                                </a>
                                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                                    <li className="d-flex justify-content-center">{isUserNameLoaded ? userName: null}</li>
                                    <li><hr className="dropdown-divider" /></li> 
                                    <li><a className="dropdown-item" href="/passwordchange"><span className="fa fa-user-circle"></span> パスワード変更</a></li>
                                    <li><a className="dropdown-item" onClick={handleLogout}><span className="fa fa-sign-out"></span> ログアウト</a></li>
                                    
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>        
        </>
    )
}

export default NagivationBar;