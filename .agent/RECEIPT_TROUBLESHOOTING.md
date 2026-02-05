# 🔧 Receipt Scanner - Troubleshooting Guide

## Common Issues & Solutions

### 🚨 Upload Issues

#### Issue: "Failed to upload receipt"
**Possible Causes:**
- Cloudinary credentials not set
- Internet connection issues
- File too large (>10MB)
- Wrong file type

**Solutions:**
1. Check `.env` file in server directory:
   ```env
   CLOUDINARY_CLOUD_NAME=xxx
   CLOUDINARY_API_KEY=xxx
   CLOUDINARY_API_SECRET=xxx
   ```
2. Verify internet connection
3. Reduce image size (recommended: 1-3MB)
4. Ensure file is an image (JPEG, PNG, GIF, WebP, HEIC)

#### Issue: "No file uploaded" error
**Solutions:**
- Ensure you're selecting an image file
- Check file input name matches 'receipt'
- Verify FormData is properly constructed

---

### 🔍 OCR Processing Issues

#### Issue: "OCR processing failed"
**Possible Causes:**
- Image quality too poor
- Receipt text too small
- Image skewed or rotated
- Insufficient lighting in photo

**Solutions:**
1. **Retake Photo** with better lighting
2. **Ensure Receipt is Flat** and straight
3. **Use Higher Resolution** (at least 1MP)
4. **Avoid Shadows** and glare
5. **Capture Full Receipt** - don't crop too close

#### Issue: Amount not detected correctly
**Solutions:**
- Look for "Total" or "Amount" on receipt
- Ensure numbers are clear and legible
- Manually edit the extracted amount
- Take a clearer photo focusing on the total

#### Issue: Date not extracted
**Solutions:**
- Date might be in unsupported format
- Manually select the correct date
- Date will default to today if not found

#### Issue: Merchant name incorrect
**Solutions:**
- Merchant name is taken from top lines
- Edit the merchant name manually
- This field is most prone to errors

---

### 🔗 Transaction Creation Issues

#### Issue: "Account not found"
**Solutions:**
- Create an account first at `/add-account`
- Select an existing account from dropdown
- Refresh the page to reload accounts

#### Issue: "Failed to create transaction"
**Solutions:**
- Verify account balance is sufficient
- Check extracted amount is valid (>0)
- Ensure date is in valid format
- Check server console for detailed error

---

### 🎨 UI/Display Issues

#### Issue: Page not loading (/scan-receipt 404)
**Solutions:**
- Verify route is added in App.js
- Clear browser cache and reload
- Check React Router configuration
- Restart development server

#### Issue: Upload button not working
**Solutions:**
- Check browser console for errors
- Verify react-dropzone is installed
- Test with different browser
- Check file input permissions

#### Issue: Image preview not showing
**Solutions:**
- Check if FileReader is supported
- Verify image URL is valid
- Check browser DevTools network tab
- Clear browser cache

---

### 🗄️ Database Issues

#### Issue: Receipts not saving to database
**Solutions:**
- Check MongoDB connection
- Verify Receipt model is imported
- Check server console for errors
- Ensure user is authenticated

#### Issue: Cannot retrieve receipts
**Solutions:**
- Verify JWT token is valid
- Check authentication middleware
- Review server logs for errors
- Test API endpoint directly with Postman

---

### ☁️ Cloudinary Issues

#### Issue: "Cloudinary upload error"
**Solutions:**
1. **Verify Credentials**:
   ```bash
   # Test credentials
   curl -X POST "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload"
   ```
2. **Check Account Status**: Ensure Cloudinary account is active
3. **Verify Folder Name**: Check CLOUDINARY_FOLDER setting
4. **Check Quota**: Free tier has 25GB limit

#### Issue: Images not displaying from Cloudinary
**Solutions:**
- Check image URL is HTTPS
- Verify URL is publicly accessible
- Check CORS settings in Cloudinary
- Test URL in browser directly

---

### 🔐 Authentication Issues

#### Issue: "Unauthorized" error
**Solutions:**
- Ensure user is logged in
- Check JWT token in localStorage
- Verify auth middleware is applied to routes
- Token might be expired - login again

#### Issue: Cannot access other users' receipts
**Expected Behavior**: This is correct! Users should only see their own receipts.

---

### ⚡ Performance Issues

#### Issue: OCR takes too long (>10 seconds)
**Solutions:**
- Image might be too large - compress it
- Server might be under load
- Check internet connection speed
- Consider using smaller images (1-2MB)

#### Issue: Gallery loading slowly
**Solutions:**
- Implement pagination (already built-in)
- Reduce number of receipts per page
- Optimize image thumbnails
- Add lazy loading for images

