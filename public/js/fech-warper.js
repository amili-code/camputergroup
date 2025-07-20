const baseURL = "http://127.0.0.1:5000/api";
const baseURLGeter = "http://127.0.0.1:5000";

const apiRequest = async (endpoint, method = "GET", body = null, isFormData = false) => {
    const options = {
        method,
    };
    
    if (isFormData && body instanceof FormData) {
        // برای FormData، Content-Type را تنظیم نمی‌کنیم تا مرورگر خودش boundary را تنظیم کند
        options.body = body;
        console.log('Debug - Sending FormData:', body);
    } else {
        options.headers = {
            "Content-Type": "application/json",
        };
        if (body) {
            options.body = JSON.stringify(body);
            console.log('Debug - Sending JSON:', body);
        }
    }

    try {
        console.log('Debug - Making request to:', `${baseURL}${endpoint}`);
        const response = await fetch(`${baseURL}${endpoint}`, options);
        console.log('Debug - Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('Debug - Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Debug - Response data:', result);
        return result;
    } catch (error) {
        console.error("API request error:", error);
        return false
    }
};


// async function redirect(method, url) {
//     const options = {
//         method,
//         headers: {
//             "Content-Type": "application/json",
//             'authorization': `Bearer ${localStorage.getItem('token')}`
//         },
//     };

//     try {
//         const response = await fetch(`${baseURLGeter}${url}`, options);
//         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//         return await response.json();
//     } catch (error) {
//         console.error("API request error:", error);
//         return false
//     }
// }



// مثال استفاده:
// export const getData = () => apiRequest("/data");
// export const postData = (data) => apiRequest("/data", "POST", data);
