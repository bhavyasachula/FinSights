# FinSights 📊
### Bank Statement Analyzer

FinSights is a modern, full-stack financial intelligence tool that transforms static, complex bank statements (PDFs) into interactive, actionable visual insights. Using **Google Gemini AI**, it automatically extracts transaction ledgers, daily burn rates, and financial runway predictions to help you understand your spending patterns at a glance.

![FinSights UI](https://img.shields.io/badge/Tech-React%20%7C%20Node.js%20%7C%20%20-blueviolet)
![Status](https://img.shields.io/badge/Status-Live-success)

---

## ✨ Key Features

- **🧠 AI-Driven Extraction**: Leverages to parse complex PDF bank statements with high accuracy.
- **🗺️ Interactive Spending Treemap**: Visualize your transaction ledger using a D3.js-powered treemap, grouped by categories and merchants.
- **⚡ Real-time Analysis**: Watch the progress in real-time as the AI processes your data.
- **⛽ Burn Rate Gauge**: Track your monthly spending versus credits with a sleek, interactive gauge.
- **🛫 Financial Runway**: Get an automatic estimate of how many months your current balance will last based on your burn rate.
- **🏬 Top Merchant Insights**: Identify your biggest spenders with categorized bar charts.
- **🚀 Ultra-Modern UI**: Built with Framer Motion for smooth transitions and a premium glassmorphism aesthetic.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Visualizations**: [D3.js](https://d3js.org/) & Recharts

### **Backend**
- **Runtime**: [Node.js](https://nodejs.org/)
- **Server**: [Express](https://expressjs.com/)
- **AI Engine**: [Google Generative AI (Gemini SDK)](https://ai.google.dev/)
- **File Handling**: [Multer](https://github.com/expressjs/multer)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- [API Key] model should be capable enough to analyze the pdf.

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/FinSights.git
   cd FinSights
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory:
   ```env
   API_KEY=api_key_here
   PORT=3001
   ```

3. **Setup Frontend**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. **Start the Server** (from `/server`):
   ```bash
   npm run dev
   ```

2. **Start the Frontend** (from `/client`):
   ```bash
   npm run dev
   ```

3. **Access the App**:
   Open `http://localhost:5173` in your browser.

---

## 📖 How to Use

1. **Upload**: Drag and drop your Bank Statement (PDF) into the upload zone.
2. **Analyze**: Wait a few seconds for Gemini AI to parse and categorize your transactions.
3. **Explore**: 
   - Hover over the **Treemap** to see individual transaction values.
   - Check the **Burn Rate** gauge to see if you're spending more than you earn.
   - View the **Runway** card to see your financial health projection.
   - Toggle **Top Merchants** to identify where your money goes.

---

## 🛡️ Security & Privacy

- **No Persistence**: Uploaded PDFs are processed in-memory (or temporarily stored) and immediately deleted after analysis.
- **Local Control**: Your financial data is sent to AI for processing but is never stored in a permanent database by this application.
---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git checkout origin feature/AmazingFeature`)
5. Open a Pull Request

---

