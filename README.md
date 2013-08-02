threeleapcontrols
=================

## Introduction

[Three.js](http://threejs.org) provides several control classes in order to interact with your 3D world.
They are located under `three.js/examples/js/controls` in your Three.js directory.
With **threeleapcontrols** you can use your leap motion controller to rotate, zoom and pan 
your 3D scene.

## Requirements 

- a [leap motion](http://leapmotion.com) controller
- [leapjs](http://js.leapmotion.com) (javascript sdk for leap motion controller)
- [Three.js](http://threejs.org) (javascript library for creating and displaying 3D computer graphics on a browser)
- a browser which supports WebGL, e.g. Google Chrome


## Usage

First, you load the necessary javascript files in your HTML document
```html
<script src="three.min.js"></script>
<script src="leap.min.js"></script>
<script src="LeapControls.js"></script>
```

You create a `scene`, a `camera` and a `renderer` with Three.js.
Then connect your `camera` of your `scene` with leap controls by setting

```javascript
controls = new THREE.LeapControls(camera);
```

In your `Leap.loop` you need to call the `update` method on `frame`. After that it is necessary to `render`
again.

```javascript
Leap.loop(function(frame){
  // maybe some modifications to your scene
  // ...

  controls.update(frame); // rotating, zooming & panning
  renderer.render(scene, camera);
});
```

### Configuration

For actions `rotate`, `zoom` and `pan` there are several options which you can specify.
Here, we are setting the `pan` options (you can set the same attributes for rotating and panning):

```javascript
controls.panEnabled     = true;
controls.panSpeed       = 1.0;
controls.panHands       = 2;
controls.panFingers     = [6, 12];
controls.panRightHanded = false;
```

You can disable panning by setting `panEnabled` to `false`. Increase or decrease the speed of panning by adjusting
`panSpeed`. You can set the number of hands with option `panHands`, i.e. the gesture is only triggered if the number of hands over your leap is equal to 
the specified `panHands`. It is possible to use a range (array of length 2), e.g. if `[1, 2]` is given, panning will be done, if one or two hands
are used. The same goes for `panFingers`. If you set `panHands` to 2, then you can specify via `panRightHanded`, which hand will be used for controlling the camera. 

By default vertical rotating is bounded to a range of π, meaning the angle between the camera-to-target vector and the y-axis is greater than 0 and less than π. You can modify the range by setting `rotateMin` and `rotateMax`. Horizontal rotating is not limited.

You can set the minimum and maximum distances for zooming with `zoomMin` and `zoomMax`.

The default values are

```javascript
// rotation
this.rotateEnabled     = true;
this.rotateSpeed       = 1.0;
this.rotateHands       = 1;
this.rotateFingers     = [2, 3]; 
this.rotateRightHanded = true;
this.rotateMin         = 0;
this.rotateMax         = Math.PI;

// zoom
this.zoomEnabled       = true;
this.zoomSpeed         = 1.0;
this.zoomHands         = 1;
this.zoomFingers       = [4, 5];
this.zoomRightHanded   = true;
this.zoomMin           = camera.near;
this.zoomMax           = camera.far;

// pan
this.panEnabled        = true;
this.panSpeed          = 1.0;
this.panHands          = 2;
this.panFingers        = [6, 12];
this.panRightHanded    = true;
```

**Note:** The location of your palm position will be used for all control actions.

### Example

Check out the example `example.html`.