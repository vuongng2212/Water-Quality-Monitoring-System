// Tên file: iot-simulator.js
// Chạy bằng: node iot-simulator.js
// Yêu cầu: Node.js v18 trở lên

// --- Cấu hình ---
const API_URL = 'http://localhost:8080/api/sensor-data';
const API_KEY = '7fbfa558-6a4f-4690-b052-d7d62b7ffbfe'; // Dễ dàng thay đổi
const INTERVAL_MS = 10000; // 10 giây
// --- Kết thúc cấu hình ---

/**
 * Hàm trợ giúp tạo số ngẫu nhiên trong một khoảng
 * @param {number} min - Giá trị nhỏ nhất
 * @param {number} max - Giá trị lớn nhất
 * @param {number} decimals - Số chữ số thập phân
 * @returns {number}
 */
function getRandomValue(min, max, decimals = 2) {
    const str = (Math.random() * (max - min) + min).toFixed(decimals);
    return parseFloat(str);
}

/**
 * Tạo một bộ dữ liệu cảm biến ngẫu nhiên
 */
function getMockSensorData() {
    return {
        ph: getRandomValue(4.5, 8.5, 1),           // pH ngẫu nhiên từ 4.5 đến 8.5
        temperature: getRandomValue(20.0, 30.0, 1), // Nhiệt độ ngẫu nhiên từ 20 đến 30
        turbidity: getRandomValue(1.0, 3.5, 2),     // Độ đục ngẫu nhiên từ 1.0 đến 3.5
        conductivity: getRandomValue(500, 800, 0)   // Độ dẫn điện ngẫu nhiên từ 500 đến 800
    };
}

/**
 * Hàm chính để gửi dữ liệu (ĐÃ CẬP NHẬT để xử lý 201)
 */
async function sendSensorData() {
    const data = getMockSensorData();
    const timestamp = new Date().toISOString();

    console.log(`[${timestamp}] ⬆️ Đang gửi dữ liệu:`, JSON.stringify(data));

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': API_KEY
            },
            body: JSON.stringify(data)
        });

        if (response.ok) { // response.ok là true cho mã 201
            // --- SỬA LỖI Ở ĐÂY ---
            // Đọc phản hồi dưới dạng text trước
            const responseText = await response.text();

            if (responseText) {
                // Nếu có nội dung text, mới thử parse JSON
                try {
                    const responseData = JSON.parse(responseText);
                    console.log(`[${timestamp}] ✅ Gửi thành công! Phản hồi:`, responseData);
                } catch (parseError) {
                    console.error(`[${timestamp}] ⚠️ Gửi thành công, nhưng không thể parse JSON. Phản hồi thô:`, responseText);
                }
            } else {
                // Nếu không có nội dung, chỉ cần ghi nhận là thành công
                // Đây chính là trường hợp của bạn (201 No Content)
                console.log(`[${timestamp}] ✅ Gửi thành công! (Server phản hồi ${response.status} - Đã tạo)`);
            }
            // --- KẾT THÚC SỬA ---

        } else {
            // Xử lý lỗi từ server (ví dụ: 400, 401, 500)
            const errorText = await response.text();
            console.error(`[${timestamp}] ❌ Lỗi server! Status: ${response.status}. Chi tiết: ${errorText}`);
        }

    } catch (error) {
        // Xử lý lỗi mạng (ví dụ: không kết nối được server)
        console.error(`[${timestamp}] ⛔ Lỗi mạng! Không thể gửi request:`, error.message);
    }
}
// --- Khởi động ---
console.log(`🚀 Khởi động script gửi dữ liệu giả lập IoT...`);
console.log(`📡 URL: ${API_URL}`);
console.log(`🔑 API Key: ${API_KEY.substring(0, 10)}...`);
console.log(`⏱️  Khoảng thời gian: ${INTERVAL_MS / 1000} giây`);
console.log(`📊 Dữ liệu sẽ được gửi lặp lại mỗi ${INTERVAL_MS / 1000} giây.`);

// Gửi ngay lần đầu tiên khi chạy
console.log(`\n📤 Gửi lần đầu tiên...`);
sendSensorData();

// Thiết lập gửi lặp lại mỗi 10 giây
setInterval(sendSensorData, INTERVAL_MS);