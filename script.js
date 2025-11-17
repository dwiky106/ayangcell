document.addEventListener('DOMContentLoaded', () => {
    // GANTI DENGAN URL WEB APP GOOGLE APPS SCRIPT ANDA!
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxTrg67EkG9j1ebQTbkCrb4_4_eYtLw-1ccd0qBzDszrw9V-yW0TJeRN9RN68kwnx7SgQ/exec'; 

    const form = document.getElementById('financeForm');
    const jenisTransaksi = document.getElementById('jenisTransaksi');
    const statusPembayaran = document.getElementById('statusPembayaran');
    
    // Variabel elemen baru
    const jalurGroup = document.getElementById('jalurGroup');
    const eWalletGroup = document.getElementById('eWalletGroup');
    const terhutangGroup = document.getElementById('terhutangGroup');
    
    const inputButton = document.getElementById('inputButton');
    const statusMessage = document.getElementById('statusMessage');

    // --- Logika Tampilan Bersyarat ---

    jenisTransaksi.addEventListener('change', () => {
        const selectedValue = jenisTransaksi.value;
        const jenisEwallet = document.getElementById('jenisEwallet');
        const jalurTransaksi = document.getElementById('jalurTransaksi');

        // 1. Logika E-Wallet (Tampil saat TOP UP E-Wallet)
        if (selectedValue === 'TOP UP E-Wallet') {
            eWalletGroup.classList.remove('hidden');
            jenisEwallet.setAttribute('required', 'required');
        } else {
            eWalletGroup.classList.add('hidden');
            jenisEwallet.removeAttribute('required');
        }

        // 2. Logika JALUR Transaksi (Tampil saat Tarik Tunai)
        if (selectedValue === 'Tarik Tunai') {
            jalurGroup.classList.remove('hidden');
            jalurTransaksi.setAttribute('required', 'required');
        } else {
            jalurGroup.classList.add('hidden');
            jalurTransaksi.removeAttribute('required');
        }
    });

    // 3. Logika Nominal Terhutang
    statusPembayaran.addEventListener('change', () => {
        if (statusPembayaran.value === 'Terhutang') {
            terhutangGroup.classList.remove('hidden');
            document.getElementById('nominalTerhutang').setAttribute('required', 'required');
        } else {
            terhutangGroup.classList.add('hidden');
            document.getElementById('nominalTerhutang').removeAttribute('required');
            document.getElementById('nominalTerhutang').value = 0;
        }
    });

    // --- Logika Pengiriman Data ke Google Apps Script ---
    form.addEventListener('submit', function(e) {
        e.preventDefault(); 
        
        if (APPS_SCRIPT_URL.includes('GANTI_DENGAN_URL')) {
            displayMessage('error', '⚠️ HARAP GANTI APPS_SCRIPT_URL di file script.js dengan URL Deployment Anda!', 10000);
            return;
        }

        displayMessage('loading', 'Mengirim data...');
        inputButton.disabled = true;

        const formData = new FormData(this);
        const data = {};
        
        formData.forEach((value, key) => {
            // Logika membersihkan data dari elemen tersembunyi
            if (key === 'jalurTransaksi' && jenisTransaksi.value !== 'Tarik Tunai') {
                return; // Jangan kirim data jalur jika bukan Tarik Tunai
            }
            if (key === 'jenisEwallet' && jenisTransaksi.value !== 'TOP UP E-Wallet') {
                return; // Jangan kirim data e-wallet jika bukan Top Up
            }
            if (key === 'nominalTerhutang' && statusPembayaran.value !== 'Terhutang') {
                data[key] = 0; // Set ke 0 jika status Lunas
                return;
            }
            
            data[key] = value;
        });
        
        if (data.nominalTerhutang === '') {
            data.nominalTerhutang = 0;
        }


        // Kirim data menggunakan Fetch API
        fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(data).toString()
        })
        .then(response => {
            displayMessage('success', '✅ Data Berhasil Dicatat!', 5000);
            form.reset(); 
            // Sembunyikan kembali grup bersyarat
            eWalletGroup.classList.add('hidden');
            jalurGroup.classList.add('hidden');
            terhutangGroup.classList.add('hidden');
            document.getElementById('nominalTerhutang').value = '';
        })
        .catch(error => {
            console.error('Error:', error);
            displayMessage('error', '❌ Gagal Mencatat Data! Cek koneksi internet atau URL Apps Script.', 8000);
        })
        .finally(() => {
            inputButton.disabled = false; 
        });
    });

    // Fungsi utilitas
    function displayMessage(type, message, duration) {
        statusMessage.className = `status-message ${type}`;
        statusMessage.textContent = message;
        
        if (duration) {
            setTimeout(() => {
                statusMessage.textContent = '';
                statusMessage.className = 'status-message';
            }, duration);
        }
    }
});
