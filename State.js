var State = {

  mode: null,

  trackCount: -1,

  sendCount: -1,

  selectedTrack: {
    index: -1
  },

  selectedDevice: {
    name: "",
    enabled: false,
    isNonExistant: function() {
      return this.name === NONEXISTANT;
    }
  },

  trackBank: {
    startIndex: -1,
    existsStates: [],
    activatedStates: [],
    clipColors: []
  },

  mixerMode: {
    // -1 means we're controlling volume & pan
    // otherwise this is the start index of the 1-2 sends we are controlling
    sendIndex: -1
  },

  notificationsEnabled: false,


  scrollState: {
    canScrollTracksUp: false,
    canScrollTracksDown: false,
    canScrollScenesUp: false,
    canScrollScenesDown: false,
    canSelectPreviousDevice: false,
    canSelectNextDevice: false,
    canScrollUp: function() {
      switch (State.mode) {
        case MODES.MIXER: return State.mixerMode.sendIndex >= 0;
        case MODES.CLIP_LAUNCH: return this.canScrollScenesUp;
        case MODES.DEVICE_CONTROL: return this.canSelectPreviousDevice;
        default: return false;
      }
    },
    canScrollDown: function() {
      switch (State.mode) {
        case MODES.MIXER: return State.mixerMode.sendIndex < 0 || State.sendCount > 2;
        case MODES.CLIP_LAUNCH: return this.canScrollScenesDown;
        case MODES.DEVICE_CONTROL: return this.canSelectNextDevice;
        default: return false;
      }
    },
    canScrollLeft: function() {
      switch (State.mode) {
        case MODES.MIXER:
        case MODES.CLIP_LAUNCH: return this.canScrollTracksUp;
        case MODES.DEVICE_CONTROL: return State.selectedTrack.index > 0;
        default: return false;
      }
    },
    canScrollRight: function() {
      switch (State.mode) {
        case MODES.MIXER:
        case MODES.CLIP_LAUNCH: return this.canScrollTracksDown;
        // NOTE: we do trackCount - 2 here because we currently can't select the master track.
        // If this script supports selecting the master track in a future update, we need to change this to -1
        case MODES.DEVICE_CONTROL: return State.selectedTrack.index < (State.trackCount - 2);
        default: return false;
      }
    }
  },


  isMixerMode: function() {
    return this.mode === MODES.MIXER;
  },

  isClipLaunchMode: function() {
    return this.mode === MODES.CLIP_LAUNCH;
  },

  isDeviceControlMode: function() {
    return this.mode === MODES.DEVICE_CONTROL;
  }

};
