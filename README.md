# bitwig-launch-control

## TODO List:

More button display feedback
- In device control view, simply display a red light or not depending on whether a device is actively selected
- Improve display of mixer buttons. No track means no light.
- light up arrow buttons when scrolling is possible, no need to light on press
- In clip launcher, probably want active/non-active lighting and blinking when queueing up start (or even stop)?

up/down arrows in mixer mode to select the sends (use the track bank!)

Changing modes does not update button state (see TODO and flush() function)
Changing mode should probably hide the clip launch indicators? (but don't lose track of where they are if tracks are changed)

More onscreen text feedback when using the arrow buttons (compare with behavior in Live)

Seems like device navigation doesn't work if nothing is selected (i.e. make a new track, drop some devices on it, try to navigate with LC)

Can't scroll to master track. Meh?
