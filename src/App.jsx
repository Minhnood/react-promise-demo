import React, { useState, useEffect, useCallback, useMemo } from 'react';

// ============================================================================
// PHẦN 1: CÁC PHƯƠNG THỨC CỦA PROMISE (PROMISE COMBINATORS)
// ============================================================================

// Các hàm giả API chạy Promise
const fetchUser = () => Promise.resolve("Dữ liệu User");
const fetchCart = () => Promise.resolve("Dữ liệu Giỏ hàng");
const fetchError = () => Promise.reject("Lỗi máy chủ!");

const uploadFile1 = () => Promise.resolve("File 1 OK");
const uploadFile2 = () => Promise.reject("File 2 Lỗi dung lượng");

const fastAPI = () => new Promise(res => setTimeout(() => res("API Nhanh (1s)"), 1000));
const slowAPI = () => new Promise(res => setTimeout(() => res("API Chậm (3s)"), 3000));
const timeout = () => new Promise((_, rej) => setTimeout(() => rej("Timeout (2s)"), 2000));

const server1Down = () => Promise.reject("Server 1 sập");
const server2Fast = () => new Promise(res => setTimeout(() => res("Server 2 (1s)"), 1000));

const runPromiseExamples = () => {
  // 1. Promise.all: Đợi TẤT CẢ thành công. Nếu MỘT cái lỗi, dừng và báo lỗi ngay.
  Promise.all([fetchUser(), fetchCart()])
    .then(res => console.log("Promise.all (Thành công):", res)) // ["Dữ liệu User", "Dữ liệu Giỏ hàng"]
    .catch(err => console.error("Promise.all (Lỗi):", err));

  Promise.all([fetchUser(), fetchError()])
    .then(res => console.log("Không chạy vào đây"))
    .catch(err => console.error("Promise.all (Bị ngắt do lỗi):", err)); // "Lỗi máy chủ!"

  // 2. Promise.allSettled: Đợi TẤT CẢ chạy xong, bất kể thành công hay thất bại.
  Promise.allSettled([uploadFile1(), uploadFile2()])
    .then(results => {
      console.log("Promise.allSettled (Kết quả chi tiết):");
      // Trả về mảng object: [{status: 'fulfilled', value: ...}, {status: 'rejected', reason: ...}]
      results.forEach((item, index) => {
        if (item.status === "fulfilled") console.log(`- File ${index + 1}:`, item.value);
        else console.log(`- File ${index + 1} Lỗi:`, item.reason);
      });
    });

  // 3. Promise.race: Lấy kết quả của Promise xong ĐẦU TIÊN (có thể là thành công hoặc lỗi).
  Promise.race([slowAPI(), timeout()])
    .then(res => console.log("Không chạy vào đây"))
    .catch(err => console.error("Promise.race (Bị Timeout):", err)); // "Timeout (2s)"

  Promise.race([fastAPI(), timeout()])
    .then(res => console.log("Promise.race (Nhanh hơn Timeout):", res)) // "API Nhanh (1s)"
    .catch(err => console.error("Không chạy vào đây"));

  // 4. Promise.any: Lấy Promise THÀNH CÔNG đầu tiên. Chỉ báo lỗi khi TẤT CẢ đều lỗi.
  Promise.any([server1Down(), server2Fast(), slowAPI()])
    .then(res => console.log("Promise.any (Lấy server thành công nhanh nhất):", res)) // "Server 2 (1s)"
    .catch(err => console.error("Chỉ chạy khi tất cả đều sập", err));
};


// ============================================================================
// PHẦN 2: REACT HOOK DEPENDENCIES (MẢNG PHỤ THUỘC)
// ============================================================================

export default function App({ userId, categoryId }) {
  const [count, setCount] = useState(0);
  const [data, setData] = useState(null);

  // VÍ DỤ 1: KHÔNG CÓ MẢNG PHỤ THUỘC
  // Giải thích: Chạy lại sau MỖI LẦN component render. Dễ gây infinite loop nếu có setState bên trong.
  useEffect(() => {
    console.log("1. Component vừa render hoặc re-render");
  });

  // VÍ DỤ 2: MẢNG PHỤ THUỘC RỖNG []
  // Giải thích: Chỉ chạy ĐÚNG 1 LẦN khi component được mount (xuất hiện trên DOM).
  useEffect(() => {
    console.log("2. Component Mount: Chạy Promise Examples và thiết lập dữ liệu ban đầu");
    runPromiseExamples();
    
    const timer = setInterval(() => console.log('Tick...'), 5000);
    
    // Cleanup function: Chạy khi component unmount
    return () => clearInterval(timer);
  }, []); 

  // VÍ DỤ 3: MẢNG CÓ BIẾN PHỤ THUỘC [userId, categoryId]
  // Giải thích: Chỉ chạy lại khi 'userId' HOẶC 'categoryId' thay đổi.
  useEffect(() => {
    if (!userId) return;
    
    console.log(`3. Đang gọi API lấy dữ liệu cho User ${userId}, Category ${categoryId}`);
    // Giả lập API call
    setData({ user: userId, cat: categoryId, info: "Dữ liệu mới" });
    
  }, [userId, categoryId]); // <-- Mảng phụ thuộc

  // VÍ DỤ 4: useMemo VỚI MẢNG PHỤ THUỘC
  // Giải thích: Lưu lại kết quả tính toán. Chỉ tính lại khi biến 'count' thay đổi.
  const expensiveCalculation = useMemo(() => {
    console.log("4. Đang tính toán dữ liệu nặng dựa trên count...");
    return count * 1000;
  }, [count]);

  // VÍ DỤ 5: useCallback VỚI MẢNG PHỤ THUỘC
  // Giải thích: Giữ nguyên reference của hàm trừ khi 'userId' thay đổi.
  const handleUserClick = useCallback(() => {
    console.log(`User ${userId} clicked. Calculated value: ${expensiveCalculation}`);
  }, [userId, expensiveCalculation]);

  return (
    <div style={{ padding: 20 }}>
      <h2>React & Promise Demo</h2>
      <p>Count: {count} (Calculation: {expensiveCalculation})</p>
      <button onClick={() => setCount(c => c + 1)}>Tăng Count (Kích hoạt useMemo)</button>
      <button onClick={handleUserClick}>In thông tin User</button>
      
      <div style={{ marginTop: 20 }}>
        <strong>Dữ liệu API:</strong>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
}