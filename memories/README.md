# Memory Images Upload Guide

This folder is where you should upload images for the memory slideshow feature in Bebu's app.

## How to Upload Images:

1. **Folder Location**: Upload your images to `public/memories/`
2. **Naming Convention**:
   - For date memories: `date1.jpg`, `date2.jpg`, `date3.jpg`, etc.
   - For beach memories: `beach1.jpg`, `beach2.jpg`, etc.
   - For special moments: `special1.jpg`, `special2.jpg`, etc.
   - Or any descriptive name that matches the memory title

3. **Supported Formats**: JPG, PNG, GIF, WebP
4. **Recommended Size**: 1200x800 pixels or similar aspect ratio for best display
5. **File Size**: Keep under 2MB per image for optimal loading

## Current Memories Setup:

The app currently has 3 sample memories:
- **Our First Date** (uses: date1.jpg, date2.jpg, date3.jpg)
- **Beach Day Adventure** (uses: beach1.jpg, beach2.jpg)
- **Our Special Moments** (uses: special1.jpg, special2.jpg, special3.jpg)

## Adding New Memories:

To add new memories, you'll need to modify the `MemoryFeature.tsx` component and add new entries to the `sampleMemories` array with:
- Unique ID
- Title
- Message text
- Array of image paths
- Date

Example:
```javascript
{
  id: "new_memory",
  title: "New Memory Title",
  message: "Your loving message here...",
  images: ["/memories/new1.jpg", "/memories/new2.jpg"],
  date: "2024-12-25"
}
```

Upload your images here and they'll automatically appear in the memory slideshow! 💕📸
