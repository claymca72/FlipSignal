# Listings Image Upload — Setup Checklist

## 1. Create the R2 Bucket

1. Log in to the Cloudflare dashboard → **R2 Object Storage** → **Create bucket**.
2. Name it (e.g. `flipsignal-listings`). Choose a region close to your primary user base.
3. Under **Settings → Public access**, enable **Public bucket** (or use a custom domain).
4. Add a **CORS policy** so the browser can PUT directly to R2 (see section 4 below).

## 2. Set Public Read on the `listings/` Prefix

In the bucket **Policies** tab add a bucket policy that allows public `GetObject` on `listings/*`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::flipsignal-listings/listings/*"
    }
  ]
}
```

> Note: Cloudflare R2 uses the S3 policy syntax even though it is not AWS. Adjust the bucket name to match yours.

## 3. Create an API Token with Object PUT Scope

1. In Cloudflare dashboard → **R2** → **Manage R2 API Tokens** → **Create API Token**.
2. Permissions: **Object Read & Write** (or narrow to `PutObject` only if your token UI supports it).
3. Scope it to the specific bucket created in step 1.
4. Copy the **Access Key ID** and **Secret Access Key** — these are shown only once.

## 4. CORS Configuration

Apply this CORS rule on the bucket so browsers can issue signed PUT requests:

```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["Content-Type", "Content-Length"],
    "MaxAgeSeconds": 3600
  }
]
```

For local development add `"http://localhost:3000"` to `AllowedOrigins`.

## 5. Environment Variables

Paste the following into your `.env` file (do **not** commit it):

```
R2_ACCOUNT_ID=<your-cloudflare-account-id>
R2_ACCESS_KEY_ID=<access-key-id-from-step-3>
R2_SECRET_ACCESS_KEY=<secret-access-key-from-step-3>
R2_BUCKET=<bucket-name-from-step-1>
R2_PUBLIC_BASE_URL=https://pub-<hash>.r2.dev
```

`R2_PUBLIC_BASE_URL` is the public hostname for the bucket. Find it in the bucket **Settings** tab under **Public access** / **S3 API**. If you use a custom domain, set it here instead (e.g. `https://images.yourdomain.com`).

## 6. Smoke-Test Command

With the env vars set, verify a signed PUT round-trip from your terminal:

```bash
# 1. Get a signed URL
curl -s -X POST http://localhost:3000/api/listings/upload \
  -H "Content-Type: application/json" \
  -H "Cookie: <copy your session cookie from browser devtools>" \
  -d '{"filename":"test.jpg","contentType":"image/jpeg","contentLength":12345}' \
  | jq .

# 2. Use the uploadUrl from the response to PUT a real file
curl -X PUT "<uploadUrl from above>" \
  -H "Content-Type: image/jpeg" \
  --data-binary @/path/to/test.jpg \
  -w "%{http_code}"
# Expected: 200

# 3. Confirm the public URL is accessible
curl -I "<publicUrl from the first response>"
# Expected: HTTP/2 200
```

## 7. Production Checklist

- [ ] Bucket created and public read enabled for `listings/` prefix
- [ ] API token scoped to bucket with PutObject permission
- [ ] CORS rule allows your production origin with PUT + Content-Type headers
- [ ] All five `R2_*` env vars set in your hosting provider (Vercel / Railway / etc.)
- [ ] Smoke-test passed in staging before go-live
- [ ] Decide on retention policy: keep originals indefinitely or evict 30 days post-listing (open question from spec)
