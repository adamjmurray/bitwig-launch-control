loadAPI(1);
load("Constants.js");
load("Utils.js");
load("LaunchControl.js");


host.defineController("Novation", "Launch Control", "0.0.1",
                      "7c1c2f16-4698-4acf-9c08-3370bf52af74", "Adam Murray");
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(["Launch Control"], ["Launch Control"]);


var trackBank,
  cursorTrack,
  cursorDevice;


function init() {
  var i;
  host.getMidiInPort(0).setMidiCallback(onMidi);
  host.getMidiInPort(0).setSysexCallback(onSysex);

  trackBank = host.createTrackBank(NUM_CHANNELS, 0, 1);
  for (i = 0; i < NUM_CHANNELS; i++) {
    var track = trackBank.getTrack(i);
    track.getClipLauncher().setIndication(true);
  }
  cursorTrack = host.createArrangerCursorTrack(0, 1);
  cursorDevice = host.createEditorCursorDevice();

  LaunchControl.reset();
}


function exit() {
  LaunchControl.reset();
}


function onMidi(status, data1, data2) {
  var index,
    deviceControlMode = LaunchControl.isDeviceControlMode(status),
    mixerMode = LaunchControl.isMixerMode(status);

  // printMidi(status, data1, data2);

  if (isNoteOn(status)) {
    // handle pushes of the 8 buttons on bottom
    if (mixerMode) {
      index = LaunchControl.buttonIndex(data1);
      if (index != null) {
        trackBank.getTrack(index).isActivated().toggle();
      }
    }
  }
  else if (isChannelController(status)) {
    // handle knob turns and arrow button pushes
    if (LaunchControl.isButtonPressedDown(data2)) {
      switch (data1) {
        case UP_ARROW:
          if (deviceControlMode) {
            cursorDevice.selectPrevious();
          } else {
            // TODO: in mixer mode, it should switch between volume/pan and return track levels
            trackBank.scrollScenesUp();
          }
          break;

        case DOWN_ARROW:
          if (deviceControlMode) {
            cursorDevice.selectNext();
          } else {
            // TODO: in mixer mode, it should switch between volume/pan and return track levels
            trackBank.scrollScenesDown();
          }
          break;

        case LEFT_ARROW:
          trackBank.scrollChannelsUp();
          cursorTrack.selectPrevious();
          break;

        case RIGHT_ARROW:
          trackBank.scrollChannelsDown();
          cursorTrack.selectNext();
          break;
      }
    }

    if (deviceControlMode) {
      index = LaunchControl.macroIndex(data1);
      if (index != null) {
        cursorDevice.getMacro(index).getAmount().set(data2, 128);
      }
    }
    else {
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
  }

  // echo back to the device for basic button press support
  sendMidi(status, data1, data2);
}


function onSysex(data) {
  var lcTemplateIndex = data.hexByteAt(7),
    mode;

  // if(lcTemplateIndex < 8) {
  //   println("Launch Control Template: User #" + (lcTemplateIndex+1));
  // }
  // else {
  //   println("Launch Control Template: Factory #" + (lcTemplateIndex-7));
  // }

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
}
