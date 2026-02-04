# API SDGs - OpenDesa

> API untuk mengakses data Sustainable Development Goals (SDGs) dari seluruh desa di Indonesia

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Run Server (tanpa scheduler)
```bash
npm start
```

### Run Server dengan Local Scheduler
```bash
npm run start:scheduler
# atau
npm run dev
```

Server akan berjalan di `http://localhost:5000`

## 📚 API Endpoints

### Get Data Desa
```bash
GET /api/:kodedesa
```

**Example:**
```bash
curl http://localhost:5000/api/1101010001
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "indikator": "Pendidikan",
      "nilai": 75.5,
      "image": "/img/..."
    }
  ]
}
```

### Health Check
```bash
GET /api/health
```

### Trigger Generator (Manual)
```bash
POST /api/trigger-generator
Content-Type: application/json

{
  "secret": "your-generator-secret"
}
```

## ⚙️ Scheduling

Sistem ini mendukung 2 mode scheduler:

### 1. Local Scheduler (node-cron)
- **File**: `scheduler.js`, `index-scheduler.js`
- **Jalankan**: `npm run start:scheduler`
- **Schedule**: Setiap tanggal 1 bulan, jam 00:00 UTC
- **Cocok untuk**: Development, self-hosted server

### 2. Vercel Cron (Cloud)
- **File**: `api/cron.js`, `vercel.json`
- **Deploy**: Ke Vercel
- **Schedule**: Setiap tanggal 1 bulan, jam 00:00 UTC
- **Cocok untuk**: Production cloud deployment

## 📁 Project Structure

```
api-sdgs/
├── index.js                    # Plain API server
├── index-scheduler.js          # API + local scheduler
├── scheduler.js                # Local scheduler logic (node-cron)
├── api/
│   └── cron.js                 # Vercel cron endpoint
├── generator/
│   ├── index.js                # Data generator script
│   ├── package.json
│   └── data/                   # Data sources (CSV files)
├── public/
│   ├── index.html              # Homepage
│   ├── desa/                   # Generated JSON files
│   └── img/                    # Images
├── vercel.json                 # Vercel config
├── package.json
├── CRON_SETUP.md              # Vercel Cron documentation
└── SCHEDULER_SETUP.md         # Local Scheduler documentation
```

## 🔧 Environment Variables

Create `.env` file:
```env
PORT=5000
GENERATOR_SECRET=your-secure-secret-key
CRON_SECRET=your-cron-secret
```

## 📖 Documentation

- [Cron Setup (Vercel)](./CRON_SETUP.md) - Cloud deployment dengan Vercel Cron
- [Scheduler Setup (Local)](./SCHEDULER_SETUP.md) - Local scheduler dengan node-cron

## 🛠️ Technologies

- **Node.js & Express** - Backend API
- **node-cron** - Local scheduling
- **Vercel Cron** - Cloud scheduling
- **CSV & JSON** - Data processing
- **Tailwind CSS** - Frontend styling

## 📝 Features

✅ Data SDGs dari seluruh desa Indonesia  
✅ Update otomatis setiap bulan  
✅ REST API sederhana  
✅ JSON response format  
✅ No authentication required  
✅ CORS enabled  
✅ Dual scheduler (local + cloud)  

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC

## 📧 Contact

- Email: info@opendesa.id
- Website: [opendesa.id](https://opendesa.id)
- GitHub: [andifahruddinakas/api-sdgs](https://github.com/andifahruddinakas/api-sdgs)

---

Made with ❤️ by OpenDesa
