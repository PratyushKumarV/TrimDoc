# TrimDoc  

A PDF manipulation Chrome extension that simplifies compressing and splitting PDFs.

---

## ✨ Features  
- **Compress PDFs** directly in your browser.  
- **Split PDFs** into multiple files without leaving Chrome.  

---

## 🛠️ Tech Stack  

- **Frontend:** VanillaJS  
- **Backend:** Node.js + Express  

---

## 📦 Prerequisites  

- [Node.js](https://nodejs.org/) **v22+** (npm included) installed locally.  
  > npm ships with Node.js, so installing Node.js gives you npm automatically.

---

## 🚀 Installation  

Clone the repository:

```bash
git clone https://github.com/PratyushKumarV/TrimDoc.git
```

🧩 Load the Extension in Chrome (Developer Mode)

- Open Google Chrome and navigate to chrome://extensions.
- Enable Developer Mode (toggle in the top-right corner).
- Click Load Unpacked.
- Select the project folder you just cloned (the root of the repository).
- The extension should now appear in your extensions dashboard — enable it to start using TrimDoc.
  
## 📝 External API

This extension uses the [ILovePDF API](https://developer.ilovepdf.com/docs) for PDF manipulation (compressing and splitting PDFs).  
You’ll need to sign up for an API key to use the backend locally. See their documentation for more details.
> Note: The backend already has an API key configured. You don’t need to set up your own to use the hosted version.


