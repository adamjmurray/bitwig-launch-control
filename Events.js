var Events = {

  // "private" fields
  _ignoreNextSelectedTrackChange: false,
  _allowTrackBankRangeNotification: false,
  _allowDeviceNameNotification: false,


  onMidi: function(status, data1, data2) {
    // printMidi(status, data1, data2);

    if (isNoteOn(status)) {
      Events.onBottomRowButtonPress(LaunchControl.buttonIndex(data1));
    }
    else if (isChannelController(status)) {
      // arrow button pushes (which are CCs), and knob turns
      switch (data1) {

      case UP_ARROW:
        if (!LaunchControl.isButtonPressedDown(data2)) return; // else button is being lifted, so ignore
        Events.onUpArrow();
        break;

      case DOWN_ARROW:
        if (!LaunchControl.isButtonPressedDown(data2)) return;
        Events.onDownArrow();
        break;

      case LEFT_ARROW:
        if (!LaunchControl.isButtonPressedDown(data2)) return;
        Events.onLeftArrow();
        break;

      case RIGHT_ARROW:
        if (!LaunchControl.isButtonPressedDown(data2)) return;
        Events.onRightArrow();
        break;

      default:
        Events.onKnobTurn(data1, data2);
      }
    }
  },


  onSysex: function(data) {
    var mode,
      channel = data.hexByteAt(7);

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

    Events.onModeChange(mode);
  },


  onModeChange: function (mode) {
    var isDeviceControlMode = (mode === MODES.DEVICE_CONTROL);

    State.mode = mode;

    Utils.notify("Mode: " + mode);

    for (var i = 0; i < CHANNELS; i++) {
      cursorDevice.getMacro(i).getAmount().setIndication(isDeviceControlMode);
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
    else if (State.isDeviceControlMode()) {
      cursorDevice.toggleEnabledState();
    }
  },


  onUpArrow: function() {
    if (State.isMixerMode()) {
      if (State.mixerMode.sendIndex >= 0) {
        // changing from controlling sends to pan/volume
        sendIndex = State.mixerMode.sendIndex = -1;
        Utils.notify("Pan and Volume");
      }
      // TODO: test this against the behavior in Live
    }
    else if (State.isClipLaunchMode()) {
      trackBank.scrollScenesUp();
    }
    else if (State.isDeviceControlMode()) {
      Events._allowDeviceNameNotification = true;
      cursorDevice.selectPrevious();
    }
  },

  onDownArrow: function() {
    var sendIndex, notification;
    if (State.isMixerMode()) {
      sendIndex = State.mixerMode.sendIndex;
      if (sendIndex < 0) {
        // changing from controlling pan/volume to sends
        sendIndex = 0;
      }
      else {
        if (sendIndex+2 < State.sendCount) {
          sendIndex += 2;
        }
        else { // wrap-around
          sendIndex = 0;
        }
      }
      if (State.mixerMode.sendIndex !== sendIndex) {
        State.mixerMode.sendIndex = sendIndex;
        notification = "Sends " + (sendIndex + 1);
        if (State.sendCount > sendIndex + 1) notification += "-" + (sendIndex + 2);
        Utils.notify(notification);
      }
    }
    else if (State.isClipLaunchMode()) {
      trackBank.scrollScenesDown();
    }
    else if (State.isDeviceControlMode()) {
      Events._allowDeviceNameNotification = true;
      cursorDevice.selectNext();
    }
  },

  onLeftArrow: function() {
    Events._ignoreNextSelectedTrackChange = true;
    Events._allowTrackBankRangeNotification = true;
    Events._allowDeviceNameNotification = true;
    trackBank.scrollChannelsUp();
    cursorTrack.selectPrevious();
  },

  onRightArrow: function() {
    Events._ignoreNextSelectedTrackChange = true;
    Events._allowTrackBankRangeNotification = true;
    Events._allowDeviceNameNotification = true;
    trackBank.scrollChannelsDown();
    cursorTrack.selectNext();
  },


  onKnobTurn: function(data1, data2) {
    var index, sendIndex;

    if (State.isMixerMode()) {
      // control volume and panning
      index = LaunchControl.knobIndexFirstRow(data1);
      sendIndex = State.mixerMode.sendIndex;
      if (index != null) {
        // top row of knobs
        if (sendIndex >= 0) {
          trackBank.getTrack(index).getSend(sendIndex).set(data2, 128);
        }
        else {
          trackBank.getTrack(index).getPan().set(data2, 128);
        }
      }
      else {
        // bottom row of knobs
        index = LaunchControl.knobIndexSecondRow(data1);
        if (index != null) {
          if (sendIndex >= 0) {
            if (sendIndex+1 < State.sendCount) {
              trackBank.getTrack(index).getSend(sendIndex + 1).set(data2, 128);
            }
          }
          else {
            trackBank.getTrack(index).getVolume().set(data2, 128);
          }
        }
      }
    }

    else if (State.isDeviceControlMode()) {
      index = LaunchControl.macroIndex(data1);
      if (index != null) {
        cursorDevice.getMacro(index).getAmount().set(data2, 128);
      }
    }
  },


  observeTrackExists: function(trackBankIndex) {
    return function onTrackExistsChange(exists) {
      State.trackBank.existsStates[trackBankIndex] = exists;
      if(!exists) {
        LaunchControl.setButton(trackBankIndex, 0, 0);
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


  onSelectedDeviceNameChange: function(deviceName) {
    State.selectedDevice.name = deviceName;
    if (Events._allowDeviceNameNotification) {
      Events._allowDeviceNameNotification = false;
      if (State.isDeviceControlMode()) {
        if(!State.selectedDevice.isNonExistant()) {
          Utils.notify("Device: " + deviceName);
        }
        LaunchControl.displayDeviceState();
      }
    }
  },


  onSelectedDeviceEnabledChange: function(isEnabled) {
    State.selectedDevice.enabled = isEnabled;
    if (State.isDeviceControlMode()) {
      LaunchControl.displayDeviceState();
    }
  },


  onSelectedTrackIndexChange: function(selectedTrackIndex) {
    State.selectedTrack.index = selectedTrackIndex;
    if (Events._ignoreNextSelectedTrackChange) {
      Events._ignoreNextSelectedTrackChange = false;
    }
    else {
      // TODO: check if Live does this behavior. Maybe just get rid of this behavior/hack
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
    if (Events._allowTrackBankRangeNotification) {
      Events._allowTrackBankRangeNotification = false;
      if (!State.isDeviceControlMode()) {
        Utils.notify("Tracks: " + (startIndex+1) + "-" +
          Math.min(startIndex+CHANNELS, State.trackCount));
      }
    }
  },


  /**
   * Observes number of all tracks, including effect (send) tracks and the master track
   */
  onTrackCountChange: function(trackCount) {
    State.trackCount = trackCount;
  },

  /**
   * Observes number of effect (send) tracks
   */
  onEffectTrackCountChange: function(sendCount) {
    State.sendCount = sendCount;
    if(State.mixerModeSendIndex >= sendCount) {
      // TODO: fix mixer mode state
    }
  },

  onUserNotificationsEnabledChange: function(notificationsEnabled) {
    State.notificationsEnabled = notificationsEnabled;
  }

};
