import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import LoadingIndicator from "./LoadingIndicator";
import AddressSearchDialog from "./AddressDialog";
import UserSearchDialog from "./UserDialog";
import { apihost,apigeocodingapikey } from "../api/ServerLink";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ja";
import { convertToHalfWidthKatakana } from "../utils/ConvertToHalfWidthKatakana";
import Swal from 'sweetalert2';

import { DataGrid, GridColDef } from "@mui/x-data-grid";

import { jaJP } from '@mui/x-data-grid/locales';

dayjs.locale('ja');

interface BranchMaster {
    br_id: string;
    br_name: string;
}

interface BranchApiResponse {
    handlervalue: number;
    message: string;
    branchdata: BranchMaster[];
}

interface FormData {
    cus_lname: string;
    cus_fname: string;
    cus_lname_kana: string;
    cus_fname_kana: string;
    banchi: string;
    contactno : string;
    faxno : string;
    email : string;
}

interface ApiResponse{
    handlervalue: number;
    cus_id : string;
}

interface ApiLatLng {
    resourceSets: {
        resources: {
            point: {
                coordinates: [number, number];
            };
        }[];
    }[];
}

interface CusInfoApi{
    handlervalue : number;
    cusinfo : any[];
    canbecancelled : number;
}

interface SoudanList{
    kanrino : string;
    closingdate : string;
    est_price : number;
    salesdate : string;
    salesamount : number;
    zandaka : number;
    canceldate : string;
    cancelreason : string;
    koujinaiyou : string;
}

interface SoudanApi{
    handlervalue : number;
    genbalist : SoudanList[];
    genbacount : number;
}

