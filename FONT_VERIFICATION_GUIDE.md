# Font Verification & Troubleshooting Guide

## Step 1: Restart Dev Server

**IMPORTANT:** You must restart your dev server for changes to take effect!

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd frontend
npm run dev
```

## Step 2: Verify in Browser

### Method 1: Check Browser Console
1. Open http://localhost:3000
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. Look for any errors related to fonts
5. If you see 404 errors for font files, that's the issue

### Method 2: Check Network Tab
1. Open http://localhost:3000
2. Press `F12` to open Developer Tools
3. Go to **Network** tab
4. Refresh page (`Ctrl+Shift+R`)
5. Filter by "Font" or search for "Teko" or "Khand"
6. You should see font files loading with status 200 (green)

### Method 3: Inspect Element
1. Right-click on any heading text (like "TrustPay")
2. Click "Inspect"
3. Look at the **Computed** tab
4. Find "font-family"
5. It should show: `Teko, sans-serif` or `Khand, sans-serif`

### Method 4: Visual Check
**Teko characteristics:**
- Very condensed/narrow letters
- Tall and slim
- Modern, bold look

**Khand characteristics:**
- Wider, more readable
- Clean, professional
- Slightly rounded

## Step 3: Common Issues & Fixes

### Issue 1: Fonts not loading (404 errors)

**Check font file paths:**
```bash
# Run this in your terminal
ls frontend/public/fonts/
```

You should see:
- Khand-Bold.otf
- Khand-Light.otf
- Khand-Medium.otf
- Khand-Regular.otf
- Khand-SemiBold.otf
- Teko-Bold.otf
- Teko-Light.otf
- Teko-Medium.otf
- Teko-Regular.otf
- Teko-SemiBold.otf

### Issue 2: Old fonts still showing

**Solution:**
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear browser cache completely
3. Try incognito/private window

### Issue 3: Fonts.css not imported

**Verify main.jsx has the import:**
```javascript
import './fonts.css';
import './index.css';
```

### Issue 4: Tailwind not recognizing fonts

**Check tailwind.config.js has:**
```javascript
fontFamily: {
  'teko': ['Teko', 'sans-serif'],
  'khand': ['Khand', 'sans-serif'],
  'sans': ['Khand', 'sans-serif'],
  'display': ['Teko', 'sans-serif'],
}
```

## Step 4: Quick Test

Add this to any page temporarily to test:

```jsx
<div style={{ fontFamily: 'Teko' }}>
  <h1 style={{ fontSize: '48px', fontWeight: 'bold' }}>
    TEKO FONT TEST - Should be narrow and tall
  </h1>
</div>

<div style={{ fontFamily: 'Khand' }}>
  <p style={{ fontSize: '18px' }}>
    Khand font test - Should be clean and readable
  </p>
</div>
```

## Step 5: Check Browser Console for Errors

Open console and look for:
- ❌ `Failed to load resource: net::ERR_FILE_NOT_FOUND` → Font files missing
- ❌ `@font-face failed` → CSS syntax error
- ✅ No errors → Fonts should be working

## Step 6: Force Font Application

If fonts are loading but not applying, try adding explicit classes:

```jsx
// In LandingPage.jsx or any component
<h1 className="font-teko text-6xl font-bold">
  TrustPay
</h1>

<p className="font-khand text-lg">
  Description text
</p>
```

## Quick Diagnostic Commands

Run these in your terminal:

```bash
# Check if fonts exist
ls frontend/public/fonts/ | grep -E "(Teko|Khand)"

# Check if fonts.css exists
cat frontend/src/fonts.css | head -20

# Check if main.jsx imports fonts
grep "fonts.css" frontend/src/main.jsx

# Check tailwind config
grep -A 5 "fontFamily" frontend/tailwind.config.js
```

## Still Not Working?

If fonts still don't show after all this:

1. **Delete node_modules/.cache**
   ```bash
   rm -rf frontend/node_modules/.cache
   ```

2. **Restart dev server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Check browser in incognito mode**
   - This bypasses all cache

4. **Verify font file format**
   - Make sure files are actually .otf fonts
   - Try opening one font file on your computer to verify

## Expected Result

When working correctly:
- ✅ No 404 errors in console
- ✅ Font files show in Network tab
- ✅ Computed styles show Teko/Khand
- ✅ Text looks visually different (Teko is very narrow/condensed)
- ✅ No fallback to system fonts

---

**Need more help?** Share what you see in the browser console!
