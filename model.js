class Model {
    constructor() {
        // Chiave utilizzata per salvare e recuperare i dati dal localStorage
        this.storageKey = 'timeTrackerData_v1';
        
        // Inizializzazione dati: tenta di recuperare dal localStorage, altrimenti array vuoto
        const savedData = localStorage.getItem(this.storageKey);
        this.entries = savedData ? JSON.parse(savedData) : [];
    }

    // Metodo privato per salvare lo stato aggiornato nel localStorage
    _commit(entries) {
        this.entries = entries;
        // Ordiniamo sempre in modo decrescente per data (dal più recente al più vecchio)
        this.entries.sort((a, b) => new Date(b.date) - new Date(a.date));
        localStorage.setItem(this.storageKey, JSON.stringify(this.entries));
    }

    // Aggiunge una nuova registrazione
    addEntry(date, hours, rate, description) {
        const newEntry = {
            id: Date.now().toString(), // Generazione di un ID univoco basato sul timestamp
            date: date,
            hours: parseFloat(hours),
            rate: parseFloat(rate),
            description: description.trim()
        };
        
        // Creiamo un nuovo array aggiungendo la nuova voce e lo salviamo
        this._commit([...this.entries, newEntry]);
        return newEntry;
    }

    // Elimina una registrazione tramite il suo ID
    deleteEntry(id) {
        const updatedEntries = this.entries.filter(entry => entry.id !== id);
        this._commit(updatedEntries);
    }

    // Restituisce l'intero storico delle registrazioni
    getEntries() {
        return this.entries;
    }

    // Algoritmo di Reporting: filtra per data e calcola totali
    generateReport(startDateStr, endDateStr) {
        const start = new Date(startDateStr);
        const end = new Date(endDateStr);
        
        // Impostiamo la data di fine all'ultimo millisecondo della giornata per includerla correttamente
        end.setHours(23, 59, 59, 999);

        // Filtra le voci che rientrano nel range selezionato
        const filteredEntries = this.entries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= start && entryDate <= end;
        });

        // Calcola Somme (Ore e Compenso)
        const totalHours = filteredEntries.reduce((sum, entry) => sum + entry.hours, 0);
        const totalRevenue = filteredEntries.reduce((sum, entry) => sum + (entry.hours * entry.rate), 0);

        return {
            count: filteredEntries.length,
            totalHours: totalHours,
            totalRevenue: totalRevenue
        };
    }

    // Genera un file JSON scaricabile per esportare i dati
    exportData() {
        const dataStr = JSON.stringify(this.entries, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        const exportFileDefaultName = `time_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', url);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        // Pulizia dell'URL creato per evitare memory leaks
        URL.revokeObjectURL(url);
    }

    // Analizza una stringa JSON per importare un backup
    importData(jsonString) {
        try {
            const parsedData = JSON.parse(jsonString);
            
            // Validazione strutturale base del file importato
            if (Array.isArray(parsedData)) {
                const isValid = parsedData.every(item => 
                    item.id && 
                    item.date && 
                    typeof item.hours === 'number' && 
                    typeof item.rate === 'number'
                );

                if (isValid) {
                    this._commit(parsedData);
                    return true; // Importazione avvenuta con successo
                }
            }
            return false; // Formato del JSON non valido per questa app
        } catch (error) {
            console.error("Errore durante l'analisi del file JSON:", error);
            return false; // Errore di parsing (es. file corrotto)
        }
    }
}
