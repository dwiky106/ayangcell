document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const greetingElement = document.getElementById('greeting');
    const transactionTypeSelect = document.getElementById('transactionType');
    const otherTransactionGroup = document.getElementById('otherTransactionGroup');
    const otherTransactionInput = document.getElementById('otherTransaction');
    const paymentStatusSelect = document.getElementById('paymentStatus');
    const debtAmountGroup = document.getElementById('debtAmountGroup');
    const debtAmountInput = document.getElementById('debtAmount');
    const form = document.getElementById('transactionForm');
    const submitBtn = document.getElementById('submitBtn');
    const messageElement = document.getElementById('message');
    
    let submitTimeout; // Variabel untuk menyimpan ID timeout cadangan
    
    // --- Logika Sapaan Waktu ---
    const now = new Date();
    const hour = now.getHours(); 
    let greetingText;

    // Perubahan sapaan sesuai permintaan sebelumnya (jika ada)
    if (hour >= 4 && hour < 11) {
        greetingText = 'Selamat Pagi Ayang ☀️';
    } else if (hour >= 11 && hour < 15) {
        greetingText = 'Selamat Siang Ayang 🌤️';
    } else if (hour >= 15 && hour < 18) {
        greetingText = 'Selamat Sore Ayang 🌆';
    } else {
        greetingText = 'Selamat Malam Ayang 🌙';
    }
    greetingElement.textContent = greetingText;

    // --- Logika Formulir Dinamis (Sebutkan / Terhutang) ---
    transactionTypeSelect.addEventListener('change', (e) => {
        if (e.target.value === 'Lainnya') {
            otherTransactionGroup.classList.remove('hidden');
            otherTransactionInput.setAttribute('required', 'required');
        } else {
            otherTransactionGroup.classList.add('hidden');
            otherTransactionInput.removeAttribute('required');
        }
    });

    paymentStatusSelect.addEventListener('change', (e) => {
        if (e.target.value === 'Terhutang') {
            debtAmountGroup.classList.remove('hidden');
            debtAmountInput.setAttribute('required', 'required');
        } else {
            debtAmountGroup.classList.add('hidden');
            debtAmountInput.removeAttribute('required');
        }
    });

    // --- Fungsi Pembantu ---
    function showMessage(text, isSuccess) {
        messageElement.textContent = text;
        messageElement.className = isSuccess ? 'success' : 'error';
        messageElement.classList.remove('hidden');
    }

    function resetFormState() {
        form.reset(); 
        document.getElementById('otherTransactionGroup').classList.add('hidden');
        document.getElementById('debtAmountGroup').classList.add('hidden');
        otherTransactionInput.removeAttribute('required');
        debtAmountInput.removeAttribute('required');

        submitBtn.disabled = false;
        submitBtn.textContent = 'Input Data';
    }

    // --- 3. Logika Pengiriman Data (Submit Form via Iframe & Callback) ---

    /**
     * FUNGSI CALLBACK GLOBAL: Dipanggil oleh Apps Script setelah selesai.
     * @param {boolean} isSuccess - Status keberhasilan dari Apps Script.
     * @param {string} [errorMessage] - Pesan error jika gagal.
     */
    window.handleResponse = function(isSuccess, errorMessage) {
        clearTimeout(submitTimeout); // HAPUS TIMEOUT karena respons asli sudah tiba
        
        // Cek apakah data sudah diproses/reset oleh timeout sebelumnya
        if (submitBtn.textContent === 'Input Data' && !submitBtn.disabled) {
            return; 
        }
        
        // Hapus elemen timestamp yang dibuat
        const timestampInput = form.querySelector('input[name="Timestamp"]');
        if (timestampInput) {
            form.removeChild(timestampInput);
        }

        if (isSuccess) {
            showMessage('✅ Data berhasil diinput ke Google Spreadsheet!', true);
            resetFormState();
        } else {
            showMessage(`❌ Gagal: ${errorMessage || 'Terjadi kesalahan saat menyimpan data.'}`, false);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Input Data';
        }
    };

    // 3.2 Listener saat Form disubmit
    form.addEventListener('submit', () => {
        // Menonaktifkan tombol dan menampilkan status "diproses"
        submitBtn.disabled = true;
        submitBtn.textContent = 'Mengirim Data... ⏳';
        showMessage('Data sedang diproses...', 'message');

        // Buat kolom tersembunyi untuk Timestamp
        const timestampInput = document.createElement('input');
        timestampInput.type = 'hidden';
        timestampInput.name = 'Timestamp';
        timestampInput.value = new Date().toLocaleString('id-ID', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        form.appendChild(timestampInput);
        
        // --- TIMEOUT CADANGAN (SOLUSI DELAY) ---
        // Jika callback tidak tiba dalam 2 detik, asumsikan sukses dan reset tampilan
        submitTimeout = setTimeout(() => {
            if (submitBtn.disabled) {
                console.warn("Apps Script callback terlambat (2s limit terlampaui). Mereset tampilan untuk UX.");
                // Tampilkan sukses (asumsi data sudah masuk)
                showMessage('✅ Data Sudah Terkirim', true);
                resetFormState();
            }
        }, 2000); // 2 detik
    });
});
