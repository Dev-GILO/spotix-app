/**
 * Asset Loader for Scanner HTML Files
 * 
 * This file provides the HTML content for the scanner and admin interfaces.
 * The HTML is embedded directly as strings to avoid asset loading issues.
 */

export const SCANNER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Spotix Scanner</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/html5-qrcode"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#6b2fa5',
                        'primary-dark': '#5a2789',
                    }
                }
            }
        }
    </script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }
        .pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
        }
    </style>
</head>
<body class="bg-gray-50 min-h-screen">
    <!-- Scanner Name Modal -->
    <div id="nameModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div class="text-center mb-6">
                <div class="w-20 h-20 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                </div>
                <h2 class="text-2xl font-bold text-gray-900 mb-2">Welcome to Spotix Scanner</h2>
                <p class="text-gray-600">Enter your name to start scanning</p>
            </div>
            <div class="mb-6">
                <label for="scannerName" class="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                <input 
                    type="text" 
                    id="scannerName" 
                    placeholder="e.g., John Doe" 
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    autofocus
                >
                <p id="nameError" class="text-red-500 text-sm mt-2 hidden">Please enter your name</p>
            </div>
            <button 
                onclick="connectScanner()" 
                class="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg transition-colors duration-200"
            >
                Start Scanning
            </button>
        </div>
    </div>

    <!-- Main Scanner Interface -->
    <div id="scannerInterface" class="hidden">
        <!-- Header -->
        <div class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-6xl mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                            </svg>
                        </div>
                        <div>
                            <h1 class="text-xl font-bold text-gray-900">Spotix Scanner</h1>
                            <p class="text-sm text-gray-600" id="scannerNameDisplay"></p>
                        </div>
                    </div>
                    <div id="connectionStatus" class="flex items-center">
                        <div class="w-2 h-2 bg-green-500 rounded-full mr-2 pulse"></div>
                        <span class="text-sm font-medium text-green-600">Connected</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Stats Bar -->
        <div class="bg-primary text-white py-4">
            <div class="max-w-6xl mx-auto px-4">
                <div class="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div class="text-3xl font-bold" id="totalScans">0</div>
                        <div class="text-sm opacity-90">Total Scans</div>
                    </div>
                    <div>
                        <div class="text-3xl font-bold text-green-300" id="successfulScans">0</div>
                        <div class="text-sm opacity-90">Successful</div>
                    </div>
                    <div>
                        <div class="text-3xl font-bold text-red-300" id="failedScans">0</div>
                        <div class="text-sm opacity-90">Failed</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Scanner Section -->
        <div class="max-w-6xl mx-auto px-4 py-8">
            <div class="grid md:grid-cols-2 gap-8">
                <!-- QR Scanner -->
                <div>
                    <div class="bg-white rounded-2xl shadow-lg p-6">
                        <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <svg class="w-6 h-6 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            QR Code Scanner
                        </h2>
                        <div id="qr-reader" class="rounded-lg overflow-hidden mb-4"></div>
                        <button 
                            id="toggleScanner" 
                            onclick="toggleScanner()" 
                            class="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg transition-colors duration-200"
                        >
                            Start Camera
                        </button>
                    </div>

                    <!-- Manual Entry -->
                    <div class="bg-white rounded-2xl shadow-lg p-6 mt-6">
                        <h2 class="text-xl font-bold text-gray-900 mb-4">Manual Entry</h2>
                        <div class="flex gap-2">
                            <input 
                                type="text" 
                                id="manualTicketId" 
                                placeholder="Enter Ticket ID" 
                                class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            >
                            <button 
                                onclick="scanManual()" 
                                class="bg-primary hover:bg-primary-dark text-white font-semibold px-6 rounded-lg transition-colors duration-200"
                            >
                                Verify
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Scan Results -->
                <div>
                    <div class="bg-white rounded-2xl shadow-lg p-6">
                        <h2 class="text-xl font-bold text-gray-900 mb-4">Recent Scans</h2>
                        <div id="scanResults" class="space-y-3 max-h-[600px] overflow-y-auto">
                            <div class="text-center text-gray-500 py-8">
                                <svg class="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                </svg>
                                <p>No scans yet</p>
                                <p class="text-sm">Start scanning tickets to see results here</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let scannerId = null;
        let html5QrCode = null;
        let isScanning = false;
        let stats = {
            total: 0,
            successful: 0,
            failed: 0
        };

        function connectScanner() {
            const scannerName = document.getElementById('scannerName').value.trim();
            const errorElem = document.getElementById('nameError');
            
            if (!scannerName) {
                errorElem.classList.remove('hidden');
                return;
            }
            
            errorElem.classList.add('hidden');

            fetch('/api/scanner/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scannerName })
            })
            .then(res => res.json())
            .then(data => {
                scannerId = data.scannerId;
                document.getElementById('scannerNameDisplay').textContent = scannerName;
                document.getElementById('nameModal').classList.add('hidden');
                document.getElementById('scannerInterface').classList.remove('hidden');
            })
            .catch(err => {
                alert('Failed to connect. Please check your connection.');
                console.error('Connect error:', err);
            });
        }

        function toggleScanner() {
            if (isScanning) {
                stopScanner();
            } else {
                startScanner();
            }
        }

        function startScanner() {
            html5QrCode = new Html5Qrcode("qr-reader");
            
            html5QrCode.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    verifyTicket(decodedText);
                },
                (errorMessage) => {
                    // Ignore scan errors
                }
            ).then(() => {
                isScanning = true;
                document.getElementById('toggleScanner').textContent = 'Stop Camera';
                document.getElementById('toggleScanner').classList.remove('bg-primary');
                document.getElementById('toggleScanner').classList.add('bg-red-500', 'hover:bg-red-600');
            }).catch(err => {
                console.error('Scanner error:', err);
                alert('Failed to start camera. Please allow camera access.');
            });
        }

        function stopScanner() {
            if (html5QrCode) {
                html5QrCode.stop().then(() => {
                    isScanning = false;
                    document.getElementById('toggleScanner').textContent = 'Start Camera';
                    document.getElementById('toggleScanner').classList.add('bg-primary', 'hover:bg-primary-dark');
                    document.getElementById('toggleScanner').classList.remove('bg-red-500', 'hover:bg-red-600');
                });
            }
        }

        function scanManual() {
            const ticketId = document.getElementById('manualTicketId').value.trim();
            if (ticketId) {
                verifyTicket(ticketId);
                document.getElementById('manualTicketId').value = '';
            }
        }

        function verifyTicket(ticketId) {
            fetch('/api/scan/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticketId, scannerId })
            })
            .then(res => res.json())
            .then(data => {
                stats.total++;
                
                if (data.success) {
                    stats.successful++;
                    showScanResult(ticketId, 'success', data.message, data.ticketData);
                    playSound('success');
                } else {
                    stats.failed++;
                    showScanResult(ticketId, data.status, data.message, data.ticketData);
                    playSound('error');
                }
                
                updateStats();
            })
            .catch(err => {
                console.error('Verify error:', err);
                stats.total++;
                stats.failed++;
                showScanResult(ticketId, 'failed', 'Network error');
                updateStats();
            });
        }

        function showScanResult(ticketId, status, message, ticketData = null) {
            const resultsDiv = document.getElementById('scanResults');
            
            // Remove empty state
            if (resultsDiv.querySelector('.text-center')) {
                resultsDiv.innerHTML = '';
            }

            const colors = {
                success: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-700', icon: '✓' },
                already_verified: { bg: 'bg-yellow-50', border: 'border-yellow-500', text: 'text-yellow-700', icon: '⚠' },
                failed: { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-700', icon: '✗' }
            };

            const color = colors[status] || colors.failed;
            
            const resultHtml = \`
                <div class="\${color.bg} border-l-4 \${color.border} p-4 rounded-r-lg animate-fade-in">
                    <div class="flex items-start">
                        <div class="flex-shrink-0">
                            <span class="text-2xl">\${color.icon}</span>
                        </div>
                        <div class="ml-3 flex-1">
                            <p class="font-semibold \${color.text}">\${message}</p>
                            <p class="text-sm text-gray-600 mt-1">Ticket ID: \${ticketId}</p>
                            \${ticketData ? \`
                                <div class="mt-2 text-sm text-gray-700">
                                    <p><strong>Name:</strong> \${ticketData.attendeeName}</p>
                                    <p><strong>Type:</strong> \${ticketData.ticketType}</p>
                                    \${ticketData.verifiedAt ? \`<p class="text-xs text-gray-500 mt-1">Previously verified: \${ticketData.verifiedAt}</p>\` : ''}
                                </div>
                            \` : ''}
                            <p class="text-xs text-gray-500 mt-2">\${new Date().toLocaleTimeString()}</p>
                        </div>
                    </div>
                </div>
            \`;
            
            resultsDiv.insertAdjacentHTML('afterbegin', resultHtml);
            
            // Keep only last 20 results
            while (resultsDiv.children.length > 20) {
                resultsDiv.removeChild(resultsDiv.lastChild);
            }
        }

        function updateStats() {
            document.getElementById('totalScans').textContent = stats.total;
            document.getElementById('successfulScans').textContent = stats.successful;
            document.getElementById('failedScans').textContent = stats.failed;
        }

        function playSound(type) {
            // Create audio feedback
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            if (type === 'success') {
                oscillator.frequency.value = 800;
                gainNode.gain.value = 0.3;
            } else {
                oscillator.frequency.value = 400;
                gainNode.gain.value = 0.5;
            }
            
            oscillator.start();
            setTimeout(() => oscillator.stop(), 150);
        }

        // Handle Enter key in manual input
        document.addEventListener('DOMContentLoaded', () => {
            document.getElementById('manualTicketId').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    scanManual();
                }
            });

            document.getElementById('scannerName').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    connectScanner();
                }
            });
        });
    </script>
</body>
</html>`;

export const ADMIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Spotix Admin Panel</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#6b2fa5',
                        'primary-dark': '#5a2789',
                    }
                }
            }
        }
    </script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }
        .pulse-slow {
            animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .slide-in {
            animation: slideIn 0.3s ease-out;
        }
    </style>
</head>
<body class="bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <div class="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mr-4 shadow-lg">
                        <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">Admin Control Panel</h1>
                        <p class="text-sm text-gray-600" id="eventName">Loading...</p>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <div id="liveIndicator" class="flex items-center bg-green-50 px-3 py-2 rounded-lg">
                        <div class="w-3 h-3 bg-green-500 rounded-full mr-2 pulse-slow"></div>
                        <span class="text-sm font-medium text-green-700">Live</span>
                    </div>
                    <div class="text-right">
                        <div class="text-sm text-gray-500">Last Update</div>
                        <div id="lastUpdate" class="text-sm font-semibold text-gray-900">--:--:--</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Stats Overview -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div class="flex items-center justify-between mb-2">
                    <div class="text-sm font-medium text-gray-600">Total Scans</div>
                    <div class="w-10 h-10 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                    </div>
                </div>
                <div class="text-4xl font-bold text-gray-900" id="totalScans">0</div>
            </div>

            <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div class="flex items-center justify-between mb-2">
                    <div class="text-sm font-medium text-gray-600">Successful</div>
                    <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                </div>
                <div class="text-4xl font-bold text-green-600" id="successfulScans">0</div>
            </div>

            <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div class="flex items-center justify-between mb-2">
                    <div class="text-sm font-medium text-gray-600">Failed</div>
                    <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                </div>
                <div class="text-4xl font-bold text-red-600" id="failedScans">0</div>
            </div>

            <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div class="flex items-center justify-between mb-2">
                    <div class="text-sm font-medium text-gray-600">Active Scanners</div>
                    <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                    </div>
                </div>
                <div class="text-4xl font-bold text-blue-600" id="activeScanners">0</div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Active Scanners -->
            <div class="bg-white rounded-2xl shadow-lg p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <svg class="w-6 h-6 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                    Active Scanners
                </h2>
                <div id="scannersList" class="space-y-3 max-h-96 overflow-y-auto">
                    <div class="text-center text-gray-500 py-8">
                        <p>No active scanners</p>
                    </div>
                </div>
            </div>

            <!-- Recent Scans -->
            <div class="bg-white rounded-2xl shadow-lg p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <svg class="w-6 h-6 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Recent Activity
                </h2>
                <div id="activityLog" class="space-y-2 max-h-96 overflow-y-auto">
                    <div class="text-center text-gray-500 py-8">
                        <p>No activity yet</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        function loadInitialData() {
            fetch('/api/admin/stats')
                .then(res => res.json())
                .then(data => {
                    document.getElementById('eventName').textContent = data.event.name || 'Unknown Event';
                    updateStats(data.stats);
                    updateScannersList(data.scanners);
                    updateActivityLog(data.recentScans);
                    updateLastUpdate();
                })
                .catch(err => {
                    console.error('Failed to load initial data:', err);
                });
        }

        function updateStats(stats) {
            document.getElementById('totalScans').textContent = stats.totalScans;
            document.getElementById('successfulScans').textContent = stats.successfulScans;
            document.getElementById('failedScans').textContent = stats.failedScans;
            document.getElementById('activeScanners').textContent = stats.activeScannersCount;
        }

        function updateScannersList(scanners) {
            const list = document.getElementById('scannersList');
            
            if (!scanners || scanners.length === 0) {
                list.innerHTML = '<div class="text-center text-gray-500 py-8"><p>No active scanners</p></div>';
                return;
            }

            list.innerHTML = scanners.map(scanner => \`
                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mr-3">
                                <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                </svg>
                            </div>
                            <div>
                                <div class="font-semibold text-gray-900">\${scanner.name}</div>
                                <div class="text-xs text-gray-500">Connected: \${new Date(scanner.connectedAt).toLocaleTimeString()}</div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-2xl font-bold text-primary">\${scanner.totalScans}</div>
                            <div class="text-xs text-gray-500">scans</div>
                        </div>
                    </div>
                    \${scanner.lastScanAt ? \`
                        <div class="mt-2 text-xs text-gray-500">
                            Last scan: \${new Date(scanner.lastScanAt).toLocaleTimeString()}
                        </div>
                    \` : ''}
                </div>
            \`).join('');
        }

        function updateActivityLog(scans) {
            const log = document.getElementById('activityLog');
            
            if (!scans || scans.length === 0) {
                log.innerHTML = '<div class="text-center text-gray-500 py-8"><p>No activity yet</p></div>';
                return;
            }

            log.innerHTML = scans.map(scan => {
                const colors = {
                    success: { bg: 'bg-green-50', text: 'text-green-700', icon: '✓' },
                    failed: { bg: 'bg-red-50', text: 'text-red-700', icon: '✗' },
                    already_verified: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: '⚠' }
                };
                const color = colors[scan.status] || colors.failed;
                
                return \`
                    <div class="\${color.bg} rounded-lg p-3 border border-gray-200 slide-in">
                        <div class="flex items-start">
                            <span class="text-lg mr-2">\${color.icon}</span>
                            <div class="flex-1">
                                <div class="font-medium \${color.text}">\${scan.scannerName}</div>
                                <div class="text-sm text-gray-600">Ticket: \${scan.ticketId}</div>
                                <div class="text-xs text-gray-500 mt-1">\${new Date(scan.timestamp).toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                \`;
            }).join('');
        }

        function updateLastUpdate() {
            document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            loadInitialData();
            
            // Refresh data every 2 seconds (polling)
            setInterval(() => {
                loadInitialData();
            }, 2000);
        });
    </script>
</body>
</html>`;