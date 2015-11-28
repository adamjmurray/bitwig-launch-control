# Bitwig LaunchControl

This is a [Bitwig Studio](http://www.bitwig.com) controller script for the
[Novation LaunchControl](http://global.novationmusic.com/launch/launch-control).

It reproduces the
[LaunchControl's Ableton Live features](http://global.novationmusic.com/sites/default/files/novation/downloads/7375/launch-control-ableton-live-guide.pdf)
inside of Bitwig Studio.

See [Bitwig's controller scripts page](http://www.bitwig.com/en/community/control_scripts.html) for more info.


## Setup

1. Download [bitwig-launch-control.zip](https://github.com/adamjmurray/bitwig-launch-control/archive/master.zip)
2. Unzip in:
    * Windows: `%USERPROFILE%\Documents\Bitwig Studio\Controller Scripts\ `
    * Mac: `~/Documents/Bitwig Studio/Controller Scripts/`
    * Linux: `~/Bitwig Studio/Controller Scripts/`
3. Start / restart Bitwig Studio
4. Plug in your LaunchControl
5. Go to Bitwig Preferences &rarr; Controllers
6. Click "Detect Available Controllers".
    * The LaunchControl should appear automatically. If not, try adding it manually.

Problems? See [Bitwig's Control Script Installation Guide](http://www.bitwig.com/en/community/control_scripts/installation_guide)


## Usage

This script reproduces the LaunchControl's behavior for Ableton Live inside Bitwig Studio.
See the [LaunchControl's' manual for Ableton Live](http://global.novationmusic.com/sites/default/files/novation/downloads/7375/launch-control-ableton-live-guide.pdf)
for usage instructions.


## Known Issues and Limitations

* Can't scroll to master track in device control mode.

* Send scrolling is buggy if you delete a *named* send.
  Appears to be a bug in Bitwig that may clear up in the future.


## Changelog

| Version | Release&nbsp;Date | Notes |
| ------- | ------------ | ----- |
| 1.0     | coming soon | Initial Release. Reproduces the LaunchControl's Ableton Live features.


## TODOs:

* More button display feedback
  - light up arrow buttons when scrolling is possible, no need to light on press
  - In clip launcher, probably want active/non-active lighting and blinking when queueing up start (or even stop)?

* device activation handling, see TODO in onSelectedDeviceNameChange() (also update refreshButtons())

* Report bug with deleting named sends (see below).
  Also, trackBand.onSendCountChange() doesn't seem to work. And send scrolling doesn't seem to work. wtf...

* Cleanup TODOs

* Test custom mode. Test behavior against Live.