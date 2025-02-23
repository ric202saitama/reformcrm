import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import LoadingIndicator from "./LoadingIndicator";

const CustomermasterAgari = () =>{
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const customer_agari = JSON.parse(localStorage.getItem("customer_agari") || '{}');
    

    const handleNavigateback = () => navigate(customer_agari.backpage || '/');

    return (
        <>
        {isLoading && <LoadingIndicator />}
        <div className="container-fluid mb-3">
            <div className="row">
                <div className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
                    <div className="container-fluid">
                        <div className="col-6">
                            <span className="btn btn-light border" style={{width: "100px"}} onClick={handleNavigateback}> 戻る </span>
                        </div>
                        <div className="col-6">
                            <div className="float-end">
                                <span className="btn btn-success" style={{width: "100px"}}> 保存 </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

export default CustomermasterAgari;