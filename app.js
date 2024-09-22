const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');

// Apply CORS middleware before defining routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Hardcoded default values
const defaultUserId = "john_doe_17091999";
const defaultEmail = "john@xyz.com";
const defaultRollNumber = "ABCD123";
const defaultFileMimeType = "image/png";
const defaultFileSizeKb = 400;

// POST endpoint
app.post('/bghl', (req, res) => {
    const { full_name, date_of_birth, data, file_b64 } = req.body;

    // Validate the input
    if (!data || !Array.isArray(data)) {
        return res.status(400).json({ is_success: false, message: 'Missing required fields or data is not an array' });
    }

    // Generate user_id if full_name is provided
    let user_id = defaultUserId;
    if (full_name && date_of_birth) {
        const formattedDate = new Date(date_of_birth);
        const dd = String(formattedDate.getDate()).padStart(2, '0');
        const mm = String(formattedDate.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
        const yyyy = formattedDate.getFullYear();
        user_id = `${full_name.replace(/\s+/g, '_')}_${dd}_${mm}_${yyyy}`;
    }

    // Process data to extract numbers and alphabets
    const numbers = data.filter(item => typeof item === 'number' || /^\d+$/.test(item)).map(Number); // Ensure all are treated as numbers
    const alphabets = data.filter(item => typeof item === 'string' && /^[a-zA-Z]+$/.test(item));
    const lowercaseAlphabets = alphabets.filter(item => item === item.toLowerCase());
    const highestLowercaseAlphabet = lowercaseAlphabets.length > 0 ? lowercaseAlphabets.sort().reverse()[0] : null;

    // Validate file based on base64 string presence (assuming file_b64 is provided)
    const file_valid = !!file_b64;

    // Construct response
    const postResponse = {
        is_success: true,
        user_id,
        email: req.body.email || defaultEmail,
        roll_number: req.body.roll_number || defaultRollNumber,
        numbers,
        alphabets,
        highest_lowercase_alphabet: highestLowercaseAlphabet ? [highestLowercaseAlphabet] : [],
        file_valid,
        file_mime_type: defaultFileMimeType,
        file_size_kb: defaultFileSizeKb
    };

    res.status(200).json(postResponse);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