const CustomerMasterInput: React.FC = () => {
    const navigate = useNavigate();
    const storedToken = localStorage.getItem("logintoken");
    const logintoken = JSON.parse(storedToken || '{}');
    const customerdetail = JSON.parse(localStorage.getItem("customer") || '{}');
    
    const [isdeleted, setDeleted] = useState(false);    
    const [cus_id, setCusID] = useState<string>(customerdetail.cus_id || '');
    const [birthdate, setBrOpendate] = useState<Dayjs | null>(null);
    const [mapenabled, SetMapEnabled] = useState(false);
    const [addsoudan, SetAddSoudan] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        cus_lname: "",
        cus_fname: "",
        cus_lname_kana: "",
        cus_fname_kana: "",
        banchi: "",
        contactno: "",
        faxno: "",
        email : ""
    });
    
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = event.target;

        // console.log(`Input ID: ${id}, Value: ${value}`);
        setFormData(prevState => ({
            ...prevState,
            [id]: value
        }));

        convertToHalfWidthKatakana(value).then(katakanaValue => {
            // console.log(`Converted to Half-width Katakana: ${katakanaValue}`);
            setFormData(prevState => {
                const newState = { ...prevState };
                if (id === "cus_lname") {
                    newState.cus_lname_kana = katakanaValue;
                }
                if (id === "cus_fname") {
                    newState.cus_fname_kana = katakanaValue;
                }
                return newState;
            });
        }).catch(error => {
            console.error("Conversion error:", error);
        });
    };

    const { cus_lname, cus_fname, cus_lname_kana, cus_fname_kana, banchi,contactno,faxno, email } = formData;

    const [zipcode, setZipcode] = useState<string>('');
    const [prefcitytown, setPrefcitytown] = useState<string>('');
    const [openDialog, setOpenDialog] = useState<boolean>(false);

    const handleAddressSelect = (add_zipcode: string, add_address: string) => {
        setZipcode(add_zipcode);
        setPrefcitytown(add_address);
        setOpenDialog(false);
    };

    const [user_id, setUserId] = useState<string>('');
    const [user_name, setUserName] = useState<string>('');
    const [openDialogUser, setOpenDialogUser] = useState<boolean>(false);

    const handleUserSelect = (add_user_id: string, add_user_name: string) => {
        setUserId(add_user_id);
        setUserName(add_user_name);
        setOpenDialogUser(false);
    };

    const [dropdownValue, setDropdownValue] = useState<string>("0");
    const [dropdownOptions, setDropdownOptions] = useState<BranchMaster[]>([]);

    const getbranchlist = async () => {
        if (!storedToken) throw new Error("No token found");        
        const payload = { 
            token: logintoken.token,
            searchkey: "",
            page: 0,
            pageSize: 5000            
        };
        const url = apihost + "api/getbranchlist";
        
        try {
            const response = await axios.post<BranchApiResponse>(url, payload);
            const result = response.data;
            if (result.handlervalue === 1) {
                setDropdownOptions(result.branchdata);   
                getcustomerinfo();                               
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const getcustomerinfo = async() =>{
        if(cus_id != "0"){
            //基本情報表示する
            //現場管理リスト表示する
            const payload = {
                token : logintoken.token
                ,cus_id : cus_id
            }
            //CusInfoApi
            setIsLoading(true);
            const valurl = `${apihost}customer/getCusInfo`;
            await axios.post<CusInfoApi>(valurl, payload)
            .then((response)=>{
                const result = response.data;
                if(result.handlervalue==1){
                    const cusinfo = result.cusinfo.length > 0 ? result.cusinfo[0] : null;
                    setDropdownValue(cusinfo.br_id);
                    setPrefcitytown(cusinfo.prefcitytown);
                    setZipcode(cusinfo.zipcode);
                    const abday = dayjs(cusinfo.birthdate);
                    setBrOpendate(abday.isValid() ? abday : null);
                    setUserName(cusinfo.user_name);
                    setUserId(cusinfo.tanto_id);
                    if(cusinfo.deleted_datetime !="0000-00-00 00:00:00"){
                        setDeleted(true);
                    }
                    setFormData({
                        ...formData
                        ,cus_lname : cusinfo.cus_lname
                        ,cus_fname : cusinfo.cus_fname
                        ,cus_lname_kana : cusinfo.cus_lname_kana
                        ,cus_fname_kana : cusinfo.cus_fname_kana
                        ,banchi : cusinfo.banchi
                        ,contactno : cusinfo.contactno
                        ,faxno : cusinfo.faxno
                        ,email : cusinfo.email
                    });
                    SetMapEnabled(true);
                    SetAddSoudan(true);
                    fetchgenbalist();
                }
                setIsLoading(false);
                
            })
            .catch((error) => {
                console.log(error);
                setIsLoading(false);
            });
        }
    }

    if (!customerdetail.cus_id) navigate("/");

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleNavigateback = () => navigate(customerdetail.backpage || '/');

    const handleGeoCoding = async() =>{
        const geoAddress = "〒"+zipcode+" "+prefcitytown+banchi;
        let geolat = "";
        let geolng = "";             
        const geoconfig = `https://dev.virtualearth.net/REST/v1/Locations?q=${geoAddress}&culture=ja&key=${apigeocodingapikey}`;        
        try {
            const response = await axios.get<ApiLatLng>(geoconfig);
            const result = response.data;
            geolat = result.resourceSets[0].resources[0].point.coordinates[0].toString();
            geolng = result.resourceSets[0].resources[0].point.coordinates[1].toString();
        } catch (error) {
            console.error(`GeoCoding イラー${error}`);
        }
        return [geolat, geolng];
    }

    const handleSaveUser = async () => { 
        const errmsg = [];
        if(cus_lname.trim() ==""){
            errmsg.push("名前（姓）");
        }
        if(cus_fname.trim() ==""){
            errmsg.push("名前（名）");
        }        
        if(cus_lname_kana.trim() ==""){
            errmsg.push("名前（姓）カナ");
        }
        if(cus_fname_kana.trim() ==""){
            errmsg.push("名前（名）カナ");
        }         
        if(prefcitytown.trim()==""){
            errmsg.push("都道府県/市区町村");
        }
        if(banchi.trim()==""){
            errmsg.push("丁目・番地 直接入力");
        } 
        if(contactno.trim()=="" && faxno.trim()=="" && email.trim()==""){
            errmsg.push("TEL・FAX・メール");
        } 

        if(user_name==""){
            errmsg.push("担当者");
        } 
        if(dropdownValue=="0"){
            errmsg.push("管理店");
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
            /*** エンドポイント保存 ***/
            setIsLoading(true);
            const [lat, lng] = await handleGeoCoding();
            const payload ={
                token : logintoken.token
                ,cus_id : cus_id
                ,cus_lname : cus_lname
                ,cus_fname : cus_fname
                ,cus_lname_kana : cus_lname_kana
                ,cus_fname_kana : cus_fname_kana
                ,zipcode : zipcode
                ,prefcitytown : prefcitytown
                ,banchi : banchi
                ,contactno : contactno
                ,faxno : faxno
                ,email : email
                ,tanto_id : user_id
                ,br_id : dropdownValue
                ,lat : lat
                ,lng : lng
                ,birthdate : birthdate ? birthdate.format('YYYY-MM-DD') : null                
            }
                        
            const valurl = `${apihost}customer/saveCustomer`;
            await axios.post<ApiResponse>(valurl, payload)
            .then((response)=>{                
                setIsLoading(false);
                const result = response.data;
                if(result.handlervalue==1){
                    setCusID(result.cus_id);
                    SetMapEnabled(true);
                    SetAddSoudan(true);
                    fetchgenbalist();
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
            
        }
     };
    const handleviewinmap = () => { 
        const mapadd = prefcitytown+banchi;
        const mapurl = `https://www.google.com/maps?q=${encodeURIComponent(mapadd)}`;
        window.open(mapurl, '_blank');  
    };

    /***** 相談グリッド ******/
    const [rows, setRows] = useState<SoudanList[]>([]);
    const [rowCount, setRowCount] = useState(0); // Total row count for pagination
    const [pageSize, setPageSize] = useState(100);
    const [page, setPage] = useState(0);

    const [selectionModel, setSelectionModel] = useState<any>([]);
    const columns: GridColDef[] = [
        { 
            field: "kanrino"
            ,headerName: "現場コード"
            ,headerAlign: "center"
            ,align : "right"
            ,flex: 1
            ,minWidth: 60 
        },
        { 
            field: "closingdate"
            ,headerName: "商談予定日(クロージング)"
            ,headerAlign: "center"
            ,align : "center"            
            ,flex: 1, minWidth: 110 
            ,renderHeader: () => (
                <div style={{ whiteSpace: 'pre-wrap', textAlign: 'center' }}>
                  商談予定日
                  <br />
                  (クロージング)
                </div>
            )
        },
        { 
            field: "est_price"
            ,headerName: "見込金額"
            ,flex: 1
            ,minWidth: 100 
            ,headerAlign: "center"
            ,align : "right"            
        },        
        { 
            field: "salesdate"
            ,headerName: "契約日"
            ,flex: 1
            ,minWidth: 100 
            ,headerAlign: "center"
            ,align : "center"            
        },        
        { 
            field: "salesamount"
            ,headerName: "契約合計金額"
            ,flex: 1
            ,minWidth: 100 
            ,headerAlign: "center"
            ,align : "right"            
        },        
        { 
            field: "zandaka"
            ,headerName: "回収残高"
            ,flex: 1
            ,minWidth: 100 
            ,headerAlign: "center"
            ,align : "right"            
        },        
        { 
            field: "canceldate"
            ,headerName: "キャンセル日"
            ,flex: 1
            ,minWidth: 100 
            ,headerAlign: "center"
            ,align : "center"            
        },        
        { 
            field: "cancelreason"
            ,headerName: "キャンセルの理由"
            ,flex: 1
            ,minWidth: 150 
            ,headerAlign: "center"
            ,align : "left"            
        },        
        { 
            field: "koujinaiyou"
            ,headerName: "工事内容"
            ,flex: 1
            ,minWidth: 120 
            ,headerAlign: "center"
            ,align : "center"            
        }
    ];    

    const fetchgenbalist = async() =>{
        try{
            const payload ={
                token : logintoken.token
                ,cus_id : cus_id
                ,page : page 
                ,pageSize: pageSize                     
            }
            const valurl = `${apihost}customer/getGenbaList`;
            await axios.post<SoudanApi>(valurl, payload)
            .then((response)=>{    
                const result = response.data;
                if(result.handlervalue==1){
                    setRows(result.genbalist);
                    setRowCount(result.genbacount);
                }
            })
            .catch((error) => {
                console.log(error);
            });
        } catch(error){
            console.log(error);
        }
    }

    /***** 相談グリッド ******/

    /*** 現場追加機能 ****/
    const handleNewGenba = () =>{
        //本当に新しい現場管理を追加しますか？これにより、管理する現場が新しく増えます。
        Swal.fire({
            icon: "info",
            title: "確認",
            html: "<div style='text-align: left;'>本当に新しい現場管理を追加しますか？<br>これにより、管理する現場が新しく増えます。</div>",            
            showCancelButton: true,
            confirmButtonText: "はい、追加する",
            cancelButtonText: `閉じる`,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33"
        }).then((result) => {
            if(result.isConfirmed)   {
                handleNewGenbaPositive(0);
            }
        });        
    }

    const handleNewGenbaPositive = (kanrino: number) => {
        const customer_agari = {
            cus_id : cus_id
            ,kanrino : kanrino
            ,backpage : "/customermasterinput"            
        }        
        localStorage.setItem("customer_agari", JSON.stringify(customer_agari));
    }

    /*** エンド現場追加機能 ****/
    
    /** 非稼働機能***/
    const handleCanbeInactive = async() =>{
        //インドポイントチェック非稼働可能かのか
        const payload ={
            token : logintoken.token
            ,cus_id : cus_id
        }
        setIsLoading(true);
        const valurl = `${apihost}customer/canbeCancelled`;
        await axios.post<CusInfoApi>(valurl, payload)    
        .then((response)=>{    
            const result = response.data;
            if(result.canbecancelled==0){
                //非稼働可能、理由は入力する
                Swal.fire({       
                    icon : "info",
                    title: "非稼働の理由をご入力いただけますでしょうか。",
                    input : "textarea",
                    showCancelButton: true,
                    confirmButtonText: "非稼働する",
                    cancelButtonText: `閉じる`,
                    confirmButtonColor: "#808080",
                    cancelButtonColor: "#d33",
                    preConfirm: async (delete_reason) => {
                        if(delete_reason.trim()!==""){                        
                            const payload = {
                                token: logintoken.token 
                                ,cus_id : cus_id
                                ,delete_reason : delete_reason
                            }
                            const valurl = `${apihost}customer/customermasterDelete`;
                            await axios.post<CusInfoApi>(valurl, payload)
                            .then((response)=>{
                                const result = response.data;
                                if(result.handlervalue==1) {
                                    setDeleted(true);    
                                    Swal.fire({            
                                        icon: "success",
                                        title: "お客様情報が非稼働となりました。",
                                        showConfirmButton: false,
                                        timer: 1500
                                    });                                                            
                                } else {
                                    throw new Error("お客様情報が非稼働設定できませんでした");
                                }
                            })
                            .catch((error)=>{
                                //console.log(error)
                                Swal.fire({            
                                    icon: "error",
                                    title: error,
                                    showConfirmButton: false,
                                    showCancelButton: true,
                                    cancelButtonText: `閉じる`
                                });                                 
                            })                            
                        }
                    }
                    ,allowOutsideClick : false                                                      
                });                
            } else {
                Swal.fire({
                    icon: "error",
                    title: "エラー",
                    html: "<div style='text-align: left;'>非稼働に設定できません。大変恐縮ですが、現場リストがキャンセルされていないようです。すべての現場をご確認の上、キャンセルしていただけますでしょうか。</div>",
                    showCloseButton: true,
                    confirmButtonText: 'はい、分かりました。'
                }); 
            }
            setIsLoading(false);
        })
        .catch((error) => {
            setIsLoading(false);
            console.log(error);
        });

    }
    
    const handleSetActive = () =>{
        //稼働する
        Swal.fire({
            icon: "info",
            title: "確認",
            html: "<div style='text-align: left;'>このお客様情報を稼働に設定いたしますが、よろしいでしょうか？</div>",            
            showCancelButton: true,
            confirmButtonText: "はい、稼働にする",
            cancelButtonText: `閉じる`,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33"
        }).then((result) => {
            if(result.isConfirmed)   {
                handleSetActivePositive();
            }
        });
    }

    const handleSetActivePositive = async() => {
        const payload ={
            token : logintoken.token
            ,cus_id : cus_id
        }
        setIsLoading(true);
        const valurl = `${apihost}customer/customermasterUndelete`;
        await axios.post<CusInfoApi>(valurl, payload)        
        .then((response)=>{
            const result = response.data;
            if(result.handlervalue==1) {
                setDeleted(true);    
                Swal.fire({            
                    icon: "success",
                    title: "お客様情報が稼働に設定されました。",
                    showConfirmButton: false,
                    timer: 1500
                });                                                            
            } else {
                throw new Error("お客様情報を稼働に設定できませんでした。");
            }
            setIsLoading(false);
        }) 
        .catch((error)=>{
            //console.log(error)
            setIsLoading(false);
            Swal.fire({            
                icon: "error",
                title: error,
                showConfirmButton: false,
                showCancelButton: true,
                cancelButtonText: `閉じる`
            });                                 
        });

    }

    /** エンド非稼働機能***/
    useEffect(() => {
        getbranchlist();  
        localStorage.removeItem("customer_agari");            
    }, []);    

    return (
        <>
            {isLoading && <LoadingIndicator />}
            <div className="container-fluid mb-3">
                <div className="row">
                    <div className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
                        <div className="container-fluid">
                            <div className="col-3">
                                <span className="btn btn-light border" style={{width: "100px"}} onClick={handleNavigateback}> 戻る </span>
                            </div>
                            <div className="col-3">
                                {isdeleted==false && (
                                <span className="btn btn-light border" onClick={handleCanbeInactive}> 非稼働する </span>
                                )}
                                {isdeleted==true && (
                                <span className="btn btn-light border" onClick={handleSetActive}> 稼働する </span>
                                )}                                
                            </div>                            
                            <div className="col-6">
                                <div className="float-end">
                                    <span className="btn btn-success" style={{width: "100px"}} onClick={handleSaveUser}> 保存 </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-3 mb-3">
                        <div className="input-group">
                            <div className="input-group-text">顧客番号</div>
                            <span className="form-control">{cus_id}</span>
                        </div>
                    </div>
                    <div className="clearfix"></div>
                    <div className="col-md-5 mb-3">
                        <label className="form-label text-danger">名前（姓）</label>
                        <input
                            type="text"
                            className="form-control"
                            id="cus_lname"
                            value={cus_lname}
                            autoComplete="off"
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col-md-5 mb-3">
                        <label className="form-label text-danger">名前（名）</label>
                        <input
                            type="text"
                            className="form-control"
                            id="cus_fname"
                            value={cus_fname}
                            autoComplete="off"
                            onChange={handleChange}
                        />
                    </div>
                    <div className="clearfix"></div>
                    <div className="col-md-5 mb-3">
                        <label className="form-label text-danger">名前（姓）カナ （小文字 ｶﾀｶﾅ入力必須）</label>
                        <input
                            type="text"
                            className="form-control"
                            id="cus_lname_kana"
                            value={cus_lname_kana}
                            autoComplete="off"
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col-md-5 mb-3">
                        <label className="form-label text-danger">名前（名）カナ （小文字 ｶﾀｶﾅ入力必須）</label>
                        <input
                            type="text"
                            className="form-control"
                            id="cus_fname_kana"
                            value={cus_fname_kana}
                            autoComplete="off"
                            onChange={handleChange}
                        />
                    </div>
                    <div className="clearfix"></div>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
                <div className="col-md-2 mb-3">
                    <div className="form-group">
                        <label>生年月日</label>
                        <DatePicker   
                        value={birthdate}                                 
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
                </LocalizationProvider>                               
                <div className="clearfix"></div>
                <div className="col-md-2 mb-3">
                    <div className="form-group">
                        <label className="text-danger">郵便番号</label>
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
                <div className="col-md-4 mb-3">
                    <div className="form-group">
                    <label className="text-danger">都道府県/市区町村</label>
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
                    <label className="text-danger">丁目・番地 直接入力</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        id="banchi"                     
                        autoComplete="off"     
                        value={banchi} 
                        onChange={handleChange}              
                    />
                    </div>
                </div>
                <div className="cleafix"></div>
                <div className="col-md-2 mb-3">
                    <button className={`btn btn-primary w-100 ${mapenabled==false ? "disabled" : ""}`} onClick={handleviewinmap}>
                    <span className="bi bi-pin-map"></span> 住所地図で見る
                    </button>
                </div>
                <div className="col-md-2 mb-3">
                    <div className="input-group">
                        <div className="input-group-text text-danger">TEL</div>
                        <input 
                            type="tel"
                            className="form-control"
                            id="contactno"
                            autoComplete="off"
                            placeholder="080-0000-0000"  
                            value={contactno}    
                            onChange={handleChange}                       
                        />
                    </div>
                </div>
                <div className="col-md-2 mb-3">
                    <div className="input-group">
                        <div className="input-group-text text-danger">FAX</div>
                        <input 
                            type="tel"
                            className="form-control"
                            id="faxno"
                            autoComplete="off"
                            placeholder="000-0000-0000"           
                            value={faxno}         
                            onChange={handleChange}         
                        />
                    </div>
                </div>            
                <div className="col-md-4 mb-3">
                <div className="input-group">
                        <div className="input-group-text text-danger">メール</div>
                        <input 
                            type="tel"
                            className="form-control"
                            id="email"
                            autoComplete="off"
                            placeholder="abc@a.com"    
                            value={email}      
                            onChange={handleChange}                   
                        />
                    </div>                
                </div>   
                <div className="clearfix"></div>
                <div className="col-md-4 mb-3">
                    <div className="form-group">                    
                        <div className="input-group">
                            <div className="input-group-text text-danger">担当者</div>
                            <span                   
                            className="form-control" 
                            id="tantou_name"                              
                            >     
                            {user_name}               
                            </span>
                            <span className="input-group-btn">
                            <button 
                                className="btn btn-primary" 
                                type="button"  
                                onClick={() => setOpenDialogUser(true)} // Open dialog User                       
                            >
                            <span className="bi bi-search"></span>                
                            </button>
                            </span>
                        </div>              
                    </div>   
                </div>
                <div className="col-md-4 mb-3">
                    <div className="input-group">
                        <span className="input-group-text text-danger">管理店</span>
                        <select className="form-select" onChange={(e) => setDropdownValue(e.target.value)} value={dropdownValue}>
                            <option key="0" value="0"></option>
                        {dropdownOptions.map((option) => (
                            <option key={option.br_id} value={option.br_id}>
                                {option.br_name}
                            </option>
                        ))}                        
                        </select>
                    </div>
                </div>

                </div>{/*** row ***/}
                <div className="row">{/** new row for genba list */}
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-header">現場一覧</div>
                            <div className="card-body border">
                                <div className="col-md-3 mb-3">
                                    <button className={`btn btn-light border ${addsoudan==false ? "disabled" : ""}`} onClick={handleNewGenba}>
                                        <span className="bi bi-house-add"></span> 現場管理追加
                                    </button>
                                </div>
                                <div className="clearfix"></div>
                                <DataGrid
                                    rows={rows}
                                    columns={columns}
                                    getRowId={(row) => row.kanrino}                        
                                    rowCount={rowCount} // This provides the total count for pagination                        
                                    paginationModel={{ page, pageSize }}
                                    paginationMode="server" // Enable server-side pagination                                                                                    
                                    onPaginationModelChange={(model) => {
                                        setPage(model.page);
                                        setPageSize(model.pageSize);
                                    }}
                                    rowSelectionModel={selectionModel}
                                    onRowSelectionModelChange={(newSelection) => setSelectionModel(newSelection)}                        
                                    disableColumnMenu
                                    hideFooterSelectedRowCount 
                                    localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
                                    
                                />
                            </div>{/** card-body **/}
                        </div>                    
                    </div>
                </div>{/** new row for genba list */}

            </div>

            {openDialog && (
                <AddressSearchDialog 
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    setZipcode={setZipcode}
                    setAddress={setPrefcitytown}
                    onSelect={handleAddressSelect}
                    apihostts={apihost}
                />
            )}

            {openDialogUser && (
                <UserSearchDialog 
                    open={openDialogUser}
                    onClose={() => setOpenDialogUser(false)}
                    setUserId={setUserId}
                    SetUserName={setUserName}
                    onSelect={handleUserSelect}
                    apihostts={apihost}
                />
            )}
        </>
    );
};

export default CustomerMasterInput;