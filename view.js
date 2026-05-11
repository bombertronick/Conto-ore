class View {
    constructor() {
        // Cache degli elementi DOM - Sezione Inserimento
        this.formEntry = document.getElementById('form-entry');
        this.inputDate = document.getElementById('entry-date');
        this.inputHours = document.getElementById('entry-hours');
        this.inputRate = document.getElementById('entry-rate');
        this.inputDesc = document.getElementById('entry-desc');

        // Cache degli elementi DOM - Sezione Storico e Notifiche
        this.historyTbody = document.getElementById('history-tbody');
        this.notificationArea = document.getElementById('notification-area');

        // Cache degli elementi DOM - Sezione Report
        this.formReport = document.getElementById('form-report');
        this.reportStart = document.getElementById('report-start');
        this.reportEnd = document.getElementById('report-end');
        this.reportResults = document.getElementById('report-results');

        // Cache degli elementi DOM - Sezione Strumenti (Import/Export)
        this.btnExport = document.getElementById('btn-export');
        this.inputImport = document.getElementById('input-import');
        
        // Imposta la data di default a oggi nel form di inserimento
        this.inputDate.valueAsDate = new Date();
    }

    // Utility: Formatta i numeri come valuta (Euro)
    formatCurrency(amount) {
        return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
    }

    // Utility: Formatta la data (gg/mm/aaaa)
    formatDate(dateString) {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString).toLocaleDateString('it-IT', options);
    }

    // Svuota i campi dopo un inserimento e resetta la data a oggi
    _resetInputForm() {
        this.formEntry.reset();
        this.inputDate.valueAsDate = new Date();
    }

    // Renderizza un messaggio di feedback visivo (verde=success, rosso=error)
    showNotification(message, type = 'success') {
        const alertBox = document.createElement('div');
        alertBox.className = `alert alert-${type}`;
        alertBox.textContent = message;

        this.notificationArea.innerHTML = ''; // Pulisce notifiche precedenti
        this.notificationArea.appendChild(alertBox);

        // Auto-rimozione della notifica dopo 3 secondi
        setTimeout(() => {
            if (this.notificationArea.contains(alertBox)) {
                alertBox.remove();
            }
        }, 3000);
    }

    // Stampa a schermo la tabella completa delle ore lavorate
    displayEntries(entries) {
        this.historyTbody.innerHTML = ''; // Svuota la tabella attuale

        if (entries.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td colspan="6" class="text-center">Nessuna registrazione presente. Inizia ad inserire le tue ore!</td>`;
            this.historyTbody.appendChild(tr);
            return;
        }

        // Genera una riga per ogni voce presente nel Model
        entries.forEach(entry => {
            const tr = document.createElement('tr');
            const totalRow = entry.hours * entry.rate;

            tr.innerHTML = `
                <td>${this.formatDate(entry.date)}</td>
                <td>${entry.description}</td>
                <td>${entry.hours}</td>
                <td>${this.formatCurrency(entry.rate)}</td>
                <td><strong>${this.formatCurrency(totalRow)}</strong></td>
                <td>
                    <button class="btn-danger delete-btn" data-id="${entry.id}">Elimina</button>
                </td>
            `;
            this.historyTbody.appendChild(tr);
        });
    }

    // Aggiorna l'area report con i totali calcolati
    displayReport(reportData, startDateStr, endDateStr) {
        this.reportResults.classList.remove('hidden'); // Rende visibile il blocco
        
        if (reportData.count === 0) {
            this.reportResults.innerHTML = `<p>Nessuna attività registrata nel periodo selezionato.</p>`;
            return;
        }

        this.reportResults.innerHTML = `
            <div class="report-summary">
                <h3>Riepilogo dal ${this.formatDate(startDateStr)} al ${this.formatDate(endDateStr)}</h3>
                <p class="report-stat">Attività svolte: <strong>${reportData.count}</strong></p>
                <p class="report-stat">Ore Totali Lavorate: <strong>${reportData.totalHours} h</strong></p>
                <p class="report-total">Compenso Totale: ${this.formatCurrency(reportData.totalRevenue)}</p>
            </div>
        `;
    }

    /* ==========================================================================
       Metodi di Binding - Usati dal Controller per collegare gli Eventi
       ========================================================================== */

    bindAddEntry(handler) {
        this.formEntry.addEventListener('submit', event => {
            event.preventDefault(); // Evita il ricaricamento della pagina
            
            const date = this.inputDate.value;
            const hours = this.inputHours.value;
            const rate = this.inputRate.value;
            const desc = this.inputDesc.value;
            
            if (date && hours && rate && desc) {
                handler(date, hours, rate, desc);
                this._resetInputForm();
            }
        });
    }

    // Sfrutta l'Event Delegation: mettiamo il listener sul <tbody>, non sui singoli bottoni
    bindDeleteEntry(handler) {
        this.historyTbody.addEventListener('click', event => {
            if (event.target.classList.contains('delete-btn')) {
                const id = event.target.getAttribute('data-id');
                handler(id);
            }
        });
    }

    bindGenerateReport(handler) {
        this.formReport.addEventListener('submit', event => {
            event.preventDefault();
            const start = this.reportStart.value;
            const end = this.reportEnd.value;
            
            if (start && end) {
                if (new Date(start) > new Date(end)) {
                    this.showNotification("Errore: la data di inizio non può essere successiva a quella di fine.", "error");
                    return;
                }
                handler(start, end);
            }
        });
    }

    bindExportData(handler) {
        this.btnExport.addEventListener('click', () => {
            handler();
        });
    }

    bindImportData(handler) {
        this.inputImport.addEventListener('change', event => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const fileContent = e.target.result;
                handler(fileContent);
                // Reset dell'input file per permettere di caricare lo stesso file più volte se necessario
                this.inputImport.value = ''; 
            };
            reader.readAsText(file);
        });
    }
}
