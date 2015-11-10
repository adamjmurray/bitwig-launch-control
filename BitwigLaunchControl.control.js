var
  UP_ARROW = 114,
  DOWN_ARROW = 115,
  LEFT_ARROW = 116,
  RIGHT_ARROW = 117,

  MODES = {
    MIXER: "mixer",
    CLIP_LAUNCH: "clip launch",
    DEVICE_CONTROL: "device control",
    CUSTOM: "custom"
  },

  CHANNELS = 8,

  trackBank,
  effectTrackBank,
  cursorTrack,
  cursorDevice,

  NONEXISTANT = "___nonexistant___";


loadAPI(1);
load("Utils.js");
load("State.js");
load("Events.js");
load("LaunchControl.js");


host.defineController("Novation", "Launch Control", "0.0.1",
                      "7c1c2f16-4698-4acf-9c08-3370bf52af74", "Adam Murray");
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(["Launch Control"], ["Launch Control"]);


function init() {
  var i,
    track,
    clipLauncherSlots;

  host.getMidiInPort(0).setMidiCallback(Events.onMidi);
  host.getMidiInPort(0).setSysexCallback(Events.onSysex);

  trackBank = host.createTrackBank(CHANNELS, 256, 1);
  effectTrackBank = host.createEffectTrackBank(1, 1);
  cursorTrack = host.createArrangerCursorTrack(0, 1);
  cursorDevice = host.createEditorCursorDevice();

  for (i = 0; i < CHANNELS; i++) {
    track = trackBank.getTrack(i);
    clipLauncherSlots = track.getClipLauncherSlots();

    track.isActivated().addValueObserver(Events.observeTrackActivated(i));
    track.exists().addValueObserver(Events.observeTrackExists(i));
    clipLauncherSlots.setIndication(true);
    clipLauncherSlots.addColorObserver(Events.observeClipLauncherSlotsColor(i));
  }
  cursorTrack.addPositionObserver(Events.onSelectedTrackIndexChange);

  cursorDevice.addNameObserver(128, NONEXISTANT, Events.onSelectedDeviceNameChange);

  trackBank.addChannelScrollPositionObserver(Events.onTrackBankPositionChange, -1);
  trackBank.addChannelCountObserver(Events.onTrackCountChange);
  // TODO: I think we should be able to use addSendCountObserver() but it doesn't seem to work!
  effectTrackBank.addChannelCountObserver(Events.onEffectTrackCountChange);

  LaunchControl.reset();
}


function exit() {
  LaunchControl.reset();
}


//function flush() {
//  // println('in flush!');
//}
