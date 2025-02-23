import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { DataGrid, GridColDef, GridColumnVisibilityModel } from "@mui/x-data-grid";
import { Box, TextField, Checkbox, FormControlLabel, Button } from "@mui/material";
import { jaJP } from '@mui/x-data-grid/locales';
import { apihost } from "../api/ServerLink";

interface User {
    comp_id: string;
    user_id: string;
    user_name: string;
    user_pass: string;
    contactno: string;
    emailadd: string;
    isadmin: number;
    isactive: number;
    added_datetime: string;
    added_by: string;
    modified_datetime: string | null;
    modified_by: string | null;
    isshowlist: number;
}

interface ApiResponse {
    handlervalue: number;
    message: string;
    userList: User[];
}

const UserSetting = () => {    
    const [rows, setRows] = useState<User[]>([]);
    const [rowCount, setRowCount] = useState(0); // Total row count for pagination
    const [pageSize, setPageSize] = useState(100);
    const [page, setPage] = useState(0);

    const [isactive, checkIsactive] = useState(true);
    const [formData, setFormData] = useState({ searchkey: "" });
    const { searchkey } = formData;
    const navigate = useNavigate();

    const storedToken = localStorage.getItem("logintoken");
    const storeduserdetail = JSON.parse(localStorage.getItem("userdetail") || '{}');    

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [event.target.id]: event.target.value });
    };

    const handleCheckIsactive = (event: React.ChangeEvent<HTMLInputElement>) => {
        checkIsactive(event.target.checked);
    };
   
    const [selectionModel, setSelectionModel] = useState<any>([]);
    const columns: GridColDef[] = [
        { field: "user_name", headerName: "名前", flex: 1, minWidth: 150 },
        { field: "emailadd", headerName: "メールアドレス", flex: 1.5, minWidth: 180 },
        { field: "contactno", headerName: "連絡先", flex: 1, minWidth: 130 },
        { field: "user_id", headerName: ""}, // Hide column by default
        { field: "isadmin", headerName: ""}, // Hide column by default
        { field: "isactive", headerName: ""}, // Hide column by default
        { field: "user_pass", headerName: ""}, // Hide column by default
    ];

    const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({
        user_id: false,
        isadmin: false,
        isactive: false,
        user_pass: false
    });    

    const fetchData = async (page: number, pageSize: number) => {
        
        try {
            if (storedToken) {
                const logintoken = JSON.parse(storedToken);
                const isactivestatus = isactive ? 1 : 0;
                const payload = { 
                    token: logintoken.token
                    ,searchkey: searchkey                    
                    ,isactive: isactivestatus 
                    ,page : page 
                    ,pageSize: pageSize                    
                };
                const valurl = `${apihost}userlogin/getUserComp`;
                const response = await axios.post<ApiResponse>(valurl, payload);

                if (Array.isArray(response.data.userList)) {
                    setRows(response.data.userList);
                    setRowCount(response.data.userList.length);
                } else {
                    console.error("Error: userList is not an array", response.data.userList);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const navtoUserDetail = (rowId : string, rowData : any) =>{
        
        const userdetail = {
            user_id: rowId,
            user_name: rowData.user_name,
            emailadd: rowData.emailadd,
            contactno: rowData.contactno,
            isadmin: rowData.isadmin,
            isactive: rowData.isactive,            
            searchkey: searchkey,
            checkisactive : isactive ? 1 : 0,
            user_pass: rowData.user_pass,
            backpage : "/usermanage"
        };
        localStorage.setItem("userdetail", JSON.stringify(userdetail));
        navigate("/userdata");        
    }    

    const handleRowClick = (params: any) => {
        const rowData = params.row; // Get the clicked row's data
        const rowId = params.id; // Get the row ID
        navtoUserDetail(rowId, rowData);
    }

    const handleNewUser = () => {
        const userdetail = {
            user_id: 0,
            user_name: "",
            emailadd: "",
            contactno: "",
            isadmin: 0,
            isactive: 1,
            searchkey: searchkey,
            checkisactive : isactive ? 1 : 0,
            user_pass: "",
            backpage : "/usermanage"
        };
        localStorage.setItem("userdetail", JSON.stringify(userdetail));
        navigate("/userdata");
    }
    
    useEffect(() => {
        fetchData(page, pageSize);        
    }, [searchkey, isactive, page, pageSize]);

    useEffect(() => {
        
        if(storeduserdetail.backpage!==undefined){
            setFormData({ 
                searchkey: storeduserdetail.searchkey
            });
            checkIsactive(storeduserdetail.checkisactive == 1 ? true : false);
        }
        //remove local storage for userdetail
        localStorage.removeItem("userdetail");
    }, []);
    
    return (
        <>                     
            <Box sx={{ p: 2 }}>
                <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
                    <TextField 
                        id="searchkey"
                        label="検索"
                        variant="outlined"
                        size="small"
                        value={searchkey}
                        onChange={handleChange}
                        autoComplete="off"
                        onKeyUp={(e) => e.key === 'Enter' && fetchData(page, pageSize)} // Trigger on Enter key
                    />
                    <FormControlLabel
                        control={<Checkbox checked={isactive} onChange={handleCheckIsactive} id="checkisactive"/>}
                        label="稼働メンバー"
                    />
                    <Button variant="contained" color="primary" onClick={handleNewUser}>新規登録</Button>
                </Box>
                <Box sx={{ width: "100%", height: "600px" }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        getRowId={(row) => row.user_id}                        
                        rowCount={rowCount} // This provides the total count for pagination                        
                        paginationModel={{ page, pageSize }}
                        paginationMode="server" // Enable server-side pagination                                                
                        onPaginationModelChange={(model) => {
                            setPage(model.page);
                            setPageSize(model.pageSize);
                        }}
                        rowSelectionModel={selectionModel}
                        onRowSelectionModelChange={(newSelection) => setSelectionModel(newSelection)}                        
                        columnVisibilityModel={columnVisibilityModel} // Controls column visibility
                        onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}                         
                        disableColumnMenu
                        hideFooterSelectedRowCount 
                        localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
                        onRowClick={handleRowClick}
                    />
                </Box>
            </Box>
                
        </>
    );
};
export default UserSetting;
