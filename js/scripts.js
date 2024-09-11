// Variabel dan elemen DOM
const startButton = document.getElementById('start-btn');
const qrScanButton = document.getElementById('qr-scan-btn');
const closeQrButton = document.getElementById('close-qr-btn');
const inputContainer = document.getElementById('input-container');
const proctorContainer = document.getElementById('proctor-container');
const qrContainer = document.getElementById('qr-container');
const proctorFrame = document.getElementById('proctor-frame');
const linkInput = document.getElementById('link-input');
const qrVideo = document.getElementById('qr-video');

let proctoringStarted = false; // Flag untuk mengecek apakah proctoring sudah dimulai

startButton.addEventListener('click', startProctoring);
qrScanButton.addEventListener('click', startQrScanning);
closeQrButton.addEventListener('click', closeQrScanner);

function startProctoring() {
    const link = linkInput.value.trim();
    if (link) {
        inputContainer.classList.add('hide'); // Sembunyikan input-container
        proctorContainer.classList.remove('hide'); // Tampilkan proctor-container
        proctorFrame.src = link;
        proctorFrame.style.display = 'block'; // Pastikan iframe terlihat

        // Tunda permintaan fullscreen hingga iframe dimuat
        proctorFrame.onload = () => {
            setTimeout(() => {
                openFullscreen();
            }, 100); // Memberi jeda waktu untuk memastikan iframe siap
        };

        proctoringStarted = true; // Set flag menjadi true saat tombol Start ditekan
    } else {
        alert('Masukkan link terlebih dahulu!');
    }
}

function startQrScanning() {
    inputContainer.classList.add('hide'); // Sembunyikan input-container
    qrContainer.classList.remove('hide'); // Tampilkan qr-container

    // Inisialisasi pemindai QR dengan path worker default
    const qrScanner = new QrScanner(
        qrVideo,
        result => {
            qrScanner.stop();
            openLink(result.data); // Gunakan result.data untuk mengakses URL
        },
        {
            returnDetailedScanResult: true // Gunakan API baru
        }
    );

    qrScanner.start().catch(err => {
        console.error('Terjadi kesalahan saat memulai pemindai:', err);
    });
}

function closeQrScanner() {
    qrContainer.classList.add('hide');
    inputContainer.classList.remove('hide');
}

function openLink(link) {
    inputContainer.classList.add('hide');
    qrContainer.classList.add('hide');
    proctorContainer.classList.remove('hide');
    proctorFrame.src = link;
    proctorFrame.style.display = 'block';

    // Tampilkan pesan kepada pengguna untuk mengetuk layar atau tombol sebelum fullscreen
    alert('Silakan ketuk layar untuk memulai tampilan layar penuh.');

    proctorFrame.onload = () => {
        proctorFrame.addEventListener('click', () => {
            setTimeout(() => {
                openFullscreen();
            }, 100); // Memberi jeda waktu untuk memastikan iframe siap
        });
    };

    proctoringStarted = true;
}

// Fungsi untuk membuka mode fullscreen
function openFullscreen() {
    const elem = proctorFrame; // Menggunakan iframe sebagai elemen untuk fullscreen
    if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => {
            console.warn('Gagal masuk ke mode fullscreen:', err);
        });
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen().catch(err => {
            console.warn('Gagal masuk ke mode fullscreen:', err);
        });
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen().catch(err => {
            console.warn('Gagal masuk ke mode fullscreen:', err);
        });
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen().catch(err => {
            console.warn('Gagal masuk ke mode fullscreen:', err);
        });
    } else {
        alert('Mode layar penuh tidak didukung oleh perangkat ini.');
    }
}

// Cek apakah pengguna meninggalkan fullscreen atau beralih tab
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('msfullscreenchange', handleFullscreenChange);

function handleFullscreenChange() {
    if (!document.fullscreenElement && proctoringStarted) {
        alert('Jika tidak masuk ke mode layar penuh, silakan coba lagi atau tekan tombol fullscreen.');
        redirectToWarningPage();
    }
}

function redirectToWarningPage() {
    window.location.href = 'https://ujianalanshar.blogspot.com/p/menyembunyikan-elemen-elemen-yang-tidak.html';
}

// Cegah klik kanan dan beberapa kombinasi keyboard
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && (e.key === 't' || e.key === 'w')) {
        e.preventDefault();
    }
});
