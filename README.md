threeleapcontrols
=================

## Introduction

[Three.js](http://threejs.org) provides several control classes in order to interact with your 3D world.
They are located under `three.js/examples/js/controls` in your Three.js directory.
With **threeleapcontrols** you can use your leap motion controller to rotate, zoom/scale and pan 
any camera or object in your 3D scene.

## Requirements 

- a [leap motion](http://leapmotion.com) controller
- [leapjs](http://js.leapmotion.com) (javascript sdk for leap motion controller)
- [Three.js](http://threejs.org) (javascript library for creating and displaying 3D computer graphics on a browser)
- a browser which supports WebGL, e.g. Google Chrome

## Showcase

Check out the example file `example.html` and/or see it in action [here](http://youtu.be/SQDAa-cqlrA).

## Usage

First, you load the necessary javascript files in your HTML document
```html
<script src="three.min.js"></script>
<script src="leap.min.js"></script>
<script src="LeapCameraControls.js"></script>
```

You create a `scene`, a `camera` and a `renderer` with Three.js.
Then connect your `camera` of your `scene` with leap camera controls by setting

```javascript
cameraControls = new THREE.LeapCameraControls(camera);
```

In your `Leap.loop` you need to call the `update` method on `frame`. After that it is necessary to `render`
again.

```javascript
Leap.loop(function(frame){
  // maybe some modifications to your scene
  // ...

  cameraControls.update(frame); // rotating, zooming & panning
  renderer.render(scene, camera);
});
```

In order to `rotate`, `scale` and `pan` an arbitrary object in your scene, load the leap object controls

```html
<script src="LeapObjectControls.js"></script>
```
and then connect the `camera` and your object, e.g. a `cube` by

```javascript
cubeControls = new THREE.LeapObjectControls(camera, cube);
```

The corresponding `Leap.loop` looks like

```javascript
Leap.loop(function(frame){
  // maybe some modifications to your scene
  // ...

  cubeControls.update(frame); // rotating, scaling & panning
  renderer.render(scene, camera);
});
```
**Note**: Rotating objects with `LeapObjectControls` is work in progress and not yet finished!

### Configuration

There are several options for your camera actions `rotate`, `zoom` and `pan`  available.
Here, we are setting the `pan` options (you can set the same attributes for rotating and panning):

```javascript
controls.panEnabled      = true;
controls.panSpeed        = 1.0;
controls.panHands        = 2;
controls.panFingers      = [6, 12];
controls.panRightHanded  = true; // right-handed
controls.panHandPosition = true; // palm position used
controls.panStabilized   = true; // stabilized palm position used
```

You can disable panning by setting `panEnabled` to `false`. Increase or decrease the speed of panning by adjusting
`panSpeed`. You can set the number of hands with option `panHands`, i.e. the gesture is only triggered if the number of hands over your leap is equal to 
the specified `panHands`. It is possible to use a range of numbers (array of length 2 with integers), e.g. if `[1, 2]` is given, panning will be done, if one or two hands
are used. The same goes for `panFingers`. If you set `panHands` to 2, then you can specify via `panRightHanded`, which hand will be used for controlling the camera. If you set `panFingers` to 1 or `[1, 1]` and `panHandPosition` to `false`, then the position of your finger tip will be used (instead of the position of your palm). If you set `panStabilized` to true the stabilized palm or finger tip position is used.

By default vertical rotating is bounded to a range of π, meaning the angle between the camera-to-target vector and the y-axis is greater than 0 and less than π. You can modify the range by setting `rotateMin` and `rotateMax`. Horizontal rotating is not limited.

You can set the minimum and maximum distances for zooming with `zoomMin` and `zoomMax`.

The default values are

```javascript
// rotation
this.rotateEnabled       = true;
this.rotateSpeed         = 1.0;
this.rotateHands         = 1;
this.rotateFingers       = [2, 3]; 
this.rotateRightHanded   = true;
this.rotateHandPosition  = true;
this.rotateStabilized    = false;
this.rotateMin           = 0;
this.rotateMax           = Math.PI;

// zoom
this.zoomEnabled         = true;
this.zoomSpeed           = 1.0;
this.zoomHands           = 1;
this.zoomFingers         = [4, 5];
this.zoomRightHanded     = true;
this.zoomHandPosition    = true;
this.zoomStabilized      = false;
this.zoomMin             = _this.camera.near;
this.zoomMax             = _this.camera.far;

// pan
this.panEnabled          = true;
this.panSpeed            = 1.0;
this.panHands            = 2;
this.panFingers          = [6, 12];
this.panRightHanded      = true;
this.panHandPosition     = true;
this.panStabilized       = false;
```

In your leap object controls the zoom options are scale options, i.e. `zoomEnabled` will be `scaleEnabled`, etc..