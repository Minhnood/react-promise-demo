import React, { useState, useEffect } from 'react';
import './App.css';

/* ---------------------------------------------------------
  - Promise: Có 3 trạng thái: 
    1. Pending : đang chờ
    2. Fulfilled : thành công
    3. Rejected : lỗi
  ---------------------------------------------------------
*/

// Fake API lấy Profile - trả về 1 Promise sau 1.5s
const fetchProfile = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Gọi resolve tức là chuyển Promise sang Fulfilled
      resolve({ ten: "Nguyễn Văn Tèo", vaiTro: "hehehehe", avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHr-ao2cH2zg2N8Ldj8mcYjP7-dNFsP2bY-g&s" });
      // comment dòng trên và bật dòng dưới để test lỗi
      reject("Server sập rồi!");
    }, 1500);
  });
};

// Fake API lấy Task - trả về 1 Promise sau 2s
const fetchTasks = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, ten: "Hoàn thiện báo cáo tháng", hoanThanh: true },
        { id: 2, ten: "Nghiên cứu React Hooks", hoanThanh: false },
        { id: 3, ten: "Họp với team Design", hoanThanh: false },
      ]);
    }, 2000);
  });
};

export default function App() {
  const [duLieu, setDuLieu] = useState({ hoSo: null, congViec: [] });
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState(null);

  // Dùng state này làm trigger để ép component render lại
  const [lanLamMoi, setLanLamMoi] = useState(0);

  /* ---------------------------------------------------------
   Vòng đời của một component trong React
    - Mounting: Component lần đầu xuất hiện trên màn hình.
    - Updating: Component vẽ lại do state hoặc props thay đổi.
    - Unmounting: Component bị xóa khỏi màn hình.
    ---------------------------------------------------------
  */

  // Dependency array nghĩa là: 
  // Chạy lần đầu lúc Mouting, và chạy lại (Updating) mỗi khi bấm nút Làm mới.
  useEffect(() => {
    // NOTE QUAN TRỌNG: Biến cờ này để fix lỗi memory leak
    // Lỡ đang call API mà user tắt trang -> component Unmount -> ko được set state nữa!
    let daHuy = false;

    // Hàm bất đồng bộ (async): Viết code nhìn như tuần tự từ trên xuống, ko bị Callback Hell
    const taiDuLieu = async () => {
      setDangTai(true);
      setLoi(null);

      try {
        //PROMISE.ALL
        // Thay vì đợi 1.5s lấy Profile, xong đợi tiếp 2s lấy Task (tổng 3.5s)
        // Dùng Promise.all quăng 2 cục chạy song song -> Tổng time chỉ tốn 2s (chờ thằng lâu nhất)
        const [ketQuaHoSo, ketQuaCongViec] = await Promise.all([
          fetchProfile(),
          fetchTasks()
        ]);

        // await có nghĩa là "chờ code ở đây lấy xong data đi rồi mới chạy xuống dòng dưới"
        if (!daHuy) {
          setDuLieu({ hoSo: ketQuaHoSo, congViec: ketQuaCongViec });
        }
      } catch (err) {
        // Rơi vào đây nếu có bất kỳ 1 Promise nào bị Rejected
        console.error("Toang rồi đại vương ơi:", err);
        if (!daHuy) setLoi("Lỗi tải dữ liệu, coi lại mạng internet xem!");
      } finally {
        // Thành công hay thất bại thì cũng phải tắt cục loading xoay xoay
        if (!daHuy) setDangTai(false);
      }
    };

    // Gọi hàm thực thi
    taiDuLieu();

    // Cleanup function: Tương đương giai đoạn UNMOUNTING
    // React sẽ tự gọi cục này trước khi chạy effect mới, hoặc khi component bị hủy
    return () => {
      daHuy = true;
    };
  }, [lanLamMoi]);

  // UI Render
  return (
    <div className="container">
      <header className="header">
        <h1>Bảng Điều Khiển</h1>
        {/* Nút này làm đổi state -> Trigger Lifecycle Updating */}
        <button onClick={() => setLanLamMoi(c => c + 1)} disabled={dangTai}>
          {dangTai ? "Đang tải..." : "Làm mới dữ liệu"}
        </button>
      </header>

      {loi && <div className="error-box">{loi}</div>}

      {dangTai ? (
        <div className="loading">Đang lấy data, ráng đợi tí...</div>
      ) : (
        <div className="dashboard">
          <div className="card profile-card">
            {/* <div className="avatar">{duLieu.hoSo?.avatar}</div> */}
            <img src={duLieu.hoSo?.avatar} alt="" />
            <h2>{duLieu.hoSo?.ten}</h2>
            <p className="role">{duLieu.hoSo?.vaiTro}</p>
          </div>

          <div className="card tasks-card">
            <h3>Nhiệm vụ hôm nay</h3>
            <ul className="task-list">
              {duLieu.congViec.map(task => (
                <li key={task.id} className={task.hoanThanh ? "done" : "pending"}>
                  {task.ten}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}