# TopTop UI - Ứng dụng chia sẻ video ngắn

Ứng dụng chia sẻ video ngắn tương tự TikTok được xây dựng bằng React.js sử dụng api của fullstack.edu.vn (F8)

## Tính năng chính

### Giao diện người dùng
- **Giao diện**: Sử dụng SCSS modules 
- **Animations**: Hiệu ứng chuyển đổi và loading

### Quản lý Video
- **Phát video tự động**: Phát video khi cuộn đến
- **Điều khiển video**:
  - Play/Pause bằng click hoặc spacebar
  - Thanh progress bar có thể kéo thả để tua
  - Điều khiển âm lượng với slider
  - Tắt/bật tiếng (mute/unmute)
  - Hiển thị thời gian video
- **Video player**:
  - Tự động loop

### Tải lên Video
- **Upload**: Hỗ trợ drag & drop hoặc chọn file
- **Định dạng**: MP4, AVI, MOV, WMV, FLV, WebM

### Tương tác xã hội
- **Like/Unlike video**: Thích và bỏ thích video
- **Bình luận**:
  - Viết bình luận mới
  - Like/unlike bình luận
  - Hiển thị thời gian bình luận
- **Follow/Unfollow**: Theo dõi và bỏ theo dõi người dùng

### Trang chủ (For You)
- **Feed**: Hiển thị video được đề xuất

### Trang Following
- **Video từ người theo dõi**: Chỉ hiển thị video từ những người đã follow

### Trang Profile
- **Thông tin cá nhân**:
  - Avatar, tên, nickname
  - Bio/mô tả bản thân
  - Số video, followers, following
  - Thông tin liên hệ (website, social media)
- **Chỉnh sửa profile**:
  - Cập nhật thông tin cá nhân
  - Thay đổi avatar
  - Chỉnh sửa ngày sinh, giới tính
  - Thêm liên kết mạng xã hội
- **Hiển thị video**: Video đã đăng

### Tìm kiếm
- **Tìm kiếm người dùng**: Tìm kiếm theo nickname có gợi ý tài khoản

### Xác thực và phân quyền
- **Đăng nhập/Đăng ký**: Hệ thống authentication

## Công nghệ sử dụng

### Frontend Framework
- **React 18.2.0**: Framework chính

### Styling
- **SCSS**: CSS preprocessor

## Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js 14.0.0 trở lên
- npm hoặc yarn

### Cài đặt dependencies
```bash
npm install
```

### Chạy môi trường development
```bash
npm start
```
Ứng dụng sẽ chạy tại [http://localhost:3000](http://localhost:3000)

## Cấu trúc dự án

```
src/
├── components/          # Các component tái sử dụng
│   ├── VideoPlayer/     # Component phát video chính
│   ├── Comments/        # Hệ thống bình luận
│   ├── Image/          # Component hiển thị ảnh
│   ├── Button/         # Các loại nút
│   └── ...
├── pages/              # Các trang chính
│   ├── Home/           # Trang chủ (For You)
│   ├── Following/      # Video từ người theo dõi
│   ├── Profile/        # Trang cá nhân
│   ├── Upload/         # Trang upload video
│   └── ...
├── services/           # API services
│   ├── videoService.js # APIs liên quan video
│   ├── userService.js  # APIs liên quan user
│   └── authService.js  # APIs xác thực
├── hooks/              # Custom React hooks
├── layouts/            # Layout components
├── routes/             # Cấu hình routing
├── store/              # State management
├── utils/              # Utility functions
└── assets/             # Static assets
```

## Cấu hình

### Environment Variables
Tạo file `.env` trong thư mục root:
```env
REACT_APP_API_URL=https://tiktok.fullstack.edu.vn/
```

## API Integration

### Video APIs
- `GET /videos` - Lấy danh sách video
- `POST /videos` - Upload video mới
- `POST /videos/:id/like` - Like video
- `POST /videos/:id/unlike` - Unlike video
- `GET /videos/:id/comments` - Lấy bình luận
- `POST /videos/:id/comments` - Tạo bình luận mới

### User APIs
- `GET /users/@:nickname` - Lấy thông tin user
- `POST /users/:id/follow` - Follow user
- `POST /users/:id/unfollow` - Unfollow user
- `GET /me/followings` - Lấy danh sách đang follow

### Auth APIs
- `POST /auth/login` - Đăng nhập
- `POST /auth/register` - Đăng ký
- `POST /auth/logout` - Đăng xuất
- `GET /auth/me` - Lấy thông tin user hiện tại

## Tác giả

Được phát triển với ❤️ bởi Nguyễn Trung hiếu
