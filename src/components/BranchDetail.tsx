import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from "axios";
import { apihost } from "../api/ServerLink";
import LoadingIndicator from "./LoadingIndicator";

import AddressSearchDialog from "./AddressDialog";

import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/ja";  // Make sure to import the ja locale from dayjs


dayjs.locale('ja'); // Set the locale globally

interface ApiResponse{
  handlervalue: number;
  br_id: string;
}

const BranchDetail = () => {
  document.title = "店舗詳細";
  const navigate = useNavigate();
  const storedToken = localStorage.getItem("logintoken");
  const storedbranchdetail = JSON.parse(localStorage.getItem("branchdetail") || '{}');   
  
  //for loading
  const [isLoading, setIsLoading] = useState(false);

  const [br_id,setBrId] = useState(storedbranchdetail.br_id);

  const [br_opendate, setBrOpendate] = useState<dayjs.Dayjs | null>(null);
  const [br_closedate, setBrClosedate] = useState<dayjs.Dayjs | null>(null);
  
  const [formData, setFormData] = useState({
    br_name: "",
    banchi: "",
    email : "",
    telno: "",
    faxno: ""
  });

  const { br_name, banchi, email, telno, faxno } = formData;    

  const [zipcode, setZipcode] = useState('');
  const [prefcitytown, setPrefcitytown] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  
  const handleChange = (event: { target: { id: any; type: any; checked: any; value: any; }; }) => {
      const { id, type, checked, value } = event.target;
      setFormData({
          ...formData,
          [id]: type === 'checkbox' ? checked : value
      });                        
  };  

  const handleAddressSelect = (add_zipcode: string, add_address: string) =>{        
    setZipcode(add_zipcode);
    setPrefcitytown(add_address);
    setOpenDialog(false);
  }
  
  const handleNavigateback = () =>{       
    navigate(storedbranchdetail.backpage || '/');       
  }

  const handleSaveBranch = async () => {
    const errmsg = [];
    if(br_name.trim()===""){
      errmsg.push("店舗名");
    }
    if(zipcode.trim() ===""){
      errmsg.push("店舗住所");
    }
    if(banchi.trim() ===""){
      errmsg.push("丁目・番地 直接");
    }
    if(telno.trim() ===""){
      errmsg.push("TEL");
    }
    if(email.trim() ===""){
      errmsg.push("メールアドレス");
    }
    if(br_opendate === null){
      errmsg.push("開店日");
    }
    if(errmsg.length>0){
      var errhtml = "必須項目、入力してください。<ul>";
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
          token : logintoken.token
          ,br_id : br_id
          ,br_name : br_name          
          ,zipcode : zipcode          
          ,prefcitytown : prefcitytown          
          ,banchi : banchi
          ,email : email
          ,telno : telno
          ,faxno : faxno
          ,br_opendate : br_opendate ? br_opendate.format('YYYY-MM-DD') : null
          ,br_closedate : br_closedate ? br_closedate.format('YYYY-MM-DD') : null
        }
        const valurl = `${apihost}api/saveBranch`;
        await axios.post<ApiResponse>(valurl, payload)
        .then((response)=>{
          setIsLoading(false);
          const result = response.data;
          setBrId(result.br_id);
          if(result.handlervalue==1){
            Swal.fire({            
                icon: "success",
                title: "情報を保存されました。",
                showConfirmButton: false,
                timer: 1500
            });   
          } else {
            Swal.fire({
                icon: "error",
                title: "エラー",
                text: "情報を保存できませんでした。",
                showCloseButton: true,
                confirmButtonText: '閉じる'
            });                                        
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
      } catch(error){
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

  const handleLoad = ()=>{
    setFormData({
      br_name: storedbranchdetail.br_id == 0 ? "" : storedbranchdetail.br_name,
      banchi: storedbranchdetail.br_id == 0 ? "" : storedbranchdetail.banchi,
      email : storedbranchdetail.br_id == 0 ? "" : storedbranchdetail.email,
      telno: storedbranchdetail.br_id == 0 ? "" : storedbranchdetail.telno,
      faxno: storedbranchdetail.br_id == 0 ? "" : storedbranchdetail.faxno
    });
    setZipcode(storedbranchdetail.br_id == 0 ? "" : storedbranchdetail.zipcode);
    setPrefcitytown(storedbranchdetail.br_id == 0 ? "" : storedbranchdetail.prefcitytown);
    
    // Handle br_opendate
    if (storedbranchdetail.br_id == 0 || !storedbranchdetail.br_opendate) {
      setBrOpendate(null); // Set to null if no date is available
    } else {
      // Convert the date string to a dayjs object
      const openDate = dayjs(storedbranchdetail.br_opendate);
      setBrOpendate(openDate.isValid() ? openDate : null); // Ensure the date is valid
    }
  
    // Handle br_closedate (if needed)
    if (storedbranchdetail.br_id == 0 || !storedbranchdetail.br_closedate) {
      setBrClosedate(null); // Set to null if no date is available
    } else {
      // Convert the date string to a dayjs object
      const closeDate = dayjs(storedbranchdetail.br_closedate);
      setBrClosedate(closeDate.isValid() ? closeDate : null); // Ensure the date is valid
    }
    
  }

  useEffect(() => {
    handleLoad();
}, []);

  return (
    <>         
    {isLoading && <LoadingIndicator />}  
    <div className="container-fluid">
      <div className="row">
        <div className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
            <div className="container-fluid">
              <div className="col-6">
                <span className="btn btn-light" style={{width: "100px"}} onClick={handleNavigateback}> 戻る </span>
              </div>
              <div className="col-6">
                <div className="float-end">
                  <span className="btn btn-primary" style={{width: "100px"}} onClick={handleSaveBranch}> 保存 </span>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
    <div className="container-fluid">
      <div className="row">
          <div className="col-md-3 mb-3">
            <div className="form-group">
              <label>店舗名</label>
              <input 
                type="text" 
                className="form-control" 
                id="br_name" 
                autoComplete="off" 
                value={br_name}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="clearfix"></div>
          <div className="col-md-2 mb-3">
            <div className="form-group">
              <label>郵便番号</label>
              <div className="input-group">
                <span                   
                  className="form-control" 
                  id="zipcode"                                     
                >
                {zipcode}
                </span>
                <span className="input-group-btn">
                  <button 
                    className="btn btn-primary" 
                    type="button" 
                    id="btnSearchZip"
                    onClick={() => setOpenDialog(true)} // Open dialog
                  >
                  <span className="bi bi-search"></span>                
                  </button>
                </span>
              </div>              
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="form-group">
              <label>都道府県/市区町村</label>
              <input 
                type="text" 
                className="form-control" 
                id="prefcitytown" 
                autoComplete="off"
                value={prefcitytown}
                disabled
                style={{backgroundColor: "#ffffff"}}
              />
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="form-group">
              <label>丁目・番地 直接入力</label>
              <input 
                type="text" 
                className="form-control" 
                id="banchi" 
                value={banchi}
                autoComplete="off"
                onChange={handleChange}                           
              />
            </div>
          </div>
          <div className="clearfix"></div>
          <div className="col-md-3 mb-3">
            <div className="form-group">
              <label>メールアドレス</label>
              <input 
                type="email" 
                className="form-control" 
                id="email" 
                value={email}
                autoComplete="off" 
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="form-group">
              <label>TEL</label>
              <input 
                type="telno" 
                className="form-control" 
                id="telno" 
                value={telno}
                autoComplete="off" 
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="form-group">
              <label>FAX</label>
              <input 
                type="faxno" 
                className="form-control" 
                id="faxno" 
                value={faxno}
                autoComplete="off" 
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="clearfix"></div>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
            <div className="col-md-2 mb-3">
              <div className="form-group">
                <label>開店日</label>
                <DatePicker                  
                  value={br_opendate}
                  onChange={(newDate) => setBrOpendate(newDate)}
                  format="YYYY/MM/DD"
                  views={["year", "month", "day"]}
                  slotProps={{
                    textField: { fullWidth: true, variant: "outlined" },
                    actionBar: {
                      actions: ["clear"], // Show only the "clear" action
                    },
                  }}
                  // Override the clear button text
                  localeText={{
                    clearButtonLabel: "クリア", // Customize the clear button text to "クリア"
                  }}                  
                />
              </div>
            </div>                         
            <div className="col-md-2 mb-3">
              <div className="form-group">
                <label>閉店日</label>
                <DatePicker
                  value={br_closedate}
                  onChange={(newDate) => setBrClosedate(newDate)}
                  format="YYYY/MM/DD"
                  views={["year", "month", "day"]}
                  slotProps={{
                    textField: { fullWidth: true, variant: "outlined" },
                    actionBar: {
                      actions: ["clear"], // Show only the "clear" action
                    },
                  }}
                  // Override the clear button text
                  localeText={{
                    clearButtonLabel: "クリア", // Customize the clear button text to "クリア"
                  }}                  
                />
              </div>
            </div> 
          </LocalizationProvider>                          
      </div>
    </div>  
    {/* Address Search Dialog */}
    {openDialog && (
        <AddressSearchDialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          setZipcode={setZipcode}
          setAddress={setPrefcitytown}
          onSelect={handleAddressSelect} // Pass the onSelect function
          apihostts={apihost} // Pass the API host
        />
      )}  
      
      </>   
    );  
};

export default BranchDetail;