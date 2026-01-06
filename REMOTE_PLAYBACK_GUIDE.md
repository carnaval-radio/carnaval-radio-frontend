# Remote Playback Abstraction Guide

This guide explains the unified remote playback system that supports both **Chromecast** (for Chrome/Android) and **AirPlay** (for iOS/Safari).

## Overview

The remote playback system provides a clean abstraction layer that allows the app to support both Chromecast and AirPlay without platform-specific checks throughout the codebase.

## Architecture

### Core Hooks

1. **`useChromecast`** - Handles Chromecast functionality for Chrome-based browsers
2. **`useAirPlay`** - Handles AirPlay functionality for iOS/Safari browsers  
3. **`useRemotePlayback`** - Unified hook that wraps both and provides platform-agnostic API

### Components

1. **`RemotePlaybackButton`** - Smart button that renders the appropriate icon (Chromecast or AirPlay)
2. **`MobileChromecast`** - Mobile wrapper component (kept for backward compatibility)

### Redux State

The `PlayerSlice` uses generic remote playback state:

```typescript
{
  isRemoteAvailable: boolean,     // Remote playback is available
  isRemoteCasting: boolean,        // Currently casting to remote device
  isConnecting: boolean,           // Connecting to remote device
  remotePlayerState: string        // "IDLE" | "PLAYING" | "PAUSED" | "BUFFERING"
}
```

## Usage

### Basic Example

```typescript
import { useRemotePlayback } from "./components/Player/useRemotePlayback";

const MyComponent = () => {
  const {
    playbackType,           // "chromecast" | "airplay" | "none"
    isRemoteAvailable,      // Can we cast?
    isRemoteCasting,        // Are we casting?
    isConnecting,           // Connecting state
    remotePlayerState,      // Remote player state
    startRemotePlayback,    // Start casting
    stopRemotePlayback,     // Stop casting
    togglePlayPause,        // Toggle play/pause on remote
  } = useRemotePlayback({
    trackUrl,
    currentTrack,
    isPlaying,
    audioRef,
    onRemoteStateChange: (isRemote) => {
      // Handle state changes
    }
  });

  // Use the generic API instead of platform-specific checks
  if (isRemoteCasting) {
    // User is casting
  }
};
```

### Using the Button Component

```typescript
import RemotePlaybackButton from "./components/Player/RemotePlaybackButton";

<RemotePlaybackButton
  playbackType={playbackType}
  isRemoteAvailable={isRemoteAvailable}
  isRemoteCasting={isRemoteCasting}
  isConnecting={isConnecting}
  onRemoteClick={() => {
    if (isRemoteCasting) {
      stopRemotePlayback();
    } else {
      startRemotePlayback();
    }
  }}
  size="medium"  // "small" | "medium" | "large"
  className="text-white"
/>
```

## Platform Detection

The system automatically detects the platform:

- **iOS/Safari**: Uses AirPlay via WebKit APIs
- **Chrome/Android**: Uses Google Cast SDK
- **Other browsers**: Falls back to "none"

Detection logic:
```typescript
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

if (isIOS || isSafari) {
  return "airplay";
} else {
  return "chromecast";
}
```

## Key Benefits

1. **Clean Code**: No `isCasting || isAirPlaying` checks - use `isRemoteCasting` instead
2. **Platform Agnostic**: Same API works for both Chromecast and AirPlay
3. **Automatic Detection**: Platform is detected automatically, no manual configuration
4. **Type Safe**: Full TypeScript support with proper types
5. **Redux Integration**: State automatically synced to Redux store

## Migration from Old Code

### Before (Platform-Specific)
```typescript
const { isCasting, startCasting } = useChromecast(...);

if (isCasting) {
  // Handle Chromecast
}
```

### After (Unified)
```typescript
const { isRemoteCasting, startRemotePlayback } = useRemotePlayback(...);

if (isRemoteCasting) {
  // Handle any remote playback (Chromecast OR AirPlay)
}
```

## Browser Support

- **Chromecast**: Chrome, Edge, Opera, Chrome for Android
- **AirPlay**: Safari (macOS/iOS), all iOS browsers (they all use WebKit)
- **Both require**: HTTPS connection for security

## Technical Details

### Chromecast
- Uses Google Cast SDK v1
- Requires `<script>` tag in layout
- Default App ID: `CC1AD845` (generic audio player)
- Stream type: `LIVE` for continuous radio

### AirPlay  
- Uses WebKit AirPlay APIs
- Built into Safari/iOS browsers
- Methods: `webkitShowPlaybackTargetPicker()`
- Events: `webkitcurrentplaybacktargetiswirelesschanged`

## State Flow

1. User clicks cast button
2. `startRemotePlayback()` called
3. Platform-specific hook handles connection
4. Redux state updated: `isRemoteCasting = true`
5. Local audio paused automatically
6. Remote device starts playback
7. UI shows remote player state

## Troubleshooting

### Chromecast not showing
- Check if running on HTTPS
- Verify Cast SDK script loaded in layout
- Check browser console for errors

### AirPlay not showing
- Only works on iOS/Safari
- Requires compatible AirPlay device on same network
- Check if audio element has proper source

### State not syncing
- Verify Redux DevTools shows state updates
- Check if `onRemoteStateChange` callback is firing
- Ensure hooks are re-rendering properly
