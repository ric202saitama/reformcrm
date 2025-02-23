import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogActions, DialogContent, Button, TextField } from "@mui/material";
import { DataGrid, GridColDef, GridColumnVisibilityModel  } from "@mui/x-data-grid";
import { jaJP } from '@mui/x-data-grid/locales';
import axios from "axios";


// Define props for reusability
interface UserSearchDialogProps {
    open: boolean;
    onClose: () => void;
    setUserId: React.Dispatch<React.SetStateAction<string>>;
    SetUserName: React.Dispatch<React.SetStateAction<string>>;
    onSelect: (zipcode: string, address: string) => void;  // Callback for when an address is selected
    apihostts: string;  // API host URL    
}

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

  
interface userAPIResponse {
    handlervalue: number;
    message: string;
    userList: User[];
    totalrows: number;  
}

const UserSearchDialog: React.FC<UserSearchDialogProps> = ({ open, onClose, onSelect, apihostts }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [rows, setRows] = useState<User[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const prevSearchQuery = useRef("");
  const storedToken = localStorage.getItem("logintoken");
  

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

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      if (prevSearchQuery.current !== searchQuery) {
        setRows([]); 
        setRowCount(0);
      }
      prevSearchQuery.current = searchQuery;
      const logintoken = JSON.parse(storedToken || '{}');

      const payload = { 
        searchkey: searchQuery,
        page,
        pageSize,
        token: logintoken.token
      };
      
      const url = apihostts+`userlogin/getUserComp`;
      const response = await axios.post<userAPIResponse>(url, payload);

      setRows(response.data.userList);
      setRowCount(response.data.totalrows);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when the dialog opens or dependencies change
  useEffect(() => {
    if (open) {
      fetchAddresses();
    }
  }, [searchQuery, page, pageSize, open]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleRowClick = (params: any) => {
    const selectedUserId = params.row.user_id;    
    const selectedUserName = params.row.user_name;    
    onSelect(selectedUserId, selectedUserName); // Send data to parent
    
    onClose(); // Close the dialog
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
        <TextField
          label="検索"
          fullWidth
          value={searchQuery}
          onChange={handleSearchChange}
          variant="outlined"
          margin="normal"
        />
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row.user_id}   
            rowCount={rowCount}            
            paginationMode="server"
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={(model) => {
              setPage(model.page);
              setPageSize(model.pageSize);
            }}
            loading={loading}
            columnVisibilityModel={columnVisibilityModel} // Controls column visibility
            onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}                         
            disableColumnMenu
            hideFooterSelectedRowCount 
            localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}            
            onRowClick={handleRowClick}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">閉じる</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserSearchDialog;
