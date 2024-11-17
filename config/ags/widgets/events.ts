// TODO: finalise args
type MediaEventListener = (...args: any[]) => void

// 'update' - General update to the list
// 'pinned' - A handler just got pinned
type MediaEventSignal = 'update' | 'pinned' | 'unpinned';

// TEST: does this cause memory leaks for long-running sessions?
class MediaEventEmitter {
  private events: Record<string, Array<MediaEventListener>> = {};

  public connect(signal: MediaEventSignal, listener: MediaEventListener) {
    if (!this.events[signal]) {
      this.events[signal] = []
    };
    this.events[signal].push(listener);
  }

  public disconnect(signal: MediaEventSignal, listener: MediaEventListener) {
    // Check if the event exists
    if (!this.events[signal]) return;
    this.events[signal] = this.events[signal].filter((v) => v !== listener);
  }

  public clear(signal: MediaEventSignal) {
    if (!this.events[signal]) return;
    this.events[signal] = [];
  }

  public emit(signal: MediaEventSignal, ...args: any[]) {
    if (!this.events[signal]) return;
    for (const listener of this.events[signal]) {
      listener(...args);
    }
  }
}

// Exporting types
export {
  MediaEventListener,
  MediaEventSignal,
}

// Exporting functional stuff
export {
  MediaEventEmitter
}
