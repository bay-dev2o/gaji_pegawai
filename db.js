class EmployeeDatabase {
  constructor() {
    this.dbName = 'EmployeeSalaryDB';
    this.version = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = (event) => {
        console.error('Database error:', event.target.error);
        reject(new Error('Failed to open database: ' + event.target.error));
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('Database opened successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log('Upgrading database');
        
        // Create employees store if it doesn't exist
        if (!db.objectStoreNames.contains('employees')) {
          const employeeStore = db.createObjectStore('employees', { keyPath: 'id', autoIncrement: true });
          employeeStore.createIndex('nik', 'nik', { unique: true });
          employeeStore.createIndex('nama', 'nama', { unique: false });
          console.log('Created employees object store');
        }
      };
    });
  }

  async addEmployee(employee) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    const tx = this.db.transaction(['employees'], 'readwrite');
    const store = tx.objectStore('employees');
    
    // Generate ID if not provided
    if (!employee.id) {
      employee.id = Date.now() + Math.random();
    }
    
    return new Promise((resolve, reject) => {
      const request = store.add(employee);
      request.onsuccess = (event) => {
        console.log('Employee added successfully with ID:', event.target.result);
        resolve(event.target.result);
      };
      request.onerror = (event) => {
        console.error('Error adding employee:', event.target.error);
        reject(new Error('Failed to add employee: ' + event.target.error));
      };
    });
  }

  async getAllEmployees() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    const tx = this.db.transaction(['employees'], 'readonly');
    const store = tx.objectStore('employees');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = (event) => {
        console.log('Retrieved employees:', event.target.result);
        resolve(event.target.result);
      };
      request.onerror = (event) => {
        console.error('Error retrieving employees:', event.target.error);
        reject(new Error('Failed to retrieve employees: ' + event.target.error));
      };
    });
  }

  async getEmployeeById(id) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    const tx = this.db.transaction(['employees'], 'readonly');
    const store = tx.objectStore('employees');
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = (event) => {
        console.log('Retrieved employee:', event.target.result);
        resolve(event.target.result);
      };
      request.onerror = (event) => {
        console.error('Error retrieving employee:', event.target.error);
        reject(new Error('Failed to retrieve employee: ' + event.target.error));
      };
    });
  }

  async updateEmployee(employee) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    const tx = this.db.transaction(['employees'], 'readwrite');
    const store = tx.objectStore('employees');
    
    return new Promise((resolve, reject) => {
      const request = store.put(employee);
      request.onsuccess = (event) => {
        console.log('Employee updated successfully');
        resolve(event.target.result);
      };
      request.onerror = (event) => {
        console.error('Error updating employee:', event.target.error);
        reject(new Error('Failed to update employee: ' + event.target.error));
      };
    });
  }

  async deleteEmployee(id) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    const tx = this.db.transaction(['employees'], 'readwrite');
    const store = tx.objectStore('employees');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(Number(id)); // Ensure ID is a number
      request.onsuccess = (event) => {
        console.log('Employee deleted successfully');
        resolve(event.target.result);
      };
      request.onerror = (event) => {
        console.error('Error deleting employee:', event.target.error);
        reject(new Error('Failed to delete employee: ' + event.target.error));
      };
    });
  }

  async searchEmployees(query) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    const tx = this.db.transaction(['employees'], 'readonly');
    const store = tx.objectStore('employees');
    const index = store.index('nama');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll();
      request.onsuccess = (event) => {
        const allEmployees = event.target.result;
        const filtered = allEmployees.filter(emp => 
          emp.nama.toLowerCase().includes(query.toLowerCase()) ||
          emp.nik.includes(query)
        );
        console.log('Search results:', filtered);
        resolve(filtered);
      };
      request.onerror = (event) => {
        console.error('Error searching employees:', event.target.error);
        reject(new Error('Failed to search employees: ' + event.target.error));
      };
    });
  }
}

// Export as singleton instance
const db = new EmployeeDatabase();
export default db;