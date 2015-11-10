var State = {

  mode: null,

  trackCount: -1,

  sendCount: -1,

  selectedTrack: {
    index: -1
  },

  selectedDevice: {
    name: ""
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
