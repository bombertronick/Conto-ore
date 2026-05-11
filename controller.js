class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        // Inizializzazione: colleghiamo i metodi del Controller agli eventi della View
        this.view.bindAddEntry(this.handleAddEntry.bind(this));
        this.view.bindDeleteEntry(this.handleDeleteEntry.bind(this));
        this.view.bindGenerateReport(this.handleGenerateReport.bind(this));
        this.view.bindExportData(this.handleExportData.bind(this));
        this.view.bindImportData(this.handleImportData.bind(this));

        // Primo rendering: mostriamo i dati già presenti nel localStorage all'avvio
        this.onEntriesChanged(this.model.getEntries());
    }

    // Metodo chiamato ogni volta che i dati cambiano (inserimento, cancellazione, importazione)
    onEntriesChanged(entries) {
        this.view.displayEntries(entries);
        
        // Se c'è un report generato visibile, lo nascondiamo perché i dati sono cambiati
        if (!this.view.reportResults.classList.contains('hidden')) {
            this.view.reportResults.classList.add('hidden');
        }
    }

    // Gestisce l'aggiunta di una nuova attività
    handleAddEntry(date, hours, rate, desc) {
        this.model.addEntry(date, hours, rate, desc);
        this.onEntriesChanged(this.model.getEntries());
        this.view.showNotification('Attività registrata con successo!', 'success');
    }

    // Gestisce l'eliminazione di un'attività
    handleDeleteEntry(id) {
        // Opzionale: potremmo inserire un window.confirm qui, ma per rapidità eliminiamo direttamente
        this.model.deleteEntry(id);
        this.onEntriesChanged(this.model.getEntries());
        this.view.showNotification('Registrazione eliminata.', 'success');
    }

    // Gestisce la generazione del report finanziario
    handleGenerateReport(startDateStr, endDateStr) {
        const reportData = this.model.generateReport(startDateStr, endDateStr);
        this.view.displayReport(reportData, startDateStr, endDateStr);
    }

    // Gestisce l'esportazione dei dati
    handleExportData() {
        if (this.model.getEntries().length === 0) {
            this.view.showNotification('Nessun dato da esportare.', 'error');
            return;
        }
        this.model.exportData();
        this.view.showNotification('Download del file JSON avviato.', 'success');
    }

    // Gestisce l'importazione di un file JSON di backup
    handleImportData(jsonString) {
        const isSuccess = this.model.importData(jsonString);
        
        if (isSuccess) {
            this.onEntriesChanged(this.model.getEntries());
            this.view.showNotification('Dati importati con successo!', 'success');
        } else {
            this.view.showNotification('Errore: file JSON non valido o corrotto.', 'error');
        }
    }
}

// ==========================================================================
// Bootstrap dell'Applicazione
// ==========================================================================
// Una volta che tutto è caricato, istanziamo l'architettura MVC
document.addEventListener('DOMContentLoaded', () => {
    const app = new Controller(new Model(), new View());
});
