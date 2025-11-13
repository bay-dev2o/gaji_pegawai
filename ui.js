import { 
  hitungGajiPokok, 
  hitungTunjanganKeluarga, 
  hitungTunjanganAnak, 
  hitungTunjanganJabatan, 
  hitungGajiBersih,
  formatRupiah,
  showNotification,
  showLoading,
  openConfirmModal,
  exportToCSV,
  calculateReportSummary
} from './utils.js';

export class UIHandler {
  constructor() {
    this.currentEmployeeId = null;
    this.initEventListeners();
  }

  initEventListeners() {
    // Make sure DOM is loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initEventListenersInternal());
    } else {
      this.initEventListenersInternal();
    }
  }

  initEventListenersInternal() {
    // Form elements
    const form = document.getElementById('employee-form');
    const golonganSelect = document.getElementById('golongan');
    const statusKeluargaSelect = document.getElementById('status-keluarga');
    const jumlahAnakSelect = document.getElementById('jumlah-anak');
    const jabatanSelect = document.getElementById('jabatan');
    
    // Button elements
    const exportBtn = document.getElementById('export-btn');
    const printReportBtn = document.getElementById('print-report');
    const closeReportBtn = document.getElementById('close-report');
    
    // Search element
    const searchInput = document.getElementById('search-input');
    
    // Form submit
    if (form) {
      form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }
    
    // Golongan change
    if (golonganSelect) {
      golonganSelect.addEventListener('change', () => this.calculateSalaries());
    }
    
    // Status keluarga change
    if (statusKeluargaSelect) {
      statusKeluargaSelect.addEventListener('change', () => {
        const jumlahAnakSelect = document.getElementById('jumlah-anak');
        if (statusKeluargaSelect.value === 'Nikah') {
          if (jumlahAnakSelect) {
            jumlahAnakSelect.disabled = false;
          }
        } else {
          if (jumlahAnakSelect) {
            jumlahAnakSelect.disabled = true;
            jumlahAnakSelect.value = '0';
          }
        }
        this.calculateSalaries();
      });
    }
    
    // Jumlah anak change
    if (jumlahAnakSelect) {
      jumlahAnakSelect.addEventListener('change', () => this.calculateSalaries());
    }
    
    // Jabatan change
    if (jabatanSelect) {
      jabatanSelect.addEventListener('change', () => this.calculateSalaries());
    }
    
    // Export button
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.handleExport());
    }
    
    // Print report button
    if (printReportBtn) {
      printReportBtn.addEventListener('click', () => this.handlePrintReport());
    }
    
    // Close report button
    if (closeReportBtn) {
      closeReportBtn.addEventListener('click', () => {
        const reportModal = document.getElementById('report-modal');
        if (reportModal) {
          reportModal.classList.remove('active');
        }
      });
    }
    
    // Search input
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }
  }

  calculateSalaries() {
    const golongan = document.getElementById('golongan')?.value || '';
    const statusKeluarga = document.getElementById('status-keluarga')?.value || '';
    const jumlahAnak = parseInt(document.getElementById('jumlah-anak')?.value) || 0;
    const jabatan = document.getElementById('jabatan')?.value || '';
    
    // Hitung gaji pokok
    const gajiPokok = hitungGajiPokok(golongan);
    const gajiPokokInput = document.getElementById('gaji-pokok');
    if (gajiPokokInput) {
      gajiPokokInput.value = gajiPokok;
    }
    
    // Hitung tunjangan keluarga
    const tunjanganKeluarga = hitungTunjanganKeluarga(gajiPokok, statusKeluarga);
    const tunjanganKeluargaInput = document.getElementById('tunjangan-keluarga');
    if (tunjanganKeluargaInput) {
      tunjanganKeluargaInput.value = tunjanganKeluarga;
    }
    
    // Hitung tunjangan anak
    const tunjanganAnak = hitungTunjanganAnak(gajiPokok, jumlahAnak);
    const tunjanganAnakInput = document.getElementById('tunjangan-anak');
    if (tunjanganAnakInput) {
      tunjanganAnakInput.value = tunjanganAnak;
    }
    
    // Hitung tunjangan jabatan
    const tunjanganJabatan = hitungTunjanganJabatan(gajiPokok, jabatan);
    const tunjanganJabatanInput = document.getElementById('tunjangan-jabatan');
    if (tunjanganJabatanInput) {
      tunjanganJabatanInput.value = tunjanganJabatan;
    }
    
    // Hitung gaji bersih
    const gajiBersih = hitungGajiBersih(gajiPokok, tunjanganKeluarga, tunjanganAnak, tunjanganJabatan);
    const gajiBersihInput = document.getElementById('gaji-bersih');
    if (gajiBersihInput) {
      gajiBersihInput.value = gajiBersih;
    }
  }

  populateForm(employee) {
    const namaInput = document.getElementById('nama');
    const nikInput = document.getElementById('nik');
    const golonganSelect = document.getElementById('golongan');
    const gajiPokokInput = document.getElementById('gaji-pokok');
    const statusKeluargaSelect = document.getElementById('status-keluarga');
    const tunjanganKeluargaInput = document.getElementById('tunjangan-keluarga');
    const jumlahAnakSelect = document.getElementById('jumlah-anak');
    const tunjanganAnakInput = document.getElementById('tunjangan-anak');
    const jabatanSelect = document.getElementById('jabatan');
    const tunjanganJabatanInput = document.getElementById('tunjangan-jabatan');
    const gajiBersihInput = document.getElementById('gaji-bersih');
    
    if (namaInput) namaInput.value = employee.nama || '';
    if (nikInput) nikInput.value = employee.nik || '';
    if (golonganSelect) golonganSelect.value = employee.golongan || '';
    if (gajiPokokInput) gajiPokokInput.value = employee.gajiPokok || '';
    if (statusKeluargaSelect) statusKeluargaSelect.value = employee.statusKeluarga || '';
    if (tunjanganKeluargaInput) tunjanganKeluargaInput.value = employee.tunjanganKeluarga || '';
    if (jumlahAnakSelect) jumlahAnakSelect.value = employee.jumlahAnak || '0';
    if (tunjanganAnakInput) tunjanganAnakInput.value = employee.tunjanganAnak || '';
    if (jabatanSelect) jabatanSelect.value = employee.jabatan || '';
    if (tunjanganJabatanInput) tunjanganJabatanInput.value = employee.tunjanganJabatan || '';
    if (gajiBersihInput) gajiBersihInput.value = employee.gajiBersih || '';
    
    // Enable/disable jumlah anak based on status
    if (jumlahAnakSelect) {
      if (employee.statusKeluarga === 'Nikah') {
        jumlahAnakSelect.disabled = false;
      } else {
        jumlahAnakSelect.disabled = true;
      }
    }
    
    this.currentEmployeeId = employee.id;
  }

  clearForm() {
    const form = document.getElementById('employee-form');
    const jumlahAnakSelect = document.getElementById('jumlah-anak');
    
    if (form) {
      form.reset();
    }
    
    if (jumlahAnakSelect) {
      jumlahAnakSelect.disabled = true;
    }
    
    this.currentEmployeeId = null;
    this.calculateSalaries(); // Reset calculated values
  }

  renderEmployeeList(employees) {
    const container = document.getElementById('employee-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (employees.length === 0) {
      container.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Tidak ada data pegawai</p>';
      return;
    }
    
    employees.forEach(employee => {
      const card = document.createElement('div');
      card.className = 'employee-card';
      card.innerHTML = `
        <h3>${employee.nama || 'Nama tidak tersedia'}</h3>
        <div class="employee-info">
          <p><strong>NIK:</strong> ${employee.nik || 'Tidak tersedia'}</p>
          <p><strong>Golongan:</strong> ${employee.golongan || 'Tidak tersedia'}</p>
          <p><strong>Gaji Pokok:</strong> ${formatRupiah(employee.gajiPokok || 0)}</p>
          <p><strong>Status:</strong> ${employee.statusKeluarga || 'Tidak tersedia'}</p>
          <p><strong>Tunjangan Keluarga:</strong> ${formatRupiah(employee.tunjanganKeluarga || 0)}</p>
          <p><strong>Jumlah Anak:</strong> ${employee.jumlahAnak || 0}</p>
          <p><strong>Tunjangan Anak:</strong> ${formatRupiah(employee.tunjanganAnak || 0)}</p>
          <p><strong>Jabatan:</strong> ${employee.jabatan || 'Tidak tersedia'}</p>
          <p><strong>Tunjangan Jabatan:</strong> ${formatRupiah(employee.tunjanganJabatan || 0)}</p>
          <p><strong>Gaji Bersih:</strong> ${formatRupiah(employee.gajiBersih || 0)}</p>
        </div>
        <div class="employee-actions">
          <button class="btn-icon edit-btn" data-id="${employee.id}">
            <svg class="icon" viewBox="0 0 24 24">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
            Edit
          </button>
          <button class="btn-icon delete-btn" data-id="${employee.id}">
            <svg class="icon" viewBox="0 0 24 24">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
            Hapus
          </button>
        </div>
      `;
      
      container.appendChild(card);
    });
    
    // Add event listeners to edit and delete buttons using event delegation
    container.addEventListener('click', (e) => {
      // Handle edit button click
      if (e.target.closest('.edit-btn')) {
        const editBtn = e.target.closest('.edit-btn');
        const id = editBtn.dataset.id;
        console.log('Edit button clicked, ID:', id);
        if (id && this.onEditEmployee) {
          this.onEditEmployee(id);
        }
        return;
      }
      
      // Handle delete button click
      if (e.target.closest('.delete-btn')) {
        const deleteBtn = e.target.closest('.delete-btn');
        const id = deleteBtn.dataset.id;
        console.log('Delete button clicked, ID:', id);
        if (id && this.onDeleteEmployee) {
          this.onDeleteEmployee(id);
        }
        return;
      }
    });
  }

  handleFormSubmit(e) {
    e.preventDefault();
    if (this.onSubmitForm) {
      this.onSubmitForm();
    }
  }

  onSubmitForm() {
    // Implementation will be provided by app.js
  }

  onEditEmployee(id) {
    // Implementation will be provided by app.js
  }

  onDeleteEmployee(id) {
    // Implementation will be provided by app.js
  }

  handleSearch(query) {
    // Implementation will be provided by app.js
  }

  handleExport() {
    // Implementation will be provided by app.js
  }

  handlePrintReport() {
    const reportContent = document.getElementById('report-content');
    if (!reportContent) return;
    
    const printContents = reportContent.innerHTML;
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    location.reload();
  }

  showReportModal(employees) {
    const modal = document.getElementById('report-modal');
    const content = document.getElementById('report-content');
    
    if (!modal || !content) return;
    
    const summary = calculateReportSummary(employees);
    
    content.innerHTML = `
      <div class="report-section">
        <h4>Rekap Total Gaji</h4>
        <div class="report-item">
          <span>Total Gaji Bersih:</span>
          <span>${formatRupiah(summary.totalGaji)}</span>
        </div>
      </div>
      
      <div class="report-section">
        <h4>Distribusi Tunjangan</h4>
        <div class="report-item">
          <span>Tunjangan Keluarga:</span>
          <span>${formatRupiah(summary.totalTunjanganKeluarga)}</span>
        </div>
        <div class="report-item">
          <span>Tunjangan Anak:</span>
          <span>${formatRupiah(summary.totalTunjanganAnak)}</span>
        </div>
        <div class="report-item">
          <span>Tunjangan Jabatan:</span>
          <span>${formatRupiah(summary.totalTunjanganJabatan)}</span>
        </div>
        <div class="report-item report-total">
          <span>Total Tunjangan:</span>
          <span>${formatRupiah(summary.totalTunjanganKeluarga + summary.totalTunjanganAnak + summary.totalTunjanganJabatan)}</span>
        </div>
      </div>
      
      <div class="report-section">
        <h4>Jumlah Pegawai: ${employees.length}</h4>
      </div>
    `;
    
    modal.classList.add('active');
  }
}