# 🚀 MinIO Setup Guide for Local File Upload Testing

## ⚠️ Docker Not Installed

Docker is not currently installed on your system. You have **two options**:

---

## 🎯 **OPTION A: Use Cloudflare R2 (RECOMMENDED)**

### ✅ **Why R2?**
- ✅ **Free tier**: 10GB storage, unlimited requests
- ✅ **No Docker needed**: Works immediately
- ✅ **Production-ready**: Same setup for dev and prod
- ✅ **Fast**: Global CDN
- ✅ **No egress fees**: Unlike AWS S3

### 📝 **Setup Steps (5 minutes):**

1. **Go to Cloudflare Dashboard**:
   - Visit: https://dash.cloudflare.com/
   - Sign up/login (free account)

2. **Navigate to R2**:
   - Click "R2" in the left sidebar
   - Click "Purchase R2" (it's free, just activates the service)

3. **Create Bucket**:
   - Click "Create bucket"
   - Name: `bia-documents`
   - Location: Automatic
   - Click "Create bucket"

4. **Create API Token**:
   - Click "Manage R2 API Tokens"
   - Click "Create API Token"
   - Token name: `BIA Platform`
   - Permissions: "Object Read & Write"
   - Click "Create API Token"
   - **⚠️ IMPORTANT**: Copy the credentials NOW (you won't see them again!)

5. **Update `backend/.env`**:
   ```bash
   # Replace the placeholder values with your R2 credentials
   S3_ENDPOINT=https://YOUR-ACCOUNT-ID.r2.cloudflarestorage.com
   S3_REGION=auto
   S3_ACCESS_KEY_ID=YOUR-R2-ACCESS-KEY-ID
   S3_SECRET_ACCESS_KEY=YOUR-R2-SECRET-ACCESS-KEY
   S3_BUCKET_NAME=bia-documents
   S3_PUBLIC_URL=https://YOUR-ACCOUNT-ID.r2.cloudflarestorage.com/bia-documents
   ```

   See `backend/.env.example-r2` for a template.

6. **Restart Backend**:
   ```bash
   # Stop current backend (Ctrl+C in the terminal)
   # Then restart:
   cd backend
   npm run dev
   ```

7. **Test It**:
   ```bash
   ./test_file_upload.sh
   ```

✅ **Done! You now have production-ready cloud storage!**

---

## 🎯 **OPTION B: Install Docker + MinIO (Local Only)**

### 📦 **Install Docker Desktop:**

**Method 1: Download Installer**
1. Go to: https://www.docker.com/products/docker-desktop
2. Download Docker Desktop for Mac
3. Install and open Docker Desktop
4. Wait for Docker to start (whale icon in menu bar)

**Method 2: Homebrew (Recommended)**
```bash
brew install --cask docker
```
Then open Docker Desktop from Applications.

### 🚀 **Start MinIO:**

Once Docker is running:

```bash
# Run the automated setup script
./setup_minio.sh
```

This will:
1. ✅ Check if Docker is running
2. ✅ Start MinIO container
3. ✅ Show you the console URL

### 🔧 **Configure MinIO:**

1. **Open MinIO Console**: http://localhost:9001
2. **Login**:
   - Username: `minioadmin`
   - Password: `minioadmin123`
3. **Create Bucket**:
   - Click "Buckets" → "Create Bucket"
   - Name: `bia-documents`
   - Click "Create Bucket"
4. **Set Bucket to Public** (for development):
   - Click on `bia-documents`
   - Go to "Access" tab
   - Set policy to "Public"

### 📝 **Update .env:**

```bash
# Run the automated configuration script
./setup_minio_env.sh
```

Or manually add to `backend/.env`:
```bash
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin123
S3_BUCKET_NAME=bia-documents
S3_PUBLIC_URL=http://localhost:9000/bia-documents
```

### 🔄 **Restart Backend:**
```bash
cd backend
npm run dev
```

### 🧪 **Test It:**
```bash
./test_file_upload.sh
```

---

## 📊 **Comparison**

| Feature | Cloudflare R2 | MinIO |
|---------|---------------|-------|
| **Setup Time** | 5 minutes | 10-15 minutes |
| **Cost** | Free (10GB) | Free (uses disk) |
| **Docker Required** | ❌ No | ✅ Yes |
| **Production Ready** | ✅ Yes | ❌ No (dev only) |
| **Speed** | Fast (CDN) | Fast (local) |
| **Recommended** | ✅ **YES** | For testing only |

---

## 🎯 **My Recommendation**

**Use Cloudflare R2** because:
1. ✅ No Docker installation needed
2. ✅ Same setup for development and production
3. ✅ Free tier is generous
4. ✅ Faster to set up
5. ✅ Production-ready from day 1

---

## 🆘 **Need Help?**

### Cloudflare R2 Issues:
- **Can't find R2**: Make sure you've activated R2 in your Cloudflare account
- **Credentials not working**: Double-check you copied the full access key and secret
- **Bucket not found**: Verify bucket name is exactly `bia-documents`

### MinIO Issues:
- **Docker not starting**: Make sure Docker Desktop is open and running
- **Port already in use**: Stop other services on ports 9000/9001
- **Can't access console**: Check if MinIO container is running: `docker ps`

### General Issues:
- **File upload fails**: Check backend logs for detailed error
- **"S3 is not configured"**: Verify .env has all S3_* variables
- **Backend won't start**: Restart backend after updating .env

---

## 📚 **Next Steps**

After setup:
1. ✅ Test file upload: `./test_file_upload.sh`
2. ✅ Test from frontend: Go to Data Room page
3. ✅ Upload a document
4. ✅ Verify it appears in R2/MinIO

---

## 💡 **Pro Tips**

- **Development**: Use R2 (same as production)
- **Testing**: R2 free tier is more than enough
- **Production**: Use R2 with custom domain
- **Backup**: R2 has built-in versioning

---

**Ready to test file uploads? Choose your option above!**
