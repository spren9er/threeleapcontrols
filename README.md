threeleapcontrols
=================

## Introduction

[Three.js](http://threejs.org) provides several control classes in order to interact with your 3D world.
They are located under `three.js/examples/js/controls` in your Three.js directory.
With **threeleapcontrols** you can use your leap motion controller to rotate, zoom and pan 
your 3D scene.

## Requirements 

- a leap motion controller ([http://leapmotion.com](http://leapmotion.com))
- a browser which supports WebGL, e.g. Google Chrome

## Usage

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
are used. The same goes for `panFingers`. If you set `panHands` to 2, then you can specify via `panRightHanded`, which hand will be used for controlling
the camera. The default values are

```javascript
// rotation
this.rotateEnabled     = true;
this.rotateSpeed       = 1.0;
this.rotateHands       = 1;
this.rotateFingers     = [2, 3]; 
this.rotateRightHanded = true;

// zoom
this.zoomEnabled       = true;
this.zoomSpeed         = 1.0;
this.zoomHands         = 1;
this.zoomFingers       = [4, 5];
this.zoomRightHanded   = true;

// pan
this.panEnabled        = true;
this.panSpeed          = 1.0;
this.panHands          = 2;
this.panFingers        = [6, 12];
this.panRightHanded    = true;
```

**Note:** The location of your palm position will be used for controlling.


### Example

Check out the example `example.html`.