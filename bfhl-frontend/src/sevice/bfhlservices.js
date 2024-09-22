import axios from 'axios';

const API_URL = 'http://localhost:3000/bghl'; // Replace with your backend URL if different

// Function to handle GET requests
export const fetchData = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

// Function to handle POST requests
export const postData = async (data) => {
    try {
        const response = await axios.post(API_URL, data);
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
        throw error;
    }
};