# bitwig-launch-control

## TODO List:

* up/down arrows in mixer mode to select the sends (use the track bank!)

* More button display feedback
  - light up arrow buttons when scrolling is possible, no need to light on press
  - In clip launcher, probably want active/non-active lighting and blinking when queueing up start (or even stop)?

* device activation handling, see TODO in onSelectedDeviceNameChange() (also update refreshButtons())

* Changing mode should probably hide the clip launch indicators? (but don't lose track of where they are if tracks are changed)

* Seems like device navigation doesn't work if nothing is selected (i.e. make a new track, drop some devices on it, try to navigate with LC)

* Can't scroll to master track. Meh?

