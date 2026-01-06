# Notification Sounds

## Adding a Custom Notification Sound

To use a custom notification sound for new order alerts:

1. **Add your sound file** to this directory:
   - Recommended name: `notification.mp3`
   - Supported formats: MP3, WAV, OGG
   - Recommended duration: 1-3 seconds
   - Keep file size small (< 100KB)

2. **Update the component** in `src/components/distributor/OrderNotifications.tsx`:
   - Find line ~33 where it says:
     ```typescript
     // audioRef.current.src = '/sounds/notification.mp3';
     ```
   - Uncomment it:
     ```typescript
     audioRef.current.src = '/sounds/notification.mp3';
     ```
   - Comment out or remove the data URI line below it

3. **Free Sound Resources**:
   - [Freesound.org](https://freesound.org/) - Free sound effects
   - [Zapsplat.com](https://www.zapsplat.com/) - Free sound effects
   - [Mixkit.co](https://mixkit.co/free-sound-effects/) - Free notification sounds

## Example Sound Types

Good notification sounds:
- ✅ Short bell chime
- ✅ Gentle ding
- ✅ Soft notification beep
- ✅ Cash register sound
- ✅ Message pop sound

Avoid:
- ❌ Long sounds (> 5 seconds)
- ❌ Loud or jarring sounds
- ❌ Music tracks
- ❌ Large file sizes

## Testing Your Sound

After adding the file:
1. Restart your dev server (`npm run dev`)
2. Login as distributor
3. Place an order as a user
4. Wait up to 30 seconds
5. You should hear your custom sound!

## Current Setup

Currently using: **Built-in simple beep** (data URI)
- No external file needed
- Works immediately
- Basic beep sound

To upgrade to a better sound, follow the steps above!
