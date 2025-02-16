import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogActions, DialogContent, Button, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";


// Define props for reusability
interface AddressSearchDialogProps {
    open: boolean;
    onClose: () => void;
    setZipcode: React.Dispatch<React.SetStateAction<string>>;
    setAddress: React.Dispatch<React.SetStateAction<string>>;
    onSelect: (zipcode: string, address: string) => void;  // Callback for when an address is selected
    apihostts: string;  // API host URL    
}

interface addressList{
    zipcode : string;
    address : string;
  }
  
interface addressAPIResponse {
    handlervalue: number;
    message: string;
    addressdata: addressList[];
    totalrows: number;  
}

const AddressSearchDialog: React.FC<AddressSearchDialogProps> = ({ open, onClose, onSelect, apihostts }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [addresses, setAddresses] = useState<any[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const prevSearchQuery = useRef("");

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      if (prevSearchQuery.current !== searchQuery) {
        setAddresses([]); 
        setRowCount(0);
      }
      prevSearchQuery.current = searchQuery;

      const payload = { 
        searchkey: searchQuery,
        page,
        pageSize,
      };
      
      const url = apihostts+`api/getaddress`;
      const response = await axios.post<addressAPIResponse>(url, payload);

      setAddresses(response.data.addressdata);
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
    const selectedZipcode = params.row.zipcode;    
    const selectedAddress = params.row.address;    
    onSelect(selectedZipcode, selectedAddress); // Send data to parent
    
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
            rows={addresses}
            columns={[
              { field: "zipcode", headerName: "郵便番号", width: 150 },
              { field: "address", headerName: "住所", width: 400 },
            ]}
            rowCount={rowCount}
            getRowId={(row) => row.uid}
            paginationMode="server"
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={(model) => {
              setPage(model.page);
              setPageSize(model.pageSize);
            }}
            loading={loading}
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

export default AddressSearchDialog;
