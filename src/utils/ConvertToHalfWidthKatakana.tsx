// src/utils/ConvertToHalfWidthKatakana.tsx (client-side)
import axios from 'axios';
import { apihost } from '../api/ServerLink'; // Use your existing apihost

interface ConvertResponse {
    katakana: string;
}

export const convertToHalfWidthKatakana = async (input: string): Promise<string> => {
    try {
        const response = await axios.post<ConvertResponse>(`${apihost}apitext/convertKatakana`, { text: input });
        const { katakana } = response.data;        
        return katakana;
    } catch (error) {
        console.error("Conversion error:", error);
        return input; // Fallback to input on error
    }
};