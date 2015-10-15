var Input = {

  ignoreNextSelectedTrackChange: false,


  onMidi: function(status, data1, data2) {
    // printMidi(status, data1, data2);

    if (isNoteOn(status)) {
      Input.onBottomRowButtonPress(LaunchControl.buttonIndex(data1));
    }
    else if (isChannelController(status)) {
      // arrow button pushes (which are CCs), and knob turns
      switch (data1) {

      case UP_ARROW:
        if (!LaunchControl.isButtonPressedDown(data2)) return; // else button is being lifted, so ignore
        Input.onUpArrow();
        break;

      case DOWN_ARROW:
        if (!LaunchControl.isButtonPressedDown(data2)) return;
        Input.onDownArrow();
        break;

      case LEFT_ARROW:
        if (!LaunchControl.isButtonPressedDown(data2)) return;
        Input.onLeftArrow();
        break;

      case RIGHT_ARROW:
        if (!LaunchControl.isButtonPressedDown(data2)) return;
        Input.onRightArrow();
        break;

      default:
        Input.onKnobTurn(data1, data2);
      }
    }
  },


  onSysex: function(data) {
    var lcTemplateIndex = data.hexByteAt(7),
      mode;

    switch (lcTemplateIndex) {
    case 8:
      mode = MODES.MIXER;
      break;
    case 9:
      mode = MODES.CLIP_LAUNCH;
      break;
    case 10:
      mode = MODES.DEVICE_CONTROL;
      break;
    default:
      mode = MODES.CUSTOM;
      break;
    }

    if (mode) LaunchControl.onModeChange(mode);
  },


  onBottomRowButtonPress: function(index) {
    var track,
      clipLauncherSlots;

    if (index == null) return;
    track = trackBank.getTrack(index);
    if (!track) return;

    if (LaunchControl.isMixerMode()) {
      track.isActivated().toggle();
    }
    else if (LaunchControl.isClipLaunchMode()) {
      clipLauncherSlots = track.getClipLauncherSlots();
      // we're using a single-scene track bank, so the slot index is always 0
      clipLauncherSlots.launch(0);
    }
  },


  onUpArrow: function() {
    if (LaunchControl.isMixerMode()) {
      // TODO: in mixer mode, switch between volume/pan and return track levels
    }
    else if (LaunchControl.isClipLaunchMode()) {
      trackBank.scrollScenesUp();
    }
    else if (LaunchControl.isDeviceControlMode()) {
      cursorDevice.selectPrevious();
    }
  },

  onDownArrow: function() {
    if (LaunchControl.isMixerMode()) {
      // TODO: in mixer mode, switch between volume/pan and return track levels
    }
    else if (LaunchControl.isClipLaunchMode()) {
      trackBank.scrollScenesDown();
    }
    else if (LaunchControl.isDeviceControlMode()) {
      cursorDevice.selectNext();
    }
  },

  onLeftArrow: function() {
    trackBank.scrollChannelsUp();
    Input.ignoreNextSelectedTrackChange = true;
    cursorTrack.selectPrevious();
  },

  onRightArrow: function() {
    trackBank.scrollChannelsDown();
    Input.ignoreNextSelectedTrackChange = true;
    cursorTrack.selectNext();
  },


  onKnobTurn: function(data1, data2) {
    var index;

    if (LaunchControl.isMixerMode()) {
      // control volume and panning
      index = LaunchControl.knobIndexFirstRow(data1);
      if (index != null) {
        trackBank.getTrack(index).getVolume().set(data2, 128);
      }
      else {
        index = LaunchControl.knobIndexSecondRow(data1);
        if (index != null) {
          trackBank.getTrack(index).getPan().set(data2, 128);
        }
      }
      // TODO: in mixer mode, can also control return rack levels
    }

    else if (LaunchControl.isDeviceControlMode()) {
      index = LaunchControl.macroIndex(data1);
      if (index != null) {
        cursorDevice.getMacro(index).getAmount().set(data2, 128);
      }
    }
  },


  observeTrackActivated: function(trackBankIndex) {
    return function(value) {
      if (LaunchControl.isMixerMode()) {
        var color = value ? 1 : 0.25;
        LaunchControl.setButton(trackBankIndex, color, color);
      }
    }
  },


  observeClipLauncherSlotsColor: function(trackBankIndex) {
    // first arg (slotIndex) is always 0,
    // I guess because we are accessing this via a track bank
    return function(_, red, green, blue) {
      if (LaunchControl.isClipLaunchMode()) {
        // use exponential range to coerce low values to 0
        LaunchControl.setButton(trackBankIndex, red * red, green * green);
      }
    }
  },


  onSelectedTrackIndexChange: function(selectedTrackIndex) {
    if (Input.ignoreNextSelectedTrackChange) {
      Input.ignoreNextSelectedTrackChange = false;
    }
    else {
      // scrollToChannel() isn't smart enough to keep 8 channels visible in the track bank
      // this hack makes things self-correct:
      if (selectedTrackIndex > 0) {
        trackBank.scrollToChannel(selectedTrackIndex - 1);
        trackBank.scrollChannelsDown();
      }
      else {
        trackBank.scrollToChannel(0);
      }
    }
  }

};
