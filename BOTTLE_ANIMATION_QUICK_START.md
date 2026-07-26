# Bottle Animation - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Verify Video File
```bash
# Confirm bottle.mp4 exists in public folder
ls -la public/bottle.mp4
```

### Step 2: Install GSAP
```bash
npm install gsap
```

### Step 3: Use Component
```tsx
import AnimatedBottle from '@/components/AnimatedBottle';

export default function Home() {
  return <AnimatedBottle size={160} />;
}
```

**Done!** The bottle animation is now playing. 🎉

---

## 🎬 Animation Overview

### What's Happening:
1. **Video plays** (`bottle.mp4`) - looping smoothly
2. **GSAP animates container** - position and rotation transforms
3. **Combined effect** - video moves and rotates together

### Timeline (6 phases, 3 seconds total):
```
0.0s ├─ Rise & Rotate (-90° → 0°, diagonal up)
0.6s ├─ Hold at Center (scale pulse)
1.1s ├─ Launch & Rotate (720° spin, straight up)
1.8s ├─ Descent & Rotate (fall with rotation)
2.4s ├─ Landing & Bounce (elastic spring)
2.8s └─ Settle to Start (reset to beginning)
```

---

## ⚙️ Basic Customization

### Change Size
```tsx
<AnimatedBottle size={200} />
```

### Adjust Speed
```tsx
<AnimatedBottle
  animationConfig={{
    duration: 4, // Slower (was 3s)
  }}
/>
```

### Change Launch Height
```tsx
<AnimatedBottle
  animationConfig={{
    launchHeight: 500, // Higher launch
  }}
/>
```

### Disable Animation (just show video)
```tsx
<AnimatedBottle
  animationConfig={{
    enabled: false,
  }}
/>
```

---

## 🔍 Debug Mode

See animation values in real-time:

```tsx
<AnimatedBottle debug={true} />
```

Opens debug overlay showing:
- Transform values
- Video playback status
- FPS performance

---

## 📊 Configuration Parameters

| Parameter | Default | Example | What it does |
|-----------|---------|---------|-------------|
| `duration` | 3 | `5` | Total cycle time (seconds) |
| `holdDuration` | 0.5 | `1` | Hold at center (seconds) |
| `bounceAmount` | 20 | `30` | Landing bounce height (pixels) |
| `maxRotation` | 720 | 1080 | Total rotation (degrees) |
| `launchHeight` | 300 | 500 | Max launch height (pixels) |
| `diagonalTravelX` | 100 | 150 | Horizontal rise movement (pixels) |

---

## ✅ Performance Checklist

- ✅ Video is optimized (under 2MB)
- ✅ GSAP installed (`npm list gsap`)
- ✅ bottle.mp4 in `public/` folder
- ✅ Component renders without errors
- ✅ Animation plays smoothly (60 FPS)
- ✅ Video loops seamlessly

---

## 🎨 Full Configuration Example

```tsx
<AnimatedBottle
  size={200}
  animationConfig={{
    // Timing
    duration: 3.5,
    holdDuration: 0.7,
    bounceAmount: 25,
    
    // Movement
    maxRotation: 720,
    launchHeight: 350,
    diagonalTravelX: 120,
    
    // Easing
    riseEase: 'power2.out',
    holdEase: 'sine.inOut',
    launchEase: 'back.out',
    landingEase: 'elastic.out',
    
    // Control
    enabled: true,
  }}
  debug={false}
/>
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Video not loading | Ensure `bottle.mp4` is in `public/` folder |
| Animation not playing | Check GSAP is installed: `npm install gsap` |
| Jittery animation | Check browser hardware acceleration is on |
| Video stuck on first frame | Add `autoPlay muted loop` to video element |
| No sound needed anyway | Video is muted by default ✓ |

---

## 📁 File Structure

```
D:\Realworld\frontend\
├── public/
│   └── bottle.mp4                 ← Video file
├── app/
│   ├── components/
│   │   └── AnimatedBottle.tsx     ← Component
│   ├── hooks/
│   │   └── useBottleAnimation.ts  ← Animation logic
│   └── page.tsx                   ← Usage example
└── ANIMATION_DOCS.md              ← Full documentation
```

---

## 🎯 Next Steps

1. ✅ Verify `bottle.mp4` exists
2. ✅ Install GSAP
3. ✅ Use `<AnimatedBottle />` in your page
4. ✅ Customize as needed
5. ✅ Enjoy! 🎉

---

**Questions?** See `ANIMATION_DOCS.md` for full documentation and advanced usage.
