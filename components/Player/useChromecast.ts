"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Track } from "@/types/trackTypes";
import { useDispatch } from "react-redux";
import { setRemoteState } from "@/GlobalState/features/PlayerSlice";

// Default Cast Application ID for audio streaming
const DEFAULT_CAST_APP_ID = "CC1AD845";

interface UseChromecastProps {
  trackUrl: string;
  currentTrack: Track;
  isPlaying: boolean;
  onCastStateChange?: (isCasting: boolean) => void;
}

export const useChromecast = ({
  trackUrl,
  currentTrack,
  isPlaying,
  onCastStateChange,
}: UseChromecastProps) => {
  const dispatch = useDispatch();
  const [isCastAvailable, setIsCastAvailable] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [castPlayerState, setCastPlayerState] = useState<string>("IDLE");
  const castSessionRef = useRef<chrome.cast.Session | null>(null);
  const currentMediaRef = useRef<chrome.cast.media.Media | null>(null);

  // Update Redux when cast state changes
  useEffect(() => {
    dispatch(
      setRemoteState({
        isRemoteAvailable: isCastAvailable,
        isRemoteCasting: isCasting,
        isConnecting,
        remotePlayerState: castPlayerState,
      })
    );
  }, [isCastAvailable, isCasting, isConnecting, castPlayerState, dispatch]);

  // Initialize Cast API
  useEffect(() => {
    // Don't initialize on iOS - all iOS browsers use WebKit and don't support Chromecast
    if (typeof window !== "undefined") {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        console.log("Chromecast not supported on iOS devices");
        return;
      }
    }

    const initializeCast = () => {
      if (typeof window !== "undefined" && window.chrome?.cast) {
        const sessionRequest = new chrome.cast.SessionRequest(
          DEFAULT_CAST_APP_ID
        );

        const apiConfig = new chrome.cast.ApiConfig(
          sessionRequest,
          (session) => {
            console.debug("Cast session started:", session);
            handleSessionJoined(session);
          },
          (availability) => {
            console.debug("Cast receiver availability:", availability);
            setIsCastAvailable(availability === "available");
          },
          chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
        );

        chrome.cast.initialize(
          apiConfig,
          () => {
            console.debug("Cast API initialized successfully");
          },
          (error) => {
            console.error("Cast initialization error:", error);
          }
        );
      }
    };

    // Wait for Cast API to load
    if (typeof window !== "undefined") {
      window.__onGCastApiAvailable = (isAvailable) => {
        if (isAvailable) {
          initializeCast();
        }
      };

      // Check if already loaded
      if (window.chrome?.cast?.isAvailable) {
        initializeCast();
      }
    }
  }, []);

  // Handle session joined/started
  const handleSessionJoined = useCallback(
    (session: chrome.cast.Session) => {
      castSessionRef.current = session;
      setIsCasting(true);
      setIsConnecting(false);
      onCastStateChange?.(true);

      // Check if there's already active media in the session
      if (session.media && session.media.length > 0) {
        console.log("Rejoined existing cast session with active media");
        currentMediaRef.current = session.media[0];
        
        // Update cast player state
        setCastPlayerState(session.media[0].playerState);
        
        // Add update listener to existing media
        session.media[0].addUpdateListener((isAlive) => {
          if (!isAlive) {
            console.log("Media session ended");
            currentMediaRef.current = null;
            setCastPlayerState("IDLE");
          } else {
            // Update player state
            setCastPlayerState(session.media[0].playerState);
          }
        });
      }

      // Listen for session updates
      session.addUpdateListener((isAlive) => {
        if (!isAlive) {
          handleSessionEnded();
        }
      });
    },
    [onCastStateChange]
  );

  // Handle session ended
  const handleSessionEnded = useCallback(() => {
    console.log("Cast session ended");
    castSessionRef.current = null;
    currentMediaRef.current = null;
    setIsCasting(false);
    setIsConnecting(false);
    setCastPlayerState("IDLE");
    onCastStateChange?.(false);
  }, [onCastStateChange]);

  // Load media to Cast device (only call once when starting cast)
  const loadMedia = useCallback(
    (session: chrome.cast.Session, autoplay: boolean = true) => {
      if (!trackUrl) {
        console.log("No trackUrl available, skipping load");
        return;
      }

      console.log("Loading media to Chromecast, autoplay:", autoplay);

      const mediaInfo = new chrome.cast.media.MediaInfo(trackUrl, "audio/mpeg");
      mediaInfo.streamType = chrome.cast.media.StreamType.LIVE;
      mediaInfo.metadata = {
        metadataType: chrome.cast.media.MetadataType.MUSIC_TRACK,
        title: currentTrack.title || "Carnaval Radio",
        artist: currentTrack.artist || "Carnaval-Radio.nl",
        images: currentTrack.imageurl
          ? [
              {
                url: currentTrack.imageurl,
              },
            ]
          : [
              {
                url: "https://res.cloudinary.com/dwzn0q9wj/image/upload/c_thumb,w_200,g_face/v1672311200/logo_square_512_1_78657ec246.png",
              },
            ],
      };

      const request = new chrome.cast.media.LoadRequest(mediaInfo);
      request.autoplay = autoplay;

      session.loadMedia(
        request,
        (media) => {
          console.log("Media loaded successfully, playerState:", media.playerState);
          currentMediaRef.current = media;
          setCastPlayerState(media.playerState);

          // Listen for media status updates
          media.addUpdateListener((isAlive) => {
            if (!isAlive) {
              console.log("Media session ended");
              currentMediaRef.current = null;
              setCastPlayerState("IDLE");
            } else {
              // Update player state
              setCastPlayerState(media.playerState);
            }
          });
        },
        (error) => {
          console.error("Error loading media:", error);
        }
      );
    },
    [trackUrl, currentTrack.title, currentTrack.artist, currentTrack.imageurl]
  );

  // Load media when casting starts and trackUrl is available (only for NEW sessions)
  const hasLoadedRef = useRef(false);
  
  useEffect(() => {
    if (isCasting && castSessionRef.current && trackUrl && !currentMediaRef.current && !hasLoadedRef.current) {
      console.log("Loading media for new cast session...");
      hasLoadedRef.current = true;
      loadMedia(castSessionRef.current, true);
    }
    
    // Reset flag when not casting
    if (!isCasting) {
      hasLoadedRef.current = false;
    }
  }, [isCasting, trackUrl, loadMedia]);

  // Update media metadata when track changes (without reloading the stream)
  useEffect(() => {
    if (isCasting && currentMediaRef.current) {
      // For live streams, we don't reload - we just update the display
      // The metadata update happens automatically via the stream's own metadata
      // So we don't need to do anything here for live streams
      console.log("Track changed:", currentTrack.title, "-", currentTrack.artist);
    }
  }, [currentTrack.title, currentTrack.artist, isCasting]);

  // Start casting
  const startCasting = useCallback(() => {
    if (!window.chrome?.cast) {
      console.error("Cast API not available");
      return;
    }

    setIsConnecting(true);

    chrome.cast.requestSession(
      (session) => {
        handleSessionJoined(session);
      },
      (error) => {
        console.error("Error requesting session:", error);
        setIsConnecting(false);
      }
    );
  }, [handleSessionJoined]);

  // Stop casting
  const stopCasting = useCallback(() => {
    if (castSessionRef.current) {
      castSessionRef.current.stop(
        () => {
          handleSessionEnded();
        },
        (error) => {
          console.error("Error stopping session:", error);
        }
      );
    }
  }, [handleSessionEnded]);

  // Control playback on Cast device
  const togglePlayPause = useCallback(() => {
    if (!currentMediaRef.current) return;

    const media = currentMediaRef.current;

    if (media.playerState === chrome.cast.media.PlayerState.PLAYING) {
      media.pause(
        null,
        () => {
          console.log("Media paused");
          setCastPlayerState("PAUSED");
        },
        (error) => {
          console.error("Error pausing media:", error);
        }
      );
    } else {
      media.play(
        null,
        () => {
          console.log("Media playing");
          setCastPlayerState("PLAYING");
        },
        (error) => {
          console.error("Error playing media:", error);
        }
      );
    }
  }, []);

  // Sync local play state with cast (but don't interfere on rejoin)
  const syncEnabledRef = useRef(false);
  
  useEffect(() => {
    if (isCasting && currentMediaRef.current && isPlaying !== undefined) {
      const media = currentMediaRef.current;
      const isMediaPlaying =
        media.playerState === chrome.cast.media.PlayerState.PLAYING;

      // Only sync if we've explicitly enabled syncing (not on initial rejoin)
      if (syncEnabledRef.current) {
        // Sync state - when user clicks play/pause locally, control the cast
        if (isPlaying && !isMediaPlaying) {
          console.log("Syncing: resuming cast playback");
          media.play(
            null, 
            () => setCastPlayerState("PLAYING"), 
            console.error
          );
        } else if (!isPlaying && isMediaPlaying) {
          console.log("Syncing: pausing cast playback");
          media.pause(
            null, 
            () => setCastPlayerState("PAUSED"), 
            console.error
          );
        }
      } else {
        // Enable syncing after first render (to avoid interfering with rejoined sessions)
        setTimeout(() => {
          syncEnabledRef.current = true;
        }, 1000);
      }
    }
    
    // Reset sync flag when not casting
    if (!isCasting) {
      syncEnabledRef.current = false;
    }
  }, [isPlaying, isCasting]);

  return {
    isCastAvailable,
    isCasting,
    isConnecting,
    castPlayerState,
    startCasting,
    stopCasting,
    togglePlayPause,
  };
};
