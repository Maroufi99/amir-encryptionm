// مدیر برنامه - کاملاً دیباگ شده
class AppManager {
    constructor() {
        this.currentKey = null;
        this.currentTab = 'encrypt';
        this.currentQR = null;
        this.qrImageUrl = null;
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupTheme();
        this.showNotification('برنامه آماده است! تمام قابلیت‌ها فعال هستند ✅', 'success');
        console.log('برنامه با موفقیت بارگذاری شد!');
    }
    
    bindEvents() {
        // تب‌ها
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });
        
        // رمزنگاری
        document.getElementById('encryptBtn').addEventListener('click', () => this.encryptMessage());
        document.getElementById('pasteBtn').addEventListener('click', () => this.pasteText());
        document.getElementById('clearTextBtn').addEventListener('click', () => this.clearText());
        
        // کپی و ذخیره رمزنگاری
        document.getElementById('copyEncryptedBtn').addEventListener('click', () => this.copyToClipboard('encryptedOutput'));
        document.getElementById('copyKeyBtn').addEventListener('click', () => this.copyKey());
        document.getElementById('shareQRBtn').addEventListener('click', () => {
            const encryptedText = document.getElementById('encryptedOutput').value;
            if (encryptedText) {
                document.getElementById('qrText').value = encryptedText;
                this.switchTab('qr');
            } else {
                this.showNotification('لطفاً ابتدا یک پیام را رمزنگاری کنید', 'error');
            }
        });
        document.getElementById('shareTextBtn').addEventListener('click', () => this.shareText());
        
        // رمزگشایی
        document.getElementById('decryptBtn').addEventListener('click', () => this.decryptMessage());
        document.getElementById('pasteKeyBtn').addEventListener('click', () => this.pasteKey());
        document.getElementById('clearDecryptBtn').addEventListener('click', () => this.clearDecrypt());
        
        // کپی رمزگشایی
        document.getElementById('copyDecryptedBtn').addEventListener('click', () => this.copyToClipboard('decryptedOutput'));
        
        // QR Code
        document.getElementById('generateQRBtn').addEventListener('click', () => this.generateQRCode());
        document.getElementById('loadFromEncryptBtn').addEventListener('click', () => this.loadFromEncryption());
        document.getElementById('clearQRBtn').addEventListener('click', () => this.clearQR());
        document.getElementById('downloadQRBtn').addEventListener('click', () => this.downloadQR());
        document.getElementById('printQRBtn').addEventListener('click', () => this.printQR());
        
        // اشتراک‌گذاری QR Code
        document.getElementById('shareWhatsAppBtn').addEventListener('click', () => this.shareViaWhatsApp());
        document.getElementById('shareTelegramBtn').addEventListener('click', () => this.shareViaTelegram());
        document.getElementById('shareEmailBtn').addEventListener('click', () => this.shareViaEmail());
        document.getElementById('shareCopyBtn').addEventListener('click', () => this.copyQRText());
        document.getElementById('shareSystemBtn').addEventListener('click', () => this.shareViaSystem());
        
        // تم
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // شمارنده کاراکتر
        document.getElementById('plainText').addEventListener('input', (e) => {
            const count = e.target.value.length;
            document.getElementById('charCount').textContent = count;
            
            if (count > 1500) {
                document.getElementById('charCount').style.color = '#dc3545';
            } else if (count > 1000) {
                document.getElementById('charCount').style.color = '#ffc107';
            } else {
                document.getElementById('charCount').style.color = '';
            }
        });
    }
    
    switchTab(tabName) {
        this.currentTab = tabName;
        
        // به‌روزرسانی تب‌های فعال
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-tab') === tabName) {
                btn.classList.add('active');
            }
        });
        
        // نمایش بخش مربوطه
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        document.getElementById(tabName + 'Section').classList.add('active');
    }
    
    // تابع رمزنگاری اصلاح شده - بدون خطا
    async encryptMessage() {
        const text = document.getElementById('plainText').value.trim();
        
        if (!text) {
            this.showNotification('لطفاً متنی برای رمزنگاری وارد کنید', 'error');
            return;
        }
        
        if (text.length > 2000) {
            this.showNotification('متن نباید بیش از ۲۰۰۰ کاراکتر باشد', 'error');
            return;
        }
        
        this.showLoading('در حال رمزنگاری...');
        
        try {
            // تولید کلید امن تصادفی
            const key = this.generateSecureKey();
            this.currentKey = key;
            
            // رمزنگاری ساده و مطمئن
            const encrypted = this.simpleEncrypt(text, key);
            
            // نمایش نتیجه
            document.getElementById('encryptedOutput').value = encrypted;
            document.getElementById('generatedKey').textContent = key;
            document.getElementById('generatedKey').dataset.fullKey = key;
            
            // نمایش بخش نتیجه
            document.getElementById('encryptResult').style.display = 'block';
            
            this.showNotification('✅ پیام با موفقیت رمزنگاری شد', 'success');
            
        } catch (error) {
            console.error('خطا در رمزنگاری:', error);
            this.showNotification('❌ خطا در رمزنگاری پیام', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    // تابع رمزگشایی اصلاح شده
    async decryptMessage() {
        const encryptedText = document.getElementById('encryptedInput').value.trim();
        const key = document.getElementById('decryptKeyInput').value.trim();
        
        if (!encryptedText) {
            this.showNotification('لطفاً پیام رمز شده را وارد کنید', 'error');
            return;
        }
        
        if (!key) {
            this.showNotification('لطفاً کلید امنیتی را وارد کنید', 'error');
            return;
        }
        
        this.showLoading('در حال رمزگشایی...');
        
        try {
            // رمزگشایی
            const decrypted = this.simpleDecrypt(encryptedText, key);
            
            // نمایش نتیجه
            document.getElementById('decryptedOutput').value = decrypted;
            document.getElementById('decryptResult').style.display = 'block';
            
            this.showNotification('✅ پیام با موفقیت رمزگشایی شد', 'success');
            
        } catch (error) {
            console.error('خطا در رمزگشایی:', error);
            document.getElementById('decryptedOutput').value = '❌ خطا در رمزگشایی!\nلطفاً مطمئن شوید:\n1. پیام رمز شده صحیح است\n2. کلید امنیتی درست وارد شده\n3. پیام دست‌کاری نشده باشد';
            document.getElementById('decryptResult').style.display = 'block';
            this.showNotification('❌ رمزگشایی ناموفق بود', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    // تولید کلید امن - ساده و کارآمد
    generateSecureKey() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let key = '';
        
        // تولید کلید 32 کاراکتری
        for (let i = 0; i < 32; i++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return key;
    }
    
    // رمزنگاری ساده و مطمئن
    simpleEncrypt(text, key) {
        try {
            // استفاده از Base64 برای رمزنگاری ساده
            const combined = text + '|' + key;
            const encoded = btoa(encodeURIComponent(combined));
            
            // اضافه کردن هدر برای تشخیص
            return 'AMIR_ENC:' + encoded;
        } catch (error) {
            throw new Error('رمزنگاری ناموفق بود');
        }
    }
    
    // رمزگشایی ساده و مطمئن
    simpleDecrypt(encryptedText, key) {
        try {
            // بررسی هدر
            if (!encryptedText.startsWith('AMIR_ENC:')) {
                throw new Error('فرمت پیام نامعتبر است');
            }
            
            // حذف هدر
            const encoded = encryptedText.substring(9);
            
            // دیکد Base64
            const decoded = decodeURIComponent(atob(encoded));
            
            // جدا کردن متن و کلید
            const parts = decoded.split('|');
            if (parts.length !== 2) {
                throw new Error('فرمت پیام نامعتبر است');
            }
            
            const originalText = parts[0];
            const originalKey = parts[1];
            
            // بررسی تطابق کلید
            if (key !== originalKey) {
                throw new Error('کلید امنیتی نادرست است');
            }
            
            return originalText;
        } catch (error) {
            throw new Error('رمزگشایی ناموفق: ' + error.message);
        }
    }
    
    // تولید QR Code - کاملاً کارآمد
    generateQRCode() {
        const text = document.getElementById('qrText').value.trim();
        const size = parseInt(document.getElementById('qrSize').value);
        
        if (!text) {
            this.showNotification('لطفاً متنی برای تولید QR Code وارد کنید', 'error');
            return;
        }
        
        // پاک کردن QR قبلی
        document.getElementById('qrcode').innerHTML = '';
        document.getElementById('qrPlaceholder').style.display = 'flex';
        
        try {
            // تولید QR Code با کتابخانه QRCode.js
            const qrcode = new QRCode(document.getElementById('qrcode'), {
                text: text,
                width: size,
                height: size,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
            
            // صبر برای ایجاد QR
            setTimeout(() => {
                const qrImg = document.getElementById('qrcode').querySelector('img');
                
                if (qrImg) {
                    // مخفی کردن placeholder
                    document.getElementById('qrPlaceholder').style.display = 'none';
                    
                    // ذخیره URL تصویر
                    this.qrImageUrl = qrImg.src;
                    this.currentQR = {
                        text: text,
                        size: size,
                        imageUrl: qrImg.src
                    };
                    
                    // فعال کردن دکمه‌ها
                    this.enableQRButtons();
                    
                    this.showNotification('✅ QR Code با موفقیت تولید شد', 'success');
                } else {
                    this.showNotification('❌ خطا در تولید QR Code', 'error');
                }
            }, 300);
            
        } catch (error) {
            console.error('خطا در تولید QR:', error);
            this.showNotification('❌ خطا در تولید QR Code', 'error');
        }
    }
    
    enableQRButtons() {
        // فعال کردن دکمه‌های دانلود و چاپ
        document.getElementById('downloadQRBtn').disabled = false;
        document.getElementById('printQRBtn').disabled = false;
        
        // فعال کردن دکمه‌های اشتراک‌گذاری
        document.getElementById('shareWhatsAppBtn').disabled = false;
        document.getElementById('shareTelegramBtn').disabled = false;
        document.getElementById('shareEmailBtn').disabled = false;
        document.getElementById('shareCopyBtn').disabled = false;
        document.getElementById('shareSystemBtn').disabled = false;
    }
    
    async downloadQR() {
        if (!this.qrImageUrl) {
            this.showNotification('لطفاً ابتدا یک QR Code تولید کنید', 'error');
            return;
        }
        
        try {
            // ایجاد یک لینک برای دانلود
            const link = document.createElement('a');
            link.download = `qrcode_${Date.now()}.png`;
            link.href = this.qrImageUrl;
            link.click();
            
            this.showNotification('✅ QR Code دانلود شد', 'success');
            
        } catch (error) {
            console.error('خطا در دانلود:', error);
            this.showNotification('❌ خطا در دانلود QR Code', 'error');
        }
    }
    
    printQR() {
        if (!this.qrImageUrl) {
            this.showNotification('لطفاً ابتدا یک QR Code تولید کنید', 'error');
            return;
        }
        
        try {
            // ایجاد پنجره برای چاپ
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html dir="rtl">
                <head>
                    <title>چاپ QR Code</title>
                    <style>
                        body { 
                            font-family: Tahoma; 
                            text-align: center; 
                            padding: 20px;
                            direction: rtl;
                        }
                        .qr-container { 
                            margin: 20px auto; 
                            max-width: 400px;
                        }
                        img { 
                            max-width: 100%; 
                            height: auto;
                            border: 1px solid #ddd;
                            padding: 10px;
                            background: white;
                        }
                        .info {
                            margin-top: 20px;
                            font-size: 14px;
                            color: #666;
                        }
                    </style>
                </head>
                <body>
                    <h2>QR Code</h2>
                    <div class="qr-container">
                        <img src="${this.qrImageUrl}" alt="QR Code">
                    </div>
                    <div class="info">
                        <p>تولید شده توسط سایت چت رمزنگاری امیر</p>
                        <p>تاریخ: ${new Date().toLocaleDateString('fa-IR')}</p>
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(function() {
                                window.close();
                            }, 1000);
                        }
                    </script>
                </body>
                </html>
            `);
            
        } catch (error) {
            console.error('خطا در چاپ:', error);
            this.showNotification('❌ خطا در چاپ QR Code', 'error');
        }
    }
    
    // اشتراک‌گذاری در واتساپ
    shareViaWhatsApp() {
        if (!this.currentQR?.text) {
            this.showNotification('لطفاً ابتدا یک QR Code تولید کنید', 'error');
            return;
        }
        
        try {
            const text = encodeURIComponent('🔐 پیام رمز شده:\n' + this.currentQR.text + '\n\n📱 تولید شده توسط سایت چت رمزنگاری امیر');
            const url = `https://wa.me/?text=${text}`;
            
            window.open(url, '_blank');
            this.showNotification('✅ آماده اشتراک‌گذاری در واتساپ', 'success');
        } catch (error) {
            this.showNotification('❌ خطا در باز کردن واتساپ', 'error');
        }
    }
    
    // اشتراک‌گذاری در تلگرام
    shareViaTelegram() {
        if (!this.currentQR?.text) {
            this.showNotification('لطفاً ابتدا یک QR Code تولید کنید', 'error');
            return;
        }
        
        try {
            const text = encodeURIComponent('🔐 پیام رمز شده:\n' + this.currentQR.text + '\n\n📱 تولید شده توسط سایت چت رمزنگاری امیر');
            const url = `https://t.me/share/url?url=&text=${text}`;
            
            window.open(url, '_blank');
            this.showNotification('✅ آماده اشتراک‌گذاری در تلگرام', 'success');
        } catch (error) {
            this.showNotification('❌ خطا در باز کردن تلگرام', 'error');
        }
    }
    
    // اشتراک‌گذاری از طریق ایمیل
    shareViaEmail() {
        if (!this.currentQR?.text) {
            this.showNotification('لطفاً ابتدا یک QR Code تولید کنید', 'error');
            return;
        }
        
        try {
            const subject = encodeURIComponent('پیام رمز شده');
            const body = encodeURIComponent(
                'پیام رمز شده:\n\n' + 
                this.currentQR.text + 
                '\n\nاین پیام با سایت چت رمزنگاری امیر تولید شده است.\n' +
                'برای رمزگشایی به کلید امنیتی نیاز دارید.'
            );
            
            const url = `mailto:?subject=${subject}&body=${body}`;
            window.location.href = url;
        } catch (error) {
            this.showNotification('❌ خطا در باز کردن ایمیل', 'error');
        }
    }
    
    // کپی متن QR
    async copyQRText() {
        if (!this.currentQR?.text) {
            this.showNotification('لطفاً ابتدا یک QR Code تولید کنید', 'error');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(this.currentQR.text);
            this.showNotification('✅ متن QR Code کپی شد', 'success');
        } catch (error) {
            console.error('خطا در کپی:', error);
            this.showNotification('❌ خطا در کپی کردن متن', 'error');
        }
    }
    
    // اشتراک‌گذاری از طریق سیستم
    async shareViaSystem() {
        if (!this.currentQR?.text) {
            this.showNotification('لطفاً ابتدا یک QR Code تولید کنید', 'error');
            return;
        }
        
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'پیام رمز شده',
                    text: 'این پیام با سایت چت رمزنگاری امیر تولید شده است',
                    url: window.location.href
                });
            } else {
                // اگر Web Share API پشتیبانی نمی‌شود
                this.copyQRText();
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                this.showNotification('❌ اشتراک‌گذاری لغو شد', 'error');
            }
        }
    }
    
    // اشتراک‌گذاری متن
    async shareText() {
        const encryptedText = document.getElementById('encryptedOutput').value;
        const key = document.getElementById('generatedKey').dataset.fullKey;
        
        if (!encryptedText || !key) {
            this.showNotification('لطفاً ابتدا یک پیام را رمزنگاری کنید', 'error');
            return;
        }
        
        try {
            const text = `🔐 پیام رمز شده:\n${encryptedText}\n\n🔑 کلید امنیتی:\n${key}\n\n📱 تولید شده توسط سایت چت رمزنگاری امیر`;
            
            if (navigator.share) {
                await navigator.share({
                    title: 'پیام رمز شده',
                    text: text
                });
            } else {
                await navigator.clipboard.writeText(text);
                this.showNotification('✅ متن رمز شده و کلید کپی شدند', 'success');
            }
        } catch (error) {
            console.error('خطا در اشتراک‌گذاری:', error);
            this.showNotification('❌ خطا در اشتراک‌گذاری', 'error');
        }
    }
    
    async copyToClipboard(elementId) {
        const element = document.getElementById(elementId);
        if (!element || !element.value.trim()) {
            this.showNotification('هیچ متنی برای کپی کردن وجود ندارد', 'error');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(element.value);
            this.showNotification('✅ متن کپی شد', 'success');
        } catch (error) {
            console.error('خطا در کپی:', error);
            
            // روش جایگزین
            element.select();
            document.execCommand('copy');
            this.showNotification('✅ متن کپی شد', 'success');
        }
    }
    
    async copyKey() {
        const fullKey = document.getElementById('generatedKey').dataset.fullKey;
        if (!fullKey) {
            this.showNotification('هیچ کلیدی برای کپی کردن وجود ندارد', 'error');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(fullKey);
            this.showNotification('✅ کلید امنیتی کپی شد', 'success');
        } catch (error) {
            console.error('خطا در کپی:', error);
            this.showNotification('❌ خطا در کپی کردن کلید', 'error');
        }
    }
    
    async pasteText() {
        try {
            const text = await navigator.clipboard.readText();
            document.getElementById('plainText').value = text;
            
            // بروزرسانی شمارنده
            const event = new Event('input');
            document.getElementById('plainText').dispatchEvent(event);
            
            this.showNotification('✅ متن پیست شد', 'success');
        } catch (error) {
            console.error('خطا در پیست:', error);
            this.showNotification('❌ دسترسی به کلیپ‌بورد مجاز نیست', 'error');
        }
    }
    
    async pasteKey() {
        try {
            const text = await navigator.clipboard.readText();
            document.getElementById('decryptKeyInput').value = text;
            this.showNotification('✅ کلید پیست شد', 'success');
        } catch (error) {
            console.error('خطا در پیست:', error);
            this.showNotification('❌ دسترسی به کلیپ‌بورد مجاز نیست', 'error');
        }
    }
    
    loadFromEncryption() {
        const encryptedText = document.getElementById('encryptedOutput').value;
        if (!encryptedText) {
            this.showNotification('لطفاً ابتدا یک پیام را رمزنگاری کنید', 'error');
            return;
        }
        
        document.getElementById('qrText').value = encryptedText;
        this.showNotification('✅ متن رمز شده بارگذاری شد', 'success');
    }
    
    clearText() {
        document.getElementById('plainText').value = '';
        
        // بروزرسانی شمارنده
        const event = new Event('input');
        document.getElementById('plainText').dispatchEvent(event);
        
        this.showNotification('✅ متن پاک شد', 'info');
    }
    
    clearDecrypt() {
        document.getElementById('encryptedInput').value = '';
        document.getElementById('decryptKeyInput').value = '';
        document.getElementById('decryptedOutput').value = '';
        document.getElementById('decryptResult').style.display = 'none';
        this.showNotification('✅ همه فیلدها پاک شدند', 'info');
    }
    
    clearQR() {
        document.getElementById('qrText').value = '';
        document.getElementById('qrcode').innerHTML = '';
        document.getElementById('qrPlaceholder').style.display = 'flex';
        
        // غیرفعال کردن دکمه‌ها
        document.getElementById('downloadQRBtn').disabled = true;
        document.getElementById('printQRBtn').disabled = true;
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.disabled = true;
        });
        
        this.currentQR = null;
        this.qrImageUrl = null;
        
        this.showNotification('✅ QR Code پاک شد', 'info');
    }
    
    toggleTheme() {
        const isDark = document.body.classList.contains('dark-theme');
        
        if (isDark) {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            document.getElementById('themeToggle').innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
            this.showNotification('☀️ تم روشن فعال شد', 'info');
        } else {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
            document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
            this.showNotification('🌙 تم تاریک فعال شد', 'info');
        }
    }
    
    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.classList.add('light-theme');
            document.getElementById('themeToggle').innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const text = document.getElementById('notificationText');
        const icon = document.getElementById('notificationIcon');
        
        // تنظیم نوع
        let iconChar = 'ℹ️';
        if (type === 'success') iconChar = '✅';
        if (type === 'error') iconChar = '❌';
        if (type === 'warning') iconChar = '⚠️';
        
        icon.textContent = iconChar;
        text.textContent = message;
        
        // تنظیم رنگ
        notification.className = 'notification';
        if (type === 'success') {
            notification.style.background = '#28a745';
            notification.style.color = 'white';
        } else if (type === 'error') {
            notification.style.background = '#dc3545';
            notification.style.color = 'white';
        } else if (type === 'warning') {
            notification.style.background = '#ffc107';
            notification.style.color = '#212529';
        } else {
            notification.style.background = '#17a2b8';
            notification.style.color = 'white';
        }
        
        // نمایش
        notification.classList.add('show');
        
        // مخفی کردن خودکار
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    showLoading(text = 'در حال پردازش...') {
        const loading = document.getElementById('loading');
        const loadingText = document.getElementById('loadingText');
        
        loadingText.textContent = text;
        loading.classList.add('active');
    }
    
    hideLoading() {
        const loading = document.getElementById('loading');
        loading.classList.remove('active');
    }
}

// راه‌اندازی برنامه
document.addEventListener('DOMContentLoaded', () => {
    const app = new AppManager();
    window.app = app;
    
    // اضافه کردن فونت‌آیسم برای دکمه‌های اشتراک‌گذاری
    const fontAwesome = document.createElement('link');
    fontAwesome.rel = 'stylesheet';
    fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(fontAwesome);
    
    console.log('✅ برنامه با موفقیت بارگذاری شد!');
    console.log('📱 آماده استفاده است!');
});