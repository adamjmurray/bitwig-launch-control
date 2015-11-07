loadAPI(1);
load("Globals.js");
load("Utils.js");
load("State.js");
load("Input.js");
load("LaunchControl.js");


host.defineController("Novation", "Launch Control", "0.0.1",
                      "7c1c2f16-4698-4acf-9c08-3370bf52af74", "Adam Murray");
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(["Launch Control"], ["Launch Control"]);


function init() {
  var i,
    track,
    clipLauncherSlots;

  host.getMidiInPort(0).setMidiCallback(Input.onMidi);
  host.getMidiInPort(0).setSysexCallback(Input.onSysex);

  trackBank = host.createTrackBank(CHANNELS, 2, 1);
  cursorTrack = host.createArrangerCursorTrack(0, 1);
  cursorDevice = host.createEditorCursorDevice();

  for (i = 0; i < CHANNELS; i++) {
    track = trackBank.getTrack(i);
    clipLauncherSlots = track.getClipLauncherSlots();

    track.isActivated().addValueObserver(Input.observeTrackActivated(i));
    clipLauncherSlots.setIndication(true);
    clipLauncherSlots.addColorObserver(Input.observeClipLauncherSlotsColor(i));
  }
  cursorTrack.addPositionObserver(Input.onSelectedTrackIndexChange);

  cursorDevice.addNameObserver(128, "", Input.onSelectedDeviceNameChange);

  trackBank.addChannelScrollPositionObserver(Input.onTrackBankPositionChange, -1);

  LaunchControl.reset();
}


function exit() {
  LaunchControl.reset();
}


//function flush() {
//  // println('in flush!');
//}
