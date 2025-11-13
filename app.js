import db from './db.js';
import { UIHandler } from './ui.js';
import { 
  showNotification, 
  showLoading,
  openConfirmModal,
  exportToCSV
} from './utils.js';

class EmployeeApp {
  constructor() {
    this.ui = new UIHandler();
    this.employees = [];
    this.filteredEmployees = [];
    this.currentPage = 1;
    this.itemsPerPage = 6;
    
    // Bind UI handler methods to this class
    this.ui.onSubmitForm = this.handleSubmit.bind(this);
    this.ui.onEditEmployee = this.handleEdit.bind(this);
    this.ui.onDeleteEmployee = this.handleDelete.bind(this);
    this.ui.handleSearch = this.handleSearch.bind(this);
    this.ui.handleExport = this.handleExport.bind(this);
    
    this.init();
  }

  async init() {
    try {
      showLoading(true);
      await db.init();
      await this.loadEmployees();
      showLoading(false);
    } catch (error) {
      console.error('Failed to initialize app:', error);
      showNotification('Gagal menginisialisasi aplikasi: ' + error.message, 'error');
      showLoading(false);
    }
  }

  async loadEmployees() {
    try {
      this.employees = await db.getAllEmployees();
      this.filteredEmployees = [...this.employees];
      this.renderEmployeeList();
      console.log('Loaded employees:', this.employees);
    } catch (error) {
      console.error('Failed to load employees:', error);
      showNotification('Gagal memuat data pegawai: ' + error.message, 'error');
    }
  }

  async handleSubmit() {
    const formData = new FormData(document.getElementById('employee-form'));
    const employeeData = {
      nama: formData.get('nama'),
      nik: formData.get('nik'),
      golongan: formData.get('golongan'),
      gajiPokok: parseInt(formData.get('gaji-pokok')) || 0,
      statusKeluarga: formData.get('status-keluarga'),
      tunjanganKeluarga: parseInt(formData.get('tunjangan-keluarga')) || 0,
      jumlahAnak: parseInt(formData.get('jumlah-anak')) || 0,
      tunjanganAnak: parseInt(formData.get('tunjangan-anak')) || 0,
      jabatan: formData.get('jabatan'),
      tunjanganJabatan: parseInt(formData.get('tunjangan-jabatan')) || 0,
      gajiBersih: parseInt(formData.get('gaji-bersih')) || 0
    };

    // Validasi
    if (!employeeData.nama || !employeeData.nik || !employeeData.golongan || !employeeData.jabatan) {
      showNotification('Harap lengkapi semua field yang wajib diisi', 'error');
      return;
    }

    // Validasi NIK unik
    if (!this.ui.currentEmployeeId) {
      const existingEmployee = this.employees.find(emp => emp.nik === employeeData.nik);
      if (existingEmployee) {
        showNotification('NIK sudah terdaftar', 'error');
        return;
      }
    }

    try {
      showLoading(true);
      
      if (this.ui.currentEmployeeId) {
        // Update existing employee
        employeeData.id = this.ui.currentEmployeeId;
        await db.updateEmployee(employeeData);
        showNotification('Data pegawai berhasil diperbarui');
        console.log('Updated employee:', employeeData);
      } else {
        // Add new employee
        await db.addEmployee(employeeData);
        showNotification('Data pegawai berhasil disimpan');
        console.log('Added new employee:', employeeData);
      }
      
      showLoading(false);
      this.ui.clearForm();
      await this.loadEmployees();
    } catch (error) {
      console.error('Failed to save employee:', error);
      showNotification('Gagal menyimpan data pegawai: ' + error.message, 'error');
      showLoading(false);
    }
  }

  async handleEdit(id) {
    console.log('Handling edit for ID:', id);
    try {
      const employee = await db.getEmployeeById(id);
      console.log('Retrieved employee:', employee);
      if (employee) {
        this.ui.populateForm(employee);
        // Scroll to form section
        const formSection = document.querySelector('.form-section');
        if (formSection) {
          formSection.scrollIntoView({ behavior: 'smooth' });
        }
        console.log('Editing employee:', employee);
      } else {
        showNotification('Data pegawai tidak ditemukan', 'error');
      }
    } catch (error) {
      console.error('Failed to load employee for edit:', error);
      showNotification('Gagal memuat data pegawai untuk diedit: ' + error.message, 'error');
    }
  }

  async handleDelete(id) {
    console.log('Handling delete for ID:', id);
    openConfirmModal('Apakah Anda yakin ingin menghapus data pegawai ini?', async () => {
      try {
        showLoading(true);
        await db.deleteEmployee(id);
        showNotification('Data pegawai berhasil dihapus');
        showLoading(false);
        await this.loadEmployees();
        console.log('Deleted employee with ID:', id);
      } catch (error) {
        console.error('Failed to delete employee:', error);
        showNotification('Gagal menghapus data pegawai: ' + error.message, 'error');
        showLoading(false);
      }
    });
  }

  handleSearch(query) {
    if (!query) {
      this.filteredEmployees = [...this.employees];
    } else {
      this.filteredEmployees = this.employees.filter(emp => 
        emp.nama.toLowerCase().includes(query.toLowerCase()) ||
        emp.nik.includes(query)
      );
    }
    this.currentPage = 1;
    this.renderEmployeeList();
  }

  renderEmployeeList() {
    // Implement pagination
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const paginatedEmployees = this.filteredEmployees.slice(startIndex, endIndex);
    
    this.ui.renderEmployeeList(paginatedEmployees);
    this.renderPagination();
  }

  renderPagination() {
    const totalPages = Math.ceil(this.filteredEmployees.length / this.itemsPerPage);
    const paginationContainer = document.getElementById('pagination');
    
    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }
    
    let paginationHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      paginationHTML += `
        <button class="${i === this.currentPage ? 'active' : ''}" data-page="${i}">
          ${i}
        </button>
      `;
    }
    
    paginationContainer.innerHTML = paginationHTML;
    
    // Add event listeners to pagination buttons
    document.querySelectorAll('#pagination button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.currentPage = parseInt(e.currentTarget.dataset.page);
        this.renderEmployeeList();
      });
    });
  }

  async handleExport() {
    try {
      const employees = await db.getAllEmployees();
      if (employees.length === 0) {
        showNotification('Tidak ada data untuk diekspor', 'warning');
        return;
      }
      
      exportToCSV(employees, 'data-gaji-pegawai.csv');
      showNotification('Data berhasil diekspor ke CSV');
    } catch (error) {
      console.error('Failed to export data:', error);
      showNotification('Gagal mengekspor data: ' + error.message, 'error');
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new EmployeeApp();
});