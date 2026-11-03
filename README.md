# Manas College Pithoragarh – Smart Library Management System

## GitHub Pages testing build

This project is a browser-based testing/demo application. It runs on GitHub Pages without Node.js.

### Deploy
1. Extract the ZIP.
2. Upload `index.html`, `Code.gs`, and `README.md` to the root of your GitHub repository.
3. Open **Settings → Pages**.
4. Select **Deploy from a branch**, branch `main`, folder `/(root)`, then Save.
5. Open the published GitHub Pages URL and hard refresh with `Ctrl + Shift + R`.

### First login
On the first visit, create your own password. There are no demo login credentials shown. Your password is saved as a SHA-256 hash in this browser's local storage. Use **Change Password** from the top bar while logged in. **Log out** ends the current browser session.

### Data backup
- **Export Data** downloads a JSON backup containing books, students and issue/return transactions.
- **Import Data** restores a compatible JSON backup and replaces the current browser data after confirmation.
- Existing CSV export options remain available in reports/history.

### Requested UI updates
- Light navy/white/soft-blue theme.
- Add New Book opens in a centered modal in front of the page.
- Student form omits phone/mobile number and address.
- Student and book semester options are limited to Semester 1–6.
- Book form includes Accession Number and uses the label Publisher / Place.
- Footer branding: “Manas College Pithoragarh · Powered by Manshi Joshi”.

### Important limitations
GitHub Pages only serves static files. This version stores data in the browser's `localStorage`; it does not provide a secure server-side login, multi-user access, or MySQL database. The password gate is for testing only. Browser data can be lost if site data is cleared, so export backups regularly. For a production college system, connect a backend/database and implement server-side authentication and authorization.

`Code.gs` is an optional Google Apps Script integration file. Follow the code comments and Apps Script deployment instructions before configuring cloud sync.