---

### 📱 Mobile Issues

#### Issue: Camera not working
**Solutions:**
- Grant camera permissions in browser
- Use HTTPS (camera requires secure context)
- Check if device has camera
- Try different browser (Chrome recommended)

#### Issue: Drag & drop not working on mobile
**Expected Behavior**: Use file picker button on mobile instead

---

### 🔄 API Issues

#### Issue: CORS errors
**Solutions:**
1. Add CORS configuration in server:
   ```javascript
   app.use(cors({
     origin: 'http://localhost:3000'
   }));
   ```
2. Check CLIENT_URL in .env
3. Verify API requests use correct base URL

#### Issue: 500 Internal Server Error
**Solutions:**
- Check server console for stack trace
- Verify all required environment variables are set
- Check MongoDB connection
- Verify Cloudinary credentials
- Review recent code changes

---

## 🧪 Testing Checklist

If you're experiencing issues, test these:

- [ ] Can you access `/scan-receipt` page?
- [ ] Does drag & drop zone appear?
- [ ] Can you select a file?
- [ ] Does upload progress show?
- [ ] Is OCR processing triggered?
- [ ] Are extracted details displayed?
- [ ] Can you create a transaction?
- [ ] Can you view receipts in gallery?
- [ ] Can you delete a receipt?

---

## 📋 Debug Information to Collect

When reporting issues, include:

1. **Browser Console Errors** (F12 → Console tab)
2. **Network Tab Errors** (F12 → Network tab)
3. **Server Console Logs** (terminal running server)
4. **Environment Variables** (sanitized - don't share secrets!)
5. **Image Details**: Size, format, quality
6. **Operating System & Browser**

---

## 🔍 Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `ECONNREFUSED` | Can't connect to MongoDB | Start MongoDB |
| `Invalid token` | JWT expired | Login again |
| `File too large` | Image >10MB | Compress image |
| `Invalid file type` | Not an image | Use JPEG/PNG |
| `Cloudinary error` | Upload failed | Check credentials |
| `OCR processing error` | Tesseract failed | Try clearer image |

---

## 💡 Pro Tips

### For Better OCR Accuracy:
1. ✅ Take photo in daylight
2. ✅ Hold phone directly above receipt
3. ✅ Ensure receipt is flat
4. ✅ Avoid shadows and reflections
5. ✅ Use rear camera (better quality)
6. ✅ Keep steady to avoid blur

### For Faster Processing:
1. ✅ Use compressed JPEGs (not raw images)
2. ✅ Resize to 1500px max width
3. ✅ Good internet connection
4. ✅ Close other tabs

### For Better Results:
1. ✅ Printed receipts work better than handwritten
2. ✅ Clear, high-contrast text
3. ✅ Horizontal orientation (not tilted)
4. ✅ Recent receipts (not faded)

---

## 🆘 Still Having Issues?

If none of the above solutions work:

1. **Check Server Logs**:
   ```bash
   # Look for error stack traces
   cd server
   npm start
   # Watch for errors
   ```

2. **Check Browser Console**:
   - Right-click → Inspect → Console
   - Look for red error messages

3. **Test API Directly**:
   ```bash
   # Test upload endpoint
   curl -X POST http://localhost:5000/receipts/upload \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "receipt=@path/to/image.jpg"
   ```

4. **Verify Dependencies**:
   ```bash
   # Backend
   cd server
   npm list multer cloudinary tesseract.js sharp
   
   # Frontend
   cd client
   npm list tesseract.js react-dropzone
   ```

5. **Restart Everything**:
   ```bash
   # Stop all servers
   # Clear node_modules and reinstall
   cd server
   rm -rf node_modules
   npm install
   
   cd ../client
   rm -rf node_modules
   npm install
   ```

---

## 📞 Additional Resources

- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Tesseract.js Docs**: https://tesseract.projectnaptha.com/
- **React Dropzone**: https://react-dropzone.js.org/
- **Multer Docs**: https://github.com/expressjs/multer

---

## ✅ Quick Health Check

Run this checklist to verify everything is working:

```bash
# 1. Check MongoDB
mongo --eval "db.version()"

# 2. Check Server Environment
cd server
cat .env | grep CLOUDINARY

# 3. Check Server Running
curl http://localhost:5000/

# 4. Check Client Running
curl http://localhost:3000/

# 5. Check Dependencies
npm list | grep cloudinary
npm list | grep tesseract
```

---

**Last Updated**: February 4, 2026  
**Troubleshooting Version**: 1.0

If you continue experiencing issues after trying these solutions, please check the server logs and browser console for specific error messages.
