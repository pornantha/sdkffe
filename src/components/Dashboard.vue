<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'vue-chartjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const router = useRouter();
const isLoggedIn = ref(false);

interface DashboardData {
  pm25: number[];
  temperature: number[];
  humidity: number[];
  image_urls: string[];
}

const data = ref<DashboardData | null>(null);
const isLoading = ref(true);
const error = ref('');

onMounted(async () => {
  // Check login state
  const token = localStorage.getItem('access_token');
  if (token) {
    isLoggedIn.value = true;
  }

  try {
    const response = await fetch('https://sdokfrec.onrender.com/api/v1/sensors/dashboard/public');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    data.value = result;
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch dashboard data';
  } finally {
    isLoading.value = false;
  }
});

function handleLogout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('token_type');
  isLoggedIn.value = false;
}

function goToLogin() {
  router.push('/login');
}

// ดึงค่าล่าสุดมาแสดงที่ Card
const latestPm25 = computed(() => {
  if (!data.value || data.value.pm25.length === 0) return 0;
  return data.value.pm25[data.value.pm25.length - 1].toFixed(1);
});

const latestTemp = computed(() => {
  if (!data.value || data.value.temperature.length === 0) return 0;
  return data.value.temperature[data.value.temperature.length - 1].toFixed(1);
});

const latestHumidity = computed(() => {
  if (!data.value || data.value.humidity.length === 0) return 0;
  return data.value.humidity[data.value.humidity.length - 1].toFixed(1);
});

// ตั้งค่าข้อมูลสำหรับกราฟ
const chartData = computed(() => {
  if (!data.value) return { labels: [], datasets: [] };
  
  const length = data.value.pm25.length;
  const labels = [];
  const now = new Date();
  
  // สร้างเวลาเดินย้อนหลังทีละ 1 ชั่วโมง
  for (let i = length - 1; i >= 0; i--) {
    const pastTime = new Date(now.getTime() - (i * 60 * 60 * 1000));
    // จัดรูปแบบเวลา เช่น 13:00, 00:00
    const timeString = pastTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    labels.push(timeString);
  }
  
  return {
    labels,
    datasets: [
      {
        label: 'PM 2.5 (µg/m³)',
        backgroundColor: '#ef4444',
        borderColor: '#ef4444',
        data: data.value.pm25,
        tension: 0.3
      },
      {
        label: 'Temperature (°C)',
        backgroundColor: '#f59e0b',
        borderColor: '#f59e0b',
        data: data.value.temperature,
        tension: 0.3
      },
      {
        label: 'Humidity (%)',
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
        data: data.value.humidity,
        tension: 0.3
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
};
</script>

<template>
  <div class="dashboard-wrapper">
    <nav class="navbar">
      <div class="logo">EnvDash</div>
      <div>
        <button v-if="isLoggedIn" @click="handleLogout" class="btn logout-btn">Logout</button>
        <button v-else @click="goToLogin" class="btn login-btn">Login</button>
      </div>
    </nav>

    <div class="content">
      <div v-if="isLoading" class="loading">Loading dashboard data...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      
      <div v-else-if="data" class="dashboard-grid">
        <!-- Summary Cards -->
        <div class="cards-section">
          <div class="card pm25-card">
            <h3>PM 2.5</h3>
            <div class="value">{{ latestPm25 }} <span>µg/m³</span></div>
          </div>
          <div class="card temp-card">
            <h3>Temperature</h3>
            <div class="value">{{ latestTemp }} <span>°C</span></div>
          </div>
          <div class="card humid-card">
            <h3>Humidity</h3>
            <div class="value">{{ latestHumidity }} <span>%</span></div>
          </div>
        </div>

        <!-- Chart Section -->
        <div class="chart-section">
          <h2>Sensor Trends</h2>
          <div class="chart-container">
            <Line :data="chartData" :options="chartOptions" />
          </div>
        </div>

        <!-- Image Gallery -->
        <div class="gallery-section">
          <h2>Recent Captures</h2>
          <div class="gallery-grid">
            <div v-for="(url, index) in data.image_urls" :key="index" class="image-card">
              <img :src="url" alt="Sensor Capture" loading="lazy" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #334155;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  padding: 1rem 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #0f172a;
}

.btn {
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.logout-btn {
  background-color: #ef4444;
  color: white;
}

.logout-btn:hover {
  background-color: #dc2626;
}

.login-btn {
  background-color: #3b82f6;
  color: white;
}

.login-btn:hover {
  background-color: #2563eb;
}

.content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.loading, .error {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: #64748b;
}

.error {
  color: #ef4444;
}

.dashboard-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Cards */
.cards-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
}

.card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: #64748b;
}

.card .value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #0f172a;
}

.card .value span {
  font-size: 1rem;
  font-weight: 500;
  color: #94a3b8;
}

.pm25-card { border-top: 4px solid #ef4444; }
.temp-card { border-top: 4px solid #f59e0b; }
.humid-card { border-top: 4px solid #3b82f6; }

/* Chart */
.chart-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.chart-section h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
}

.chart-container {
  height: 350px;
  position: relative;
}

/* Gallery */
.gallery-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.gallery-section h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.image-card {
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 4/3;
  background-color: #f1f5f9;
}

.image-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.image-card:hover img {
  transform: scale(1.05);
}
</style>
