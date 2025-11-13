// Tabel referensi gaji pokok berdasarkan golongan
const GOLONGAN_GAJI_POKOK = {
  'IIIA': 2500000,
  'IIIB': 3000000,
  'IIIC': 3500000,
  'IIID': 4000000
};

// Tunjangan jabatan
const JABATAN_TUNJANGAN = {
  'Asisten Ahli': 300000,
  'Lektor': 700000,
  'Lektor Kepala': 1300000,
  'Guru Besar': null // Akan dihitung sebagai 3x gaji pokok
};

// Persentase tunjangan anak
const ANAK_TUNJANGAN = {
  1: 0.05,
  2: 0.08,
  3: 0.12
};

// Fungsi untuk menghitung gaji pokok berdasarkan golongan
export function hitungGajiPokok(golongan) {
  return GOLONGAN_GAJI_POKOK[golongan] || 0;
}

// Fungsi untuk menghitung tunjangan keluarga
export function hitungTunjanganKeluarga(gajiPokok, statusKeluarga) {
  if (statusKeluarga === 'Nikah') {
    return Math.round(gajiPokok * 0.10);
  }
  return 0;
}

// Fungsi untuk menghitung tunjangan anak
export function hitungTunjanganAnak(gajiPokok, jumlahAnak) {
  if (jumlahAnak > 0 && ANAK_TUNJANGAN[jumlahAnak]) {
    return Math.round(gajiPokok * ANAK_TUNJANGAN[jumlahAnak]);
  }
  return 0;
}

// Fungsi untuk menghitung tunjangan jabatan
export function hitungTunjanganJabatan(gajiPokok, jabatan) {
  if (jabatan === 'Guru Besar') {
    return Math.round(gajiPokok * 3);
  }
  return JABATAN_TUNJANGAN[jabatan] || 0;
}

// Fungsi untuk menghitung gaji bersih
export function hitungGajiBersih(gajiPokok, tunjanganKeluarga, tunjanganAnak, tunjanganJabatan) {
  return gajiPokok + tunjanganKeluarga + tunjanganAnak + tunjanganJabatan;
}

// Fungsi untuk memformat angka sebagai mata uang Rupiah
export function formatRupiah(number) {
  // Handle null, undefined, or non-numeric values
  if (number === null || number === undefined || isNaN(number)) {
    number = 0;
  }
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number);
}

// Fungsi untuk menampilkan notifikasi
export function showNotification(message, type = 'success') {
  const container = document.getElementById('notification-container');
  if (!container) return;
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    ${type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️'} 
    ${message}
  `;
  
  container.appendChild(notification);
  
  // Hapus notifikasi setelah 3 detik
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

// Fungsi untuk menampilkan loading indicator
export function showLoading(show) {
  const loader = document.getElementById('loading-indicator');
  if (!loader) return;
  
  if (show) {
    loader.classList.remove('hidden');
  } else {
    loader.classList.add('hidden');
  }
}

// Fungsi untuk membuka modal konfirmasi
export function openConfirmModal(message, onConfirm) {
  const modal = document.getElementById('confirmation-modal');
  const confirmYes = document.getElementById('confirm-yes');
  const confirmNo = document.getElementById('confirm-no');
  
  if (!modal || !confirmYes || !confirmNo) return;
  
  const messageElement = modal.querySelector('p');
  if (messageElement) {
    messageElement.textContent = message;
  }
  modal.classList.add('active');
  
  // Hapus event listener sebelumnya jika ada
  const newConfirmYes = confirmYes.cloneNode(true);
  confirmYes.parentNode.replaceChild(newConfirmYes, confirmYes);
  
  const newConfirmNo = confirmNo.cloneNode(true);
  confirmNo.parentNode.replaceChild(newConfirmNo, confirmNo);
  
  newConfirmYes.addEventListener('click', () => {
    modal.classList.remove('active');
    if (onConfirm) onConfirm();
  });
  
  newConfirmNo.addEventListener('click', () => {
    modal.classList.remove('active');
  });
}

// Fungsi untuk menghasilkan ID unik
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Fungsi untuk mengekspor data ke CSV
export function exportToCSV(data, filename) {
  let csv = 'Nama,NIK,Golongan,Gaji Pokok,Status Keluarga,Tunjangan Keluarga,Jumlah Anak,Tunjangan Anak,Jabatan,Tunjangan Jabatan,Gaji Bersih\n';
  
  data.forEach(item => {
    csv += `"${item.nama || ''}",`;
    csv += `"${item.nik || ''}",`;
    csv += `"${item.golongan || ''}",`;
    csv += `"${item.gajiPokok || 0}",`;
    csv += `"${item.statusKeluarga || ''}",`;
    csv += `"${item.tunjanganKeluarga || 0}",`;
    csv += `"${item.jumlahAnak || 0}",`;
    csv += `"${item.tunjanganAnak || 0}",`;
    csv += `"${item.jabatan || ''}",`;
    csv += `"${item.tunjanganJabatan || 0}",`;
    csv += `"${item.gajiBersih || 0}"\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Fungsi untuk menghitung rekap laporan
export function calculateReportSummary(employees) {
  let totalGaji = 0;
  let totalTunjanganKeluarga = 0;
  let totalTunjanganAnak = 0;
  let totalTunjanganJabatan = 0;
  
  employees.forEach(emp => {
    totalGaji += parseInt(emp.gajiBersih) || 0;
    totalTunjanganKeluarga += parseInt(emp.tunjanganKeluarga) || 0;
    totalTunjanganAnak += parseInt(emp.tunjanganAnak) || 0;
    totalTunjanganJabatan += parseInt(emp.tunjanganJabatan) || 0;
  });
  
  return {
    totalGaji,
    totalTunjanganKeluarga,
    totalTunjanganAnak,
    totalTunjanganJabatan
  };
}