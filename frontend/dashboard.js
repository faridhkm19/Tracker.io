// dashboard.js

let categoryChartInstance = null;
let trendChartInstance = null;

// Palet warna dipetakan berulang untuk kategori (jumlah kategori bisa dinamis)
const CHART_COLORS = [
  '#2563EB', '#10B981', '#F43F5E', '#F59E0B',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
];

// Mengambil dan merender chart distribusi pengeluaran per kategori
const fetchCategoryChart = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/by-category?type=expense`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const result = await response.json();

    if (!response.ok) return;

    const labels = result.data.map((item) => item.category_name);
    const values = result.data.map((item) => Number(item.total));

    const ctx = document.getElementById('categoryChart');

    // Hancurkan instance chart lama sebelum membuat yang baru,
    // supaya tidak menumpuk chart setiap kali data di-refresh
    if (categoryChartInstance) categoryChartInstance.destroy();

    categoryChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: CHART_COLORS,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
        },
      },
    });
  } catch (error) {
    console.error('Gagal memuat chart kategori:', error);
  }
};

// Mengambil dan merender chart tren bulanan
const fetchTrendChart = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/monthly-trend`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const result = await response.json();

    if (!response.ok) return;

    const labels = result.data.map((item) => item.month);
    const incomeData = result.data.map((item) => item.income);
    const expenseData = result.data.map((item) => item.expense);

    const ctx = document.getElementById('trendChart');

    if (trendChartInstance) trendChartInstance.destroy();

    trendChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Pemasukan',
            data: incomeData,
            backgroundColor: '#10B981',
          },
          {
            label: 'Pengeluaran',
            data: expenseData,
            backgroundColor: '#F43F5E',
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true },
        },
        plugins: {
          legend: { position: 'bottom' },
        },
      },
    });
  } catch (error) {
    console.error('Gagal memuat chart tren bulanan:', error);
  }
};

// Fungsi gabungan untuk memuat kedua chart sekaligus
const refreshCharts = () => {
  fetchCategoryChart();
  fetchTrendChart();
};
