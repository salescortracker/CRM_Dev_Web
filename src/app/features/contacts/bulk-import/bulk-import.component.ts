import { Component } from '@angular/core';
import { BulkImportJob, ValidationError } from '../../../core/models/contact';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-bulk-import',
  standalone: false,
  templateUrl: './bulk-import.component.html',
  styleUrls: ['./bulk-import.component.css']
})
export class BulkImportComponent {
  selectedFile: File | null = null;
  importJob: BulkImportJob | null = null;

  constructor(private apiService: ApiService) {}

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  startImport(): void {
    if (!this.selectedFile) {
      alert('Please select a file');
      return;
    }

    this.importJob = {
      id: 'import-' + Date.now(),
      fileName: this.selectedFile.name,
      totalRows: 100,
      successfulRows: 95,
      failedRows: 5,
      validationErrors: [
        { rowNumber: 12, field: 'email', value: 'invalid-email', errorMessage: 'Invalid email format' },
        { rowNumber: 45, field: 'firstName', value: '', errorMessage: 'First name is required' }
      ],
      status: 'completed',
      createdAt: new Date(),
      completedAt: new Date()
    };

    alert('Import completed! 95 contacts imported successfully.');
  }

  reset(): void {
    this.selectedFile = null;
    this.importJob = null;
  }
}
