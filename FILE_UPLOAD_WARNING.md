# ⚠️ File Upload Warning - Production Deployment

## Current Issue

Your application currently stores uploaded files locally in `server/uploads/`. This will **NOT work** on Render because:

1. **Ephemeral Storage:** Render uses ephemeral containers that reset on every deploy
2. **Data Loss:** Any uploaded files will be lost when the service restarts or deploys
3. **No Persistence:** Local filesystem is not shared between instances

## Affected Routes

The following routes currently use local file storage and need updates:

### 1. Product Import (`server/src/routes/products-import.router.ts`)
- **Function:** Bulk product import via CSV
- **Impact:** HIGH - Core vendor feature

### 2. AI Receipt Parser (`server/src/routes/ai-receipt-parser.router.ts`)
- **Function:** Parse receipts with AI
- **Impact:** MEDIUM - Nice-to-have feature

### 3. Settings Documents (`server/src/routes/settings/documents.ts`)
- **Function:** Store legal documents, compliance files
- **Impact:** HIGH - May be required

### 4. Social Publishing (`server/src/routes/social-publishing.router.ts`)
- **Function:** Upload images for social media posts
- **Impact:** MEDIUM - Promotions feature

### 5. Inventory Receipt Parser (`server/src/routes/inventory-receipt-parser.router.ts`)
- **Function:** Parse inventory receipts
- **Impact:** MEDIUM - Inventory management

## Solutions

### Option A: Cloudinary (Recommended) ⭐

**Pros:**
- Already in dependencies
- Free tier: 25GB storage, 25GB bandwidth/month
- Easy integration
- Image transformations included
- CDN delivery

**Setup:**
```bash
# 1. Sign up: https://cloudinary.com/
# 2. Get credentials from dashboard
# 3. Add to Render environment:
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Code Example:**
```typescript
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'craved-artisan',
    allowed_formats: ['jpg', 'png', 'pdf', 'csv'],
  },
});

const upload = multer({ storage });
```

### Option B: AWS S3

**Pros:**
- Highly scalable
- More control
- Industry standard

**Cons:**
- More complex setup
- Need AWS account
- Pricing can be confusing

**Setup:**
```bash
# 1. Create AWS account
# 2. Create S3 bucket
# 3. Create IAM user with S3 access
# 4. Add to Render environment:
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=craved-artisan-uploads
```

### Option C: DigitalOcean Spaces

**Pros:**
- S3-compatible
- Simpler pricing ($5/mo flat)
- Easy to use

**Cons:**
- Requires paid account

### Option D: Disable File Uploads (Quick Fix)

**For immediate deployment without file features:**

```typescript
// In server/src/index.ts
// Comment out these routes temporarily:

// app.use('/api/products', productsImportRouter);
// app.use('/api/ai', aiReceiptParserRouter);
// app.use('/api/settings/documents', documentsRouter);
// app.use('/api/social-publishing', socialPublishingRouter);
// app.use('/api/inventory', inventoryReceiptParserRouter);
```

**Impact:**
- ❌ Can't bulk import products
- ❌ Can't upload documents
- ❌ Can't parse receipts with AI
- ❌ Can't upload social media images
- ✅ Core functionality still works
- ✅ Can deploy immediately
- ✅ Can add back later

## Recommendation

**For production launch:**
1. **Week 1:** Deploy with uploads disabled (Option D)
2. **Week 2:** Setup Cloudinary and enable uploads (Option A)
3. **Test thoroughly** before announcing file upload features

**For testing/development:**
- Use Option D (disabled) initially
- Add Cloudinary when ready for real users

## Migration Steps (When Ready)

### If Using Cloudinary:

1. **Install package:**
   ```bash
   npm install cloudinary multer-storage-cloudinary
   ```

2. **Update multer config:**
   ```typescript
   // server/src/middleware/upload.ts (create new file)
   import multer from 'multer';
   import { v2 as cloudinary } from 'cloudinary';
   import { CloudinaryStorage } from 'multer-storage-cloudinary';

   cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET,
   });

   const storage = new CloudinaryStorage({
     cloudinary,
     params: async (req, file) => ({
       folder: 'craved-artisan',
       allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'csv'],
       public_id: `${Date.now()}-${file.originalname}`,
     }),
   });

   export const upload = multer({ 
     storage,
     limits: { fileSize: 10 * 1024 * 1024 } // 10MB
   });
   ```

3. **Update routes to use new middleware:**
   ```typescript
   import { upload } from '../middleware/upload';
   
   router.post('/import', upload.single('file'), async (req, res) => {
     // req.file.path now contains Cloudinary URL
     const fileUrl = req.file.path;
     // ... rest of logic
   });
   ```

4. **Update environment variables in Render**

5. **Test thoroughly**

## Cost Comparison

| Service | Free Tier | Paid Plans | Best For |
|---------|-----------|------------|----------|
| **Cloudinary** | 25GB storage, 25GB bandwidth | $89/mo for 100GB | Images, general files |
| **AWS S3** | 5GB for 12 months | ~$0.023/GB/month | Large scale, enterprise |
| **DigitalOcean Spaces** | None | $5/mo (250GB) | Simple pricing |
| **Render Disk** | ❌ Not persistent | ❌ Not available | Not suitable |

## Estimated Monthly Costs

**Low usage (< 100 uploads/month):**
- Cloudinary Free: $0/mo ✅

**Medium usage (500-1000 uploads/month):**
- Cloudinary Free: $0/mo (if under 25GB)
- S3: $5-15/mo

**High usage (5000+ uploads/month):**
- Cloudinary: $89/mo
- S3: $20-50/mo

## Testing Checklist

Once file uploads configured:

- [ ] Upload product CSV import
- [ ] Upload product images
- [ ] Upload receipt for AI parsing
- [ ] Upload legal documents
- [ ] Upload social media images
- [ ] Verify files persist after deploy
- [ ] Test file download/access
- [ ] Check file URLs work
- [ ] Monitor storage usage
- [ ] Test error handling (file too large, wrong type)

## Questions?

**Q: Can I start without file uploads?**
A: Yes! Disable the routes and deploy. Add later.

**Q: Will I lose existing uploaded files?**
A: Yes, any files in `server/uploads/` will be lost on first deploy.

**Q: How do I migrate from local to Cloudinary?**
A: Upload existing files to Cloudinary, update database URLs.

**Q: What if I exceed free tier?**
A: Cloudinary will notify you. You can upgrade or optimize usage.

**Q: Can I use multiple storage providers?**
A: Yes, but adds complexity. Pick one for consistency.

---

**Status:** 🔴 Action Required Before Production
**Priority:** High for full feature set, Medium for basic MVP
**Effort:** 2-4 hours for Cloudinary integration

