import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { DataGrid, GridColDef,GridColumnVisibilityModel } from "@mui/x-data-grid";
import { Box, TextField, Button } from "@mui/material";
import { jaJP } from '@mui/x-data-grid/locales';
import { apihost } from "../api/ServerLink";

interface BranchMaster{
    br_id : string;
    br_name : string;
    zipcode : string;
    address : string;
    telno : string;
    faxno : string;
    email : string;
    br_opendate : string;
    br_closedate : string;    
}

interface ApiResponse {
    handlervalue: number;
    message: string;
    branchdata: BranchMaster[];
}


const BranchMaster = () => {
    const navigate = useNavigate();
    const storedToken = localStorage.getItem("logintoken");
    const storedbranchdetail = JSON.parse(localStorage.getItem("branchdetail") || '{}');
    const [formData, setFormData] = useState({ searchkey: "" });

    const { searchkey } = formData;
    const [rows, setRows] = useState<BranchMaster[]>([]);
    const [rowCount, setRowCount] = useState(0); // Total row count for pagination
    const [pageSize, setPageSize] = useState(100);
    const [page, setPage] = useState(0);


    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [event.target.id]: event.target.value });
    };
    
    //set gridColumns
    const columns: GridColDef[] = [
        { field: "br_name", headerName: "店舗名", flex: 1, minWidth: 150 },        
        { field: "address", headerName: "住所", flex: 1, minWidth: 230 },
        { field: "telno", headerName: "電話番号", flex: 1, minWidth: 130 },
        { field: "faxno", headerName: "FAX番号", flex: 1, minWidth: 130 },
        { field: "email", headerName: "メールアドレス", flex: 1, minWidth: 180 },
        { field: "br_opendate", headerName: "開店日", flex: 1, minWidth: 100 },
        { field: "br_closedate", headerName: "閉店日", flex: 1, minWidth: 100 },
        { field: "zipcode", headerName: ""}, //hidden column
        { field: "prefcitytown", headerName: ""}, //hidden column
        { field: "banchi", headerName: ""} //hidden column
    ];
    const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({
        zipcode: false,
        prefcitytown : false,
        banchi : false
    });     

    const fetchBranchData = (page: number, pageSize: number) => {
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
            };
            const url = apihost + "api/getbranchlist";
            axios.post<ApiResponse>(url, payload)
            .then((response) => {
                const result = response.data;
                if (result.handlervalue === 1) {                    
                        setRows(response.data.branchdata);
                        const brlength = response.data.branchdata === undefined ? 0 : response.data.branchdata.length;
                        setRowCount(brlength);                    
                } else {
                    throw new Error(result.message);                    
                }
            })
            .catch((error) => {
                console.error(error);
            });
        } catch (error) {
            console.error(error);
        }
    }

    const handleBranch = () => {               
        const rowId = "0"; // Get the row ID
        const rowData = { 
            br_id: rowId
            ,br_name: ""
            ,zipcode: ""
            ,address: ""
            ,telno: ""
            ,faxno: ""
            ,email: ""
            ,br_opendate: ""
            ,br_closedate: ""
            ,prefcitytown : ""
            ,banchi : ""
            ,searchkey: searchkey 
        };
        navtoBranchDetail(rowId, rowData);
    }
    const handleRowClickBranch = (param: any) => {
        const rowId = param.id; // Get the row ID    
        const rowData = param.row; // Get the clicked row's data    
        navtoBranchDetail(rowId, rowData);
    }

    const navtoBranchDetail = (rowId : string, rowData : any) => {
        const branchdetail = { 
            br_id: rowId
            ,br_name: rowData.br_name
            ,zipcode: rowData.zipcode
            ,address: rowData.address
            ,telno: rowData.telno
            ,faxno: rowData.faxno
            ,email: rowData.email
            ,br_opendate: rowData.br_opendate
            ,br_closedate: rowData.br_closedate
            ,prefcitytown: rowData.prefcitytown
            ,banchi: rowData.banchi
            ,searchkey: searchkey
            ,backpage : "/branchmaster"
        };        
        localStorage.setItem("branchdetail", JSON.stringify(branchdetail));
        navigate("/branchdetail");
    }

    useEffect(() => {
        fetchBranchData(page, pageSize);        
    }, [searchkey, page, pageSize]);    

    useEffect(() => {
        if(storedbranchdetail){
            setFormData({
                searchkey: storedbranchdetail.searchkey
            });
            //remove local storage for branchdetail
            localStorage.removeItem("branchdetail");    
        }
        document.title = "店舗管理";
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
                        value={searchkey || ""}
                        onChange={handleChange}
                        autoComplete="off"
                        onKeyUp={(e) => e.key === 'Enter' && fetchBranchData(page, pageSize)} // Trigger on Enter key
                    />
                    <Button variant="contained" color="primary" onClick={handleBranch}>新規店舗登録</Button>
            </Box>
            <Box sx={{ width: "100%", height: "600px" }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    getRowId={(row) => row.br_id}
                    paginationModel={{ pageSize, page }}
                    rowCount={rowCount}
                    paginationMode="server"
                    onPaginationModelChange={(model) => {
                        setPage(model.page);
                        setPageSize(model.pageSize);
                    }}
                    columnVisibilityModel={columnVisibilityModel} // Controls column visibility
                    onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
                    localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
                    onRowClick={handleRowClickBranch}
                />
            </Box>
        </Box>
        </>
    );

};

export default BranchMaster;