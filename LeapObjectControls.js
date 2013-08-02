/*
 * @author Torsten Sprenger / http://torstensprenger.com
 *
 * Leap Object Controls (http://leapmotion.com)
 * 
 */

THREE.LeapObjectControls = function(object, camera) {
  var _this = this;

  this.object = object;
  this.camera = camera;

  // api
  this.enabled = true;
  this.step    = (camera.position.z == 0 ? Math.pow(10, (Math.log(camera.near) + Math.log(camera.far)) / Math.log(10)) / 10.0 : camera.position.z);

  // `...Hands`       : integer or range given as an array of length 2
  // `...Fingers`     : integer or range given as an array of length 2
  // `...RightHanded` : boolean indicating whether to use left or right hand for controlling (if number of hands > 1)

  // rotation
  this.rotateEnabled     = true;
  this.rotateSpeed       = 4.0;
  this.rotateHands       = 1;
  this.rotateFingers     = [2, 3]; 
  this.rotateRightHanded = true;
  this.rotateMin         = 0;
  this.rotateMax         = Math.PI;
  
  // scale
  this.scaleEnabled      = true;
  this.scaleSpeed        = 1.0;
  this.scaleHands        = 1;
  this.scaleFingers      = [4, 5];
  this.scaleRightHanded  = true;
  this.scaleMin          = 0.1;
  this.scaleMax          = 5;
  
  // pan
  this.panEnabled        = true;
  this.panSpeed          = 1.0;
  this.panHands          = 2;
  this.panFingers        = [6, 12];
  this.panRightHanded    = true;
  
  // internals
  var _rotateXLast       = null;
  var _rotateYLast       = null;
  var _scaleZLast        = null;
  var _panXLast          = null;
  var _panYLast          = null;
  var _panZLast          = null;

  // helpers
  this.rotateTransform = function(delta) {
    return _this.rotateSpeed * THREE.Math.mapLinear(delta, -400, 400, -Math.PI, Math.PI);
  };

  this.scaleTransform = function(delta) {
    return _this.scaleSpeed * THREE.Math.mapLinear(delta, -400, 400, -2, 2);
  };

  this.panTransform = function(delta) {
    return _this.panSpeed * THREE.Math.mapLinear(delta, -400, 400, -_this.step, _this.step);
  };

  this.applyGesture = function(frame, action) {
    var hl = frame.hands.length;
    var fl = frame.pointables.length;

    switch(action) {
      case 'rotate':
        if (_this.rotateHands instanceof Array) {
          if (_this.rotateFingers instanceof Array) {
            if (_this.rotateHands[0] <= hl && hl <= _this.rotateHands[1] && _this.rotateFingers[0] <= fl && fl <= _this.rotateFingers[1]) return true;
          } else {
            if (_this.rotateHands[0] <= hl && hl <= _this.rotateHands[1] && _this.rotateFingers == fl) return true;
          };
        } else {
          if (_this.rotateFingers instanceof Array) {
            if (_this.rotateHands == hl && _this.rotateFingers[0] <= fl && fl <= _this.rotateFingers[1]) return true;
          } else {
            if (_this.rotateHands == hl && _this.rotateFingers == fl) return true;
          };
        };
        break;
      case 'scale':
        if (_this.scaleHands instanceof Array) {
          if (_this.scaleFingers instanceof Array) {
            if (_this.scaleHands[0] <= hl && hl <= _this.scaleHands[1] && _this.scaleFingers[0] <= fl && fl <= _this.scaleFingers[1]) return true;
          } else {
            if (_this.scaleHands[0] <= hl && hl <= _this.scaleHands[1] && _this.scaleFingers == fl) return true;
          };
        } else {
          if (_this.scaleFingers instanceof Array) {
            if (_this.scaleHands == hl && _this.scaleFingers[0] <= fl && fl <= _this.scaleFingers[1]) return true;
          } else {
            if (_this.scaleHands == hl && _this.scaleFingers == fl) return true;
          };
        };
        break;
      case 'pan':
        if (_this.panHands instanceof Array) {
          if (_this.panFingers instanceof Array) {
            if (_this.panHands[0] <= hl && hl <= _this.panHands[1] && _this.panFingers[0] <= fl && fl <= _this.panFingers[1]) return true;
          } else {
            if (_this.panHands[0] <= hl && hl <= _this.panHands[1] && _this.panFingers == fl) return true;
          };
        } else {
          if (_this.panFingers instanceof Array) {
            if (_this.panHands == hl && _this.panFingers[0] <= fl && fl <= _this.panFingers[1]) return true;
          } else {
            if (_this.panHands == hl && _this.panFingers == fl) return true;
          };
        };
        break;
    };

    return false;
  };

  this.hand = function(frame, action) {
    var hds = frame.hands;

    if (hds.length > 0) {
      if (hds.length == 1) {
        return hds[0];
      } else if (hds.length == 2) {
        var lh, rh;
        if (hds[0].palmPosition[0] < hds[1].palmPosition[0]) {
          lh = hds[0];
          rh = hds[1];
        } else {
          lh = hds[1];
          rh = hds[0];
        }
        switch(action) {
          case 'rotate':
            if (_this.rotateRightHanded) {
              return rh;
            } else {
              return lh;
            };
            break;
          case 'scale':
            if (_this.scaleRightHanded) {
              return rh;
            } else {
              return lh;
            };
            break;
          case 'pan':
            if (_this.panRightHanded) {
              return rh;
            } else {
              return lh;
            };
            break;
        };
      };
    };

    return false;
  };

  // methods
  this.rotateObject = function(frame) {
    if (_this.rotateEnabled && _this.applyGesture(frame, 'rotate')) {
      var h = _this.hand(frame, 'rotate');

      // rotate around axis in xy-plane (in target coordinate system) which is orthogonal to camera vector
      var y = h.palmPosition[1];
      if (!_rotateYLast) _rotateYLast = y;
      var yDelta = y - _rotateYLast;
      var t = new THREE.Vector3().subVectors(_this.camera.position, _this.object.position);
      angleDelta = _this.rotateTransform(yDelta);
      newAngle = t.angleTo(new THREE.Vector3(0, 1, 0)) + angleDelta;
      if (_this.rotateMin < newAngle && newAngle < _this.rotateMax) {
        // var n = new THREE.Vector3(1, _this.object.position.y, (-t.x - t.y*_this.object.position.y) / t.z).normalize();
        var n = new THREE.Vector3(t.z, 0, -t.x).normalize();
        // var quaternion = new THREE.Quaternion().setFromAxisAngle(n, angleDelta);
        // var rot = new THREE.Euler().setFromQuaternion(quaternion);

        // var matrixX = new THREE.Matrix4().makeRotationAxis(n, angleDelta);
        // var m = new THREE.Vector3(0, 1, 0).rotateOnAxis(n, angleDelta);
        // var m = new THREE.Vector3(0, 1, 0).applyMatrix4(matrixX);
        // console.log(m.rotation);
        // _this.object.rotation.add(m.rotation);
        // _this.object.applyEuler(m.rotation, m.eulerOrder);
        // _this.object.position.applyEuler(_this.camera.rotation, _this.camera.rotation.order);
        // var objPos = new THREE.Vector3().copy(_this.object.position);
        // _this.object.position.set(0, 0, 0);
        // rot = _this.object.rotation;
        // _this.object.translateX(-_this.object.position.x);
        // _this.object.translateY(-_this.object.position.y);
        // _this.object.translateZ(-_this.object.position.z);
        // _this.object.rotation.x = 0;
        // _this.object.rotation.y = 0;
        // _this.object.rotation.z = 0;
        // _this.object.rotateOnAxis(n, angleDelta);
        // _this.object.rotation.x += rot.x;
        // _this.object.rotation.y += rot.y;
        // _this.object.rotation.z += rot.z;
        // _this.object.applyMatrix(matrixX);
        // _this.object.translateX(objPos.x);
        // _this.object.translateY(objPos.y);
        // _this.object.translateZ(objPos.z);
        // _this.object.position = new THREE.Vector3(0, 0, 0).applyMatrix4(matrixX).add(_this.object.position); // translate, rotate and translate back        
      };

      // rotate around y-axis 
      var x = h.palmPosition[0];
      if (!_rotateXLast) _rotateXLast = x;
      var xDelta = x - _rotateXLast;
      _this.object.rotation.y += _this.rotateTransform(xDelta);
      
      _rotateYLast = y;
      _rotateXLast = x;
      _scaleZLast  = null;
      _panXLast    = null;
      _panYLast    = null;
      _panZLast    = null;      
    } else {
      _rotateYLast = null;
      _rotateXLast = null;      
    };
  };

  this.scaleObject = function(frame) {
    if (_this.scaleEnabled && _this.applyGesture(frame, 'scale')) {
      var h = _this.hand(frame, 'scale');
      var z = h.palmPosition[2];
      if (!_scaleZLast) _scaleZLast = z;
      var zDelta = z - _scaleZLast;
      scaleDelta = _this.scaleTransform(zDelta);
      var newScale = _this.object.scale.x + scaleDelta;
      if (_this.scaleMin < newScale && newScale < _this.scaleMax) {
        _this.object.scale = new THREE.Vector3(newScale, newScale, newScale);
      };

      _scaleZLast  = z; 
      _rotateXLast = null;
      _rotateYLast = null;
      _panXLast    = null;
      _panYLast    = null;
      _panZLast    = null;
    } else {
      _scaleZLast  = null; 
    };
  };

  this.panObject = function(frame) {
    if (_this.panEnabled && _this.applyGesture(frame, 'pan')) {
      var h = _this.hand(frame, 'pan');
      var x = h.palmPosition[0];
      var y = h.palmPosition[1];
      var z = h.palmPosition[2];
      if (!_panXLast) _panXLast = x;
      if (!_panYLast) _panYLast = y;
      if (!_panZLast) _panZLast = z;
      var xDelta = x - _panXLast;
      var yDelta = y - _panYLast;
      var zDelta = z - _panZLast;

      var v = _this.camera.localToWorld(new THREE.Vector3(_this.panTransform(xDelta), _this.panTransform(yDelta), _this.panTransform(zDelta)));
      v.sub(_this.camera.position);
      _this.object.position.add(v);

      _panXLast    = x;
      _panYLast    = y;
      _panZLast    = z;
      _rotateXLast = null;
      _rotateYLast = null;
      _scaleZLast  = null;
    } else {
      _panXLast = null;
      _panYLast = null;
      _panZLast = null;     
    };
  };

  this.update = function(frame) {
    if (_this.enabled) {
      _this.rotateObject(frame);
      _this.scaleObject(frame);
      _this.panObject(frame);
    };
  };
};