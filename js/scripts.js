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
        inputContainer.classList.add('hide');
        proctorContainer.classList.remove('hide');
        proctorFrame.src = link;
        proctorFrame.style.display = 'block';
        
        openFullscreen();
        enableProctoringSecurity(); // Aktifkan proteksi keamanan
        proctoringStarted = true;
    } else {
        alert('Masukkan link terlebih dahulu!');
    }
}

function startQrScanning() {
    inputContainer.classList.add('hide');
    qrContainer.classList.remove('hide');

    const qrScanner = new QrScanner(
        qrVideo,
        result => {
            qrScanner.stop();
            openLink(result.data);
        },
        { returnDetailedScanResult: true }
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

    openFullscreen();
    enableProctoringSecurity(); // Aktifkan proteksi keamanan
    proctoringStarted = true;
}

// 1. Fullscreen pada level DOKUMEN UTAMA (bukan elemen iframe saja)
function openFullscreen() {
    const elem = document.documentElement; // Target seluruh layar
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }

    // Mengunci tombol pintasan OS jika didukung browser (Desktop)
    if ('keyboard' in navigator && 'lock' in navigator.keyboard) {
        navigator.keyboard.lock(["Escape", "Tab", "MetaLeft", "MetaRight", "AltLeft", "AltRight"]);
    }
}

// 2. Fungsi Pengawas Keamanan Utama
function enableProctoringSecurity() {
    // A. Cegah Gestur Usap dari Pinggir Layar (Membuka Sidebar/Notifikasi Mobile)
    const EDGE_THRESHOLD = 25; // Jarak 25px dari tepi layar
    document.addEventListener('touchstart', (e) => {
        if (!proctoringStarted) return;
        const touch = e.touches[0];
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        const isEdgeTouch = 
            touch.clientX <= EDGE_THRESHOLD || 
            touch.clientX >= screenWidth - EDGE_THRESHOLD ||
            touch.clientY <= EDGE_THRESHOLD ||
            touch.clientY >= screenHeight - EDGE_THRESHOLD;

        if (isEdgeTouch) {
            e.preventDefault(); // Batalkan gerakan usap
            redirectToWarningPage();
        }
    }, { passive: false });

    // B. Deteksi Kehilangan Fokus (Membuka Menu Sistem / Aplikasi Lain)
    window.addEventListener('blur', () => {
        if (!proctoringStarted) return;
        
        // Jeda sebentar untuk memverifikasi apakah klik terjadi di dalam iframe
        setTimeout(() => {
            if (document.activeElement !== proctorFrame) {
                redirectToWarningPage();
            }
        }, 150);
    });

    // C. Deteksi Perubahan Layar / Split Screen
    window.addEventListener('resize', () => {
        if (!proctoringStarted) return;
        if (!document.fullscreenElement) {
            redirectToWarningPage();
        }
    });
}

// Handler Perubahan Fullscreen
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

function handleFullscreenChange() {
    if (!document.fullscreenElement && proctoringStarted) {
        redirectToWarningPage();
    }
}

function redirectToWarningPage() {
    alert('Pelanggaran terdeteksi! Anda mencoba keluar dari layar ujian atau membuka menu lain.');
    window.location.href = 'https://ujianalanshar.blogspot.com/p/menyembunyikan-elemen-elemen-yang-tidak.html';
}

// Cegah Klik Kanan & Kombinasi Tombol Pintasan
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', function (e) {
    if (!proctoringStarted) return;
    
    // Blokir Tab, Alt, Windows/Cmd, F12, Ctrl+T, Ctrl+W, Ctrl+N, Ctrl+R
    if (
        e.key === 'Tab' || 
        e.key === 'Meta' || 
        e.altKey || 
        e.key === 'F12' || 
        (e.ctrlKey && (e.key === 't' || e.key === 'w' || e.key === 'n' || e.key === 'r'))
    ) {
        e.preventDefault();
    }
});
