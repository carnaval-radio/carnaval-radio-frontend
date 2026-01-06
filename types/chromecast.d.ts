// TypeScript declarations for Google Cast SDK
declare namespace chrome {
  namespace cast {
    enum SessionState {
      NO_SESSION = 'NO_SESSION',
      SESSION_STARTING = 'SESSION_STARTING',
      SESSION_STARTED = 'SESSION_STARTED',
      SESSION_START_FAILED = 'SESSION_START_FAILED',
      SESSION_ENDING = 'SESSION_ENDING',
      SESSION_ENDED = 'SESSION_ENDED',
      SESSION_RESUMED = 'SESSION_RESUMED',
    }

    enum DefaultActionPolicy {
      CREATE_SESSION = 'createSession',
      CAST_THIS_TAB = 'castThisTab',
    }

    enum AutoJoinPolicy {
      TAB_AND_ORIGIN_SCOPED = 'tab_and_origin_scoped',
      ORIGIN_SCOPED = 'origin_scoped',
      PAGE_SCOPED = 'page_scoped',
    }

    enum Capability {
      VIDEO_OUT = 'video_out',
      AUDIO_OUT = 'audio_out',
      VIDEO_IN = 'video_in',
      AUDIO_IN = 'audio_in',
      MULTIZONE_GROUP = 'multizone_group',
    }

    class SessionRequest {
      constructor(
        appId: string,
        capabilities?: Capability[],
        timeout?: number
      );
      appId: string;
      capabilities: Capability[];
      requestSessionTimeout: number;
      language: string | null;
      credentialsData: Object | null;
    }

    class ApiConfig {
      constructor(
        sessionRequest: SessionRequest,
        sessionListener: (session: Session) => void,
        receiverListener: (receiverAvailable: string) => void,
        autoJoinPolicy?: AutoJoinPolicy,
        defaultActionPolicy?: DefaultActionPolicy
      );
      sessionRequest: SessionRequest;
      sessionListener: (session: Session) => void;
      receiverListener: (receiverAvailable: string) => void;
      autoJoinPolicy: AutoJoinPolicy;
      defaultActionPolicy: DefaultActionPolicy;
    }

    class Session {
      sessionId: string;
      appId: string;
      displayName: string;
      statusText: string;
      receiver: Receiver;
      media: media.Media[];
      
      loadMedia(
        loadRequest: media.LoadRequest,
        successCallback?: (media: media.Media) => void,
        errorCallback?: (error: Error) => void
      ): void;
      
      stop(
        successCallback?: () => void,
        errorCallback?: (error: Error) => void
      ): void;

      sendMessage(
        namespace: string,
        message: any,
        successCallback?: () => void,
        errorCallback?: (error: Error) => void
      ): void;

      addUpdateListener(listener: (isAlive: boolean) => void): void;
      removeUpdateListener(listener: (isAlive: boolean) => void): void;
      addMessageListener(namespace: string, listener: (namespace: string, message: string) => void): void;
      removeMessageListener(namespace: string, listener: (namespace: string, message: string) => void): void;
      addMediaListener(listener: (media: media.Media) => void): void;
      removeMediaListener(listener: (media: media.Media) => void): void;
    }

    class Receiver {
      label: string;
      friendlyName: string;
      capabilities: Capability[];
      volume: Volume | null;
      displayStatus: ReceiverDisplayStatus | null;
      receiverType: string;
      isActiveInput: boolean | null;
    }

    class Volume {
      level: number | null;
      muted: boolean | null;
    }

    class ReceiverDisplayStatus {
      statusText: string;
      showStop: boolean;
    }

    class Error {
      code: string;
      description: string | null;
      details: any;
    }

    namespace media {
      enum PlayerState {
        IDLE = 'IDLE',
        PLAYING = 'PLAYING',
        PAUSED = 'PAUSED',
        BUFFERING = 'BUFFERING',
      }

      enum IdleReason {
        CANCELLED = 'CANCELLED',
        INTERRUPTED = 'INTERRUPTED',
        FINISHED = 'FINISHED',
        ERROR = 'ERROR',
      }

      enum RepeatMode {
        OFF = 'REPEAT_OFF',
        ALL = 'REPEAT_ALL',
        SINGLE = 'REPEAT_SINGLE',
        ALL_AND_SHUFFLE = 'REPEAT_ALL_AND_SHUFFLE',
      }

      enum MediaCommand {
        PAUSE = 'pause',
        SEEK = 'seek',
        STREAM_VOLUME = 'stream_volume',
        STREAM_MUTE = 'stream_mute',
      }

      enum MetadataType {
        GENERIC = 0,
        MOVIE = 1,
        TV_SHOW = 2,
        MUSIC_TRACK = 3,
        PHOTO = 4,
      }

      enum StreamType {
        BUFFERED = 'buffered',
        LIVE = 'live',
        OTHER = 'other',
      }

      class MediaInfo {
        constructor(contentId: string, contentType: string);
        contentId: string;
        contentType: string;
        streamType: StreamType;
        metadata: any;
        duration: number | null;
        customData: any;
      }

      class LoadRequest {
        constructor(mediaInfo: MediaInfo);
        activeTrackIds: number[] | null;
        autoplay: boolean;
        currentTime: number;
        customData: any;
        media: MediaInfo;
      }

      class Media {
        sessionId: string;
        mediaSessionId: number;
        media: MediaInfo;
        playbackRate: number;
        playerState: PlayerState;
        currentTime: number;
        supportedMediaCommands: MediaCommand[];
        volume: Volume;
        idleReason: IdleReason | null;
        
        play(
          playRequest: any,
          successCallback?: () => void,
          errorCallback?: (error: Error) => void
        ): void;
        
        pause(
          pauseRequest: any,
          successCallback?: () => void,
          errorCallback?: (error: Error) => void
        ): void;
        
        stop(
          stopRequest: any,
          successCallback?: () => void,
          errorCallback?: (error: Error) => void
        ): void;

        addUpdateListener(listener: (isAlive: boolean) => void): void;
        removeUpdateListener(listener: (isAlive: boolean) => void): void;
      }
    }

    function initialize(
      apiConfig: ApiConfig,
      successCallback?: () => void,
      errorCallback?: (error: Error) => void
    ): void;

    function requestSession(
      successCallback: (session: Session) => void,
      errorCallback: (error: Error) => void,
      sessionRequest?: SessionRequest
    ): void;

    function setCustomReceivers(
      receivers: Receiver[],
      successCallback?: () => void,
      errorCallback?: (error: Error) => void
    ): void;

    function setReceiverDisplayStatus(receiver: Receiver): void;

    function unescape(escaped: string): string;

    const VERSION: [number, number, number];
    const isAvailable: boolean;
  }
}

interface Window {
  __onGCastApiAvailable?: (isAvailable: boolean) => void;
}
