const axios = require("axios");

async function addFirstAdmin() {

    try {
        const serverUrl = `http://localhost:5000/api/admins`;
        // اطلاعات ادمین از .env
        const adminData = {
            username: 'mainAdmin',
            password: '123',
        };

        // ارسال درخواست به روت ثبت‌نام
        const response = await axios.post(`${serverUrl}`, adminData);

        console.log("ادمین با موفقیت ایجاد شد:", response.data);
    } catch (error) {
        if (error.response) {
            console.error("خطا در ایجاد ادمین:", error.response.data);
        } else {
            console.error("خطای سرور:", error.message);
        }
    }

}

addFirstAdmin()