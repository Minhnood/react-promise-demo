import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import './App.css';

/* ---------------------------------------------------------
  - Promise: Có 3 trạng thái: Pending, Fulfilled, Rejected
  --------------------------------------------------------- */
const fetchProfile = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ ten: "Nguyễn Văn Tèo", vaiTro: "Java/React Developer", avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHr-ao2cH2zg2N8Ldj8mcYjP7-dNFsP2bY-g&s" });
    }, 1500);
  });
};

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
  /* ==========================================
     1. CÁC LOẠI HOOK QUẢN LÝ STATE & THAM CHIẾU
     ========================================== */
  
  // [Hook 1: useState] - Quản lý trạng thái, khi thay đổi sẽ làm Component render (Updating)
  const [duLieu, setDuLieu] = useState({ hoSo: null, congViec: [] });
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState(null);
  const [lanLamMoi, setLanLamMoi] = useState(0);
  
  // State mới để lưu giá trị ô input nhập task
  const [tenTaskMoi, setTenTaskMoi] = useState("");

  // [Hook 2: useRef] - Tạo một tham chiếu trực tiếp đến phần tử DOM (giống document.getElementById).
  // useRef KHÔNG làm re-render component khi giá trị của nó thay đổi.
  const inputRef = useRef(null);


  /* ==========================================
     2. LIFECYCLE (VÒNG ĐỜI) & EFFECT HOOKS
     ========================================== */

  // VÍ DỤ LIFECYCLE 1: MOUNTING (Khởi tạo)
  // useEffect với mảng rỗng [] CHỈ CHẠY 1 LẦN DUY NHẤT khi component vừa hiện lên.
  useEffect(() => {
    // Tự động focus (nháy chuột) vào ô input ngay khi mở web
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []); // <-- Mảng rỗng = Chỉ chạy lúc Mounting

  // VÍ DỤ LIFECYCLE 2 & 3: UPDATING (Cập nhật) & UNMOUNTING (Hủy bỏ)
  // useEffect này chạy lần đầu (Mounting) và chạy lại mỗi khi 'lanLamMoi' đổi (Updating)
  useEffect(() => {
    let daHuy = false;

    /* ---------------------------------------------------------
       [GIẢI THÍCH ASYNC / AWAIT & PROMISE.ALL]
       - Từ khóa `async` (viết trước hàm) biến hàm này thành hàm bất đồng bộ.
         Nó giúp code xử lý ngầm (như gọi mạng) nhìn gọn gàng như code chạy từ trên xuống.
    --------------------------------------------------------- */
    const taiDuLieu = async () => {
      setDangTai(true);
      setLoi(null);
      
      try {
        // - Từ khóa `await` có nghĩa là: "Này trình duyệt, hãy tạm dừng ở dòng này, 
        //   chờ tải xong hết data đi rồi mới được chạy tiếp xuống dòng bên dưới nhé!".
        //
        // - VÍ DỤ TỐI ƯU VỚI Promise.all:
        //   + CÁCH DỞ (Tuần tự): Đợi 1.5s lấy Profile, lấy xong lại đợi tiếp 2s lấy Task -> Tổng tốn 3.5s.
        //   + CÁCH HAY (Song song): Dùng Promise.all quăng 2 cái chạy cùng lúc -> Tổng tốn 2s (chờ cái lâu nhất).
        const [ketQuaHoSo, ketQuaCongViec] = await Promise.all([
          fetchProfile(), 
          fetchTasks()
        ]);
        
        // Dòng này CHỈ CHẠY KHI VÀ CHỈ KHI dòng `await` ở trên đã thực hiện thành công (Fulfilled)
        if (!daHuy) setDuLieu({ hoSo: ketQuaHoSo, congViec: ketQuaCongViec });
      
      } catch (err) {
        // Sẽ nhảy ngay vào khối 'catch' này nếu có BẤT KỲ một Promise nào bị lỗi (Rejected)
        if (!daHuy) setLoi("Lỗi tải dữ liệu!");
      } finally {
        // Dù Try thành công hay nhảy vào Catch lỗi thì cuối cùng vẫn phải chạy vô đây tắt chữ Loading
        if (!daHuy) setDangTai(false);
      }
    };

    taiDuLieu();

    // VÍ DỤ LIFECYCLE 3: UNMOUNTING (Hủy bỏ)
    // Hàm return này (Cleanup function) chạy trước khi component bị xóa hoặc trước khi Effect chạy lại.
    return () => {
      daHuy = true;
    };
  }, [lanLamMoi]); // <-- Có mảng phụ thuộc = Chạy lại lúc Updating


  /* ==========================================
     3. CÁC LOẠI HOOKS TỐI ƯU HIỆU SUẤT
     ========================================== */

  // [Hook 3: useCallback] - Ghi nhớ (cache) lại một HÀM.
  // Giúp hàm này không bị tạo lại từ đầu mỗi khi Component re-render, tiết kiệm bộ nhớ.
  const doiTrangThaiTask = useCallback((idTask) => {
    setDuLieu((duLieuHienTai) => {
      const danhSachCongViecMoi = duLieuHienTai.congViec.map((task) => {
        if (task.id === idTask) return { ...task, hoanThanh: !task.hoanThanh };
        return task;
      });
      return { ...duLieuHienTai, congViec: danhSachCongViecMoi };
    });
  }, []); // Hàm này không phụ thuộc biến bên ngoài nào nên để mảng rỗng

  // Hàm thêm Task mới
  const themTask = (e) => {
    e.preventDefault(); // Ngăn trang web bị reload khi submit form
    if (!tenTaskMoi.trim()) return;

    const taskMoiTao = {
      id: Date.now(), // Tạo ID ngẫu nhiên bằng thời gian
      ten: tenTaskMoi,
      hoanThanh: false
    };

    setDuLieu(prev => ({
      ...prev,
      congViec: [...prev.congViec, taskMoiTao]
    }));
    setTenTaskMoi(""); // Xóa trắng ô input
    inputRef.current.focus(); // Focus lại vào ô input sau khi thêm
  };

  // Hàm xóa Task
  const xoaTask = (idTask, e) => {
    e.stopPropagation(); // Ngăn sự kiện click bị lan truyền lên thẻ <li> (tránh bị kích hoạt đổi trạng thái)
    setDuLieu(prev => ({
      ...prev,
      congViec: prev.congViec.filter(task => task.id !== idTask)
    }));
  };

  // [Hook 4: useMemo] - Ghi nhớ (cache) lại một GIÁ TRỊ TÍNH TOÁN.
  // Chỉ tính toán lại (chạy lại vòng lặp filter) khi mảng 'duLieu.congViec' thực sự thay đổi.
  const thongKeHoanThanh = useMemo(() => {
    console.log("Đang tính toán lại thống kê..."); // Bạn có thể xem console log để thấy nó không bị chạy vô tội vạ
    const soTaskXong = duLieu.congViec.filter(t => t.hoanThanh).length;
    const tongSoTask = duLieu.congViec.length;
    return `${soTaskXong} / ${tongSoTask}`;
  }, [duLieu.congViec]); // <-- Chỉ tính lại khi danh sách công việc thay đổi


  return (
    <div className="container">
      <header className="header">
        <h1>Bảng Điều Khiển</h1>
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
            <img src={duLieu.hoSo?.avatar} alt="" />
            <h2>{duLieu.hoSo?.ten}</h2>
            <p className="role">{duLieu.hoSo?.vaiTro}</p>
            {/* Hiển thị giá trị được tính toán từ useMemo */}
            <div style={{ marginTop: '1rem', padding: '0.5rem', background: '#444', borderRadius: '8px'}}>
              <strong>Tiến độ:</strong> {thongKeHoanThanh} task đã xong
            </div>
          </div>

          <div className="card tasks-card">
            <h3>Nhiệm vụ hôm nay</h3>
            
            {/* Form thêm Task sử dụng useRef và useState */}
            <form onSubmit={themTask} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input 
                ref={inputRef} /* Gắn ref vào đây để focus */
                type="text" 
                value={tenTaskMoi}
                onChange={(e) => setTenTaskMoi(e.target.value)}
                placeholder="Ví dụ: Cấu hình server LAN, học Java OOP..."
                style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: 'none' }}
              />
              <button type="submit" style={{ padding: '0.5rem 1rem' }}>Thêm</button>
            </form>

            <ul className="task-list">
              {duLieu.congViec.map(task => (
                <li 
                  key={task.id} 
                  className={task.hoanThanh ? "done" : "pending"}
                  onClick={() => doiTrangThaiTask(task.id)}
                  style={{ cursor: "pointer", display: 'flex', justifyContent: 'space-between' }}
                  title="Nhấn để đổi trạng thái"
                >
                  <span>{task.ten}</span>
                  {/* Nút xóa task */}
                  <button 
                    onClick={(e) => xoaTask(task.id, e)}
                    style={{ background: 'red', padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                  >
                    Xóa
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}