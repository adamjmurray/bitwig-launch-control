var Input = {

  ignoreNextSelectedTrackChange: false,
  allowTrackBankRangeNotification: false,
  allowDeviceNameNotification: false,


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
    var channel = data.hexByteAt(7),
      mode;

    LaunchControl.channel = channel;

    switch (channel) {
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

    if (mode) Input.onModeChange(mode);
  },


  onModeChange: function (mode) {
    var deviceControlMode = (mode === MODES.DEVICE_CONTROL);

    State.mode = mode;

    host.showPopupNotification("Mode: " + mode);

    for (var i = 0; i < CHANNELS; i++) {
      cursorDevice.getMacro(i).getAmount().setIndication(deviceControlMode);
    }

    LaunchControl.refreshButtons();
  },


  onBottomRowButtonPress: function(index) {
    var track,
      clipLauncherSlots;

    if (index == null) return;
    track = trackBank.getTrack(index);
    if (!track) return;

    if (State.isMixerMode()) {
      track.isActivated().toggle();
    }
    else if (State.isClipLaunchMode()) {
      clipLauncherSlots = track.getClipLauncherSlots();
      // we're using a single-scene track bank, so the slot index is always 0
      clipLauncherSlots.launch(0);
    }
  },


  onUpArrow: function() {
    if (State.isMixerMode()) {
      // TODO: in mixer mode, switch between volume/pan and return track levels
    }
    else if (State.isClipLaunchMode()) {
      trackBank.scrollScenesUp();
    }
    else if (State.isDeviceControlMode()) {
      Input.allowDeviceNameNotification = true;
      cursorDevice.selectPrevious();
    }
  },

  onDownArrow: function() {
    if (State.isMixerMode()) {
      // TODO: in mixer mode, switch between volume/pan and return track levels
    }
    else if (State.isClipLaunchMode()) {
      trackBank.scrollScenesDown();
    }
    else if (State.isDeviceControlMode()) {
      Input.allowDeviceNameNotification = true;
      cursorDevice.selectNext();
    }
  },

  onLeftArrow: function() {
    Input.ignoreNextSelectedTrackChange = true;
    Input.allowTrackBankRangeNotification = true;
    Input.allowDeviceNameNotification = true;
    trackBank.scrollChannelsUp();
    cursorTrack.selectPrevious();
  },

  onRightArrow: function() {
    Input.ignoreNextSelectedTrackChange = true;
    Input.allowTrackBankRangeNotification = true;
    Input.allowDeviceNameNotification = true;
    trackBank.scrollChannelsDown();
    cursorTrack.selectNext();
  },


  onKnobTurn: function(data1, data2) {
    var index;

    if (State.isMixerMode()) {
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

    else if (State.isDeviceControlMode()) {
      index = LaunchControl.macroIndex(data1);
      if (index != null) {
        cursorDevice.getMacro(index).getAmount().set(data2, 128);
      }
    }
  },


  observeTrackActivated: function(trackBankIndex) {
    return function onTrackActivatedChange(isActivated) {
      State.trackBank.activatedStates[trackBankIndex] = isActivated;
      if (State.isMixerMode()) {
        LaunchControl.displayTrackActivated(trackBankIndex, isActivated);
      }
    }
  },


  observeClipLauncherSlotsColor: function(trackBankIndex) {
    // first arg (slotIndex) is always 0,
    // I guess because we are accessing this via a track bank
    return function onClipLauncherSlotsColorChange(_, red, green, blue) {
      State.trackBank.clipColors[trackBankIndex] = [red, green, blue];
      if (State.isClipLaunchMode()) {
        LaunchControl.displayClipColor(trackBankIndex, red, green, blue);
      }
    }
  },


  onSelectedTrackIndexChange: function(selectedTrackIndex) {
    State.selectedTrack.index = selectedTrackIndex;
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
  },


  onTrackBankPositionChange: function(startIndex) {
    State.trackBank.startIndex = startIndex;
    if (Input.allowTrackBankRangeNotification) {
      Input.allowTrackBankRangeNotification = false;
      if (!State.isDeviceControlMode()) {
        // Minor bug: the end track number is wrong when there are fewer than 8 tracks.
        host.showPopupNotification("Controlling tracks: " + (startIndex + 1) + "-" + (startIndex + CHANNELS));
      }
    }
  },


  onSelectedDeviceNameChange: function(deviceName) {
    State.selectedDevice.name = deviceName;
    if (Input.allowDeviceNameNotification) {
      Input.allowDeviceNameNotification = false;
      if (State.isDeviceControlMode() && deviceName) {
        host.showPopupNotification("Controlling device: " + deviceName);
      }
    }
  }
};
