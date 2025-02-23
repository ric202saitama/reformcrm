
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Button, Checkbox, FormControl, InputLabel, MenuItem, Select, TextField, FormControlLabel, SelectChangeEvent } from "@mui/material";
import { jaJP } from '@mui/x-data-grid/locales';
import { apihost } from "../api/ServerLink";

interface Customer{    
    br_id : string;
    br_name : string;
    shoudancnt : number;
    salescnt : number;
    cancelcnt : number;
    cus_id : string;
    cus_name : string;
    cus_namekana : string;
    address : string;
    contactno : string;
    zandaka : number;
}

interface BranchMaster{
    br_id : string;
    br_name : string;
}

interface BranchApiResponse {
    handlervalue: number;
    message: string;
    branchdata: BranchMaster[];
}

interface ApiResponse{
    handlervalue: number;
    message: string;
    customerlist : Customer[]; 
    totalrows : number;   
}

const CustomerMater = () =>{
    /** 基本　バリアブル****/
    const navigate = useNavigate();
    const storedToken = localStorage.getItem("logintoken");
    const customerdetail = JSON.parse(localStorage.getItem("customer") || '{}');    

    const [formData, setFormData] = useState({ searchkey: "" });
    const { searchkey } = formData;
    const [isactive, checkIsactive] = useState(true);
    
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [event.target.id]: event.target.value });
    };
    const handleCheckIsactive = (event: React.ChangeEvent<HTMLInputElement>) => {
        checkIsactive(event.target.checked);
    };    

    /** drop down 管理店 **/
    const [dropdownValue, setDropdownValue] = useState("0"); // Default to "すべて"
    const [dropdownOptions, setDropdownOptions] = useState<BranchMaster[]>([]);
    
    const handleDropdownChange = (event: SelectChangeEvent<string>) => {
        setDropdownValue(event.target.value as string);
    };

    const getbranchlist = async() =>{
        if (!storedToken) {
            throw new Error("No token found");
        }
        const logintoken = JSON.parse(storedToken);
        const payload = { 
            token: logintoken.token
            ,searchkey: searchkey
            ,page: 0
            ,pageSize: 5000            
        };
        const url = apihost + "api/getbranchlist";        
        axios.post<BranchApiResponse>(url, payload)
        .then((response) => {
            const result = response.data;
            if (result.handlervalue === 1) {                    
                setDropdownOptions(response.data.branchdata); 
            } else {
                throw new Error(result.message);                    
            }
        })
        .catch((error) => {
            console.error(error);
        });
    }    

    useEffect(() => {
        getbranchlist();        
        if(customerdetail.br_id!=undefined){
            setDropdownValue(customerdetail.br_id);
            setFormData({ 
                searchkey: customerdetail.searchkey
            });
            checkIsactive(customerdetail.isactive);
            // fetch grid data
            //remove local storage for branchdetail            
        } else {
            setDropdownValue("0");
        }
        localStorage.removeItem("customer");    
        document.title = "顧客管理";        
    }, []);    

    /** drop down 管理店 **/

    /*** grid バリアブル ***/
    const [rows, setRows] = useState<Customer[]>([]);
    const [rowCount, setRowCount] = useState(0); // Total row count for pagination
    const [pageSize, setPageSize] = useState(100);
    const [page, setPage] = useState(0);   

    const [selectionModel, setSelectionModel] = useState<any>([]);
    const columns: GridColDef[] = [
        { 
            field: "br_name"
            ,headerName: "管理店"
            ,flex: 1
            ,minWidth: 100 
            ,headerAlign: "center"
            ,align : "left"            
        },
        { 
            field: "shoudancnt"
            ,headerName: "商談件数"
            ,flex: 1
            ,minWidth: 100 
            ,headerAlign: "center"
            ,align : "right"            
        },
        { 
            field: "salescnt"
            ,headerName: "契約回数"
            ,flex: 1
            ,minWidth: 100 
            ,headerAlign: "center"
            ,align : "right"            
        },
        { 
            field: "cancelcnt"
            ,headerName: "キャンセル件数"
            ,flex: 1
            ,minWidth: 100 
            ,headerAlign: "center"
            ,align : "right"            
        },
        { field: "cus_id", headerName: "顧客コード", flex: 1, minWidth: 100 },
        { 
            field: "cus_name"
            ,headerName: "顧客名"
            ,flex: 1
            ,minWidth: 130 
            ,headerAlign: "center"
            ,align : "left"            
        },
        { 
            field: "cus_name_kana"
            ,headerName: "顧客名【カナ】"
            ,flex: 1
            ,minWidth: 130 
            ,headerAlign: "center"
            ,align : "left"            
        },
        { 
            field: "address"
            ,headerName: "住所"
            ,flex: 1.5
            ,minWidth: 200 
            ,headerAlign: "center"
            ,align : "left"            
        },
        { 
            field: "contactno"
            ,headerName: "連絡先"
            ,flex: 1
            ,minWidth: 110 
            ,headerAlign: "center"
            ,align : "center"            
        },
        { 
            field: "zandaka"
            ,headerName: "回収残高"
            ,flex: 1
            ,minWidth: 100 
            ,headerAlign: "center"
            ,align : "right"            
        }
    ];

    const handleRowClick = (params: any) => {        
        const rowId = params.id; // Get the row ID        
        navtoCustomerDetail(rowId);        
    }

    

    const fetchCustomerData = async (page: number, pageSize: number) =>{
        try{
            if (!storedToken) {
                throw new Error("No token found");
            }
            const logintoken = JSON.parse(storedToken);
            const payload = { 
                token: logintoken.token
                ,searchkey: searchkey
                ,page: page
                ,pageSize: pageSize 
                ,br_id : dropdownValue
                ,isactive : isactive ? 1 : 0
            };            
            const url = apihost + "customer/getCustomerList";
            axios.post<ApiResponse>(url, payload)
            .then((response) => {
                const result = response.data;
                if(result.handlervalue==1){
                    setRows(result.customerlist);
                    setRowCount(result.totalrows);
                } else {
                    throw new Error(result.message);                    
                }
            })
            .catch((error) => {
                console.error(error);
            });
        } catch(error){
            console.error(error);
        }
    }

    useEffect(() => {
        fetchCustomerData(page, pageSize);        
    }, [searchkey, page, pageSize,dropdownValue,isactive]);        

    /*** grid バリアブル ***/    
    
    /*** customer navigation ***/

    const handleNewCustomer = () =>{
        navtoCustomerDetail("0");
    }

    const navtoCustomerDetail = (rowId : string) => {
        const customer = {
            cus_id : rowId
            ,searchkey: searchkey
            ,br_id : dropdownValue
            ,isactive : isactive
            ,backpage : "/customermaster"            
        }
        localStorage.setItem("customer", JSON.stringify(customer));
        navigate("/customermasterinput");
    }
    /******* customer navigation ******/

    return(
        <>
        <Box sx={{ p: 2 }}>            
            <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel id="dropdown-label">管理店</InputLabel>
                        <Select
                            labelId="dropdown-label"
                            value={dropdownValue}
                            onChange={handleDropdownChange}
                        >
                            <MenuItem value="0"><em>すべて</em></MenuItem>
                            {dropdownOptions.map((option) => (
                                <MenuItem key={option.br_id} value={option.br_id}>
                                    {option.br_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>                
                    <TextField 
                        id="searchkey"
                        label="検索"
                        variant="outlined"
                        size="small"
                        autoComplete="off"      
                        value={searchkey}
                        onChange={handleChange}
                        onKeyUp={(e) => e.key === 'Enter' && fetchCustomerData(page, pageSize)} // Trigger on Enter key                                          
                    />
                    <FormControlLabel
                        control={<Checkbox id="checkisactive" checked={isactive} onChange={handleCheckIsactive}/>}
                        label="稼働中の顧"
                    />
                    <Button variant="contained" color="primary" onClick={handleNewCustomer}>新規登録</Button>
            </Box>        
            <Box sx={{ width: "100%", height: "600px" }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    getRowId={(row) => row.cus_id}                        
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
                    onRowClick={handleRowClick}
                />
            </Box>
        </Box>
        </>
    );
}

export default CustomerMater;