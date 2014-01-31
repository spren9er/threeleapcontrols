/*
 * @author Torsten Sprenger / http://torstensprenger.com
 *
 * Leap Object Controls (http://leapmotion.com)
 * 
 */

THREE.LeapObjectControls = function(camera, object) {
  var _this = this;

  this.camera = camera;
  this.object = object;

  // api
  this.enabled      = true;
  this.step         = (camera.position.z == 0 ? Math.pow(10, (Math.log(camera.near) + Math.log(camera.far))/Math.log(10))/10.0 : camera.position.z);
  this.fingerFactor = 2;  

  // `...Hands`       : integer or range given as an array of length 2
  // `...Fingers`     : integer or range given as an array of length 2
  // `...RightHanded` : boolean indicating whether to use left or right hand for controlling (if number of hands > 1)
  // `...HandPosition`: boolean indicating whether to use palm position or finger tip position (if number of fingers == 1)
  // `...Stabilized`  : boolean indicating whether to use stabilized palm/finger tip position or not

  // rotation
  this.rotateEnabled      = true;
  this.rotateSpeed        = 4.0;
  this.rotateHands        = 1;
  this.rotateFingers      = [2, 3]; 
  this.rotateRightHanded  = true;
  this.rotateHandPosition = true;
  this.rotateStabilized   = false;
  this.rotateMin          = 0;
  this.rotateMax          = Math.PI;
  
  // scale
  this.scaleEnabled       = true;
  this.scaleSpeed         = 1.0;
  this.scaleHands         = 1;
  this.scaleFingers       = [4, 5];
  this.scaleRightHanded   = true;
  this.scaleHandPosition  = true;
  this.scaleStabilized    = false;
  this.scaleMin           = 0.1;
  this.scaleMax           = 10;
  
  // pan
  this.panEnabled         = true;
  this.panSpeed           = 1.0;
  this.panHands           = 2;
  this.panFingers         = [6, 12];
  this.panRightHanded     = true;
  this.panHandPosition    = true;
  this.panStabilized      = false;
  
  // internals
  var _rotateXLast        = null;
  var _rotateYLast        = null;
  var _scaleZLast         = null;
  var _panXLast           = null;
  var _panYLast           = null;
  var _panZLast           = null;

  // helpers
  this.transformFactor = function(action) {
    switch(action) {
      case 'rotate':
        return _this.rotateSpeed * (_this.rotateHandPosition ? 1 : _this.fingerFactor);
      case 'scale':
        return _this.scaleSpeed * (_this.scaleHandPosition ? 1 : _this.fingerFactor);
      case 'pan':
        return _this.panSpeed * (_this.panHandPosition ? 1 : _this.fingerFactor);
    };
  };

  this.rotateTransform = function(delta) {
    return _this.transformFactor('rotate') * THREE.Math.mapLinear(delta, -400, 400, -Math.PI, Math.PI);
  };

  this.scaleTransform = function(delta) {
    return _this.transformFactor('scale') * THREE.Math.mapLinear(delta, -400, 400, -2, 2);
  };

  this.panTransform = function(delta) {
    return _this.transformFactor('pan') * THREE.Math.mapLinear(delta, -400, 400, -_this.step, _this.step);
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
          case 'scale':
            if (_this.scaleRightHanded) {
              return rh;
            } else {
              return lh;
            };
          case 'pan':
            if (_this.panRightHanded) {
              return rh;
            } else {
              return lh;
            };
        };
      };
    };

    return false;
  };

  this.position = function(frame, action) {
    // assertion: if `...HandPosition` is false, then `...Fingers` needs to be 1 or [1, 1]
    var h;
    switch(action) {
      case 'rotate':
        h = _this.hand(frame, 'rotate');
        return (_this.rotateHandPosition 
          ? (_this.rotateStabilized ? h.stabilizedPalmPosition : h.palmPosition) 
          : (_this.rotateStabilized ? frame.pointables[0].stabilizedTipPosition : frame.pointables[0].tipPosition)
        );
      case 'scale':
        h = _this.hand(frame, 'scale');
        return (_this.scaleHandPosition 
          ? (_this.scaleStabilized ? h.stabilizedPalmPosition : h.palmPosition) 
          : (_this.scaleStabilized ? frame.pointables[0].stabilizedTipPosition : frame.pointables[0].tipPosition)
        );
      case 'pan':
        h = _this.hand(frame, 'pan');
        return (_this.panHandPosition
          ? (_this.panStabilized ? h.stabilizedPalmPosition : h.palmPosition) 
          : (_this.panStabilized ? frame.pointables[0].stabilizedTipPosition : frame.pointables[0].tipPosition)
        );
    };
  };

  // methods
  this.rotateObject = function(frame) {
    if (_this.rotateEnabled && _this.applyGesture(frame, 'rotate')) {
      // rotate around axis in xy-plane which is orthogonal to camera vector
      var y = _this.position(frame, 'rotate')[1];
      if (!_rotateYLast) _rotateYLast = y;
      var yDelta = y - _rotateYLast;
      // TODO: apply correct rotation to object
      //
      // var t = new THREE.Vector3().subVectors(_this.camera.position, _this.object.position);
      // angleDelta = _this.rotateTransform(yDelta);
      // newAngle = t.angleTo(new THREE.Vector3(0, 1, 0)) + angleDelta;
      // if (_this.rotateMin < newAngle && newAngle < _this.rotateMax) {
      //   var n = new THREE.Vector3(t.z, 0, -t.x).normalize();
      //   var rotationMatrix = new THREE.Matrix4();
      //   rotationMatrix.makeRotationAxis(n, angleDelta);
      //   rotationMatrix.multiply(_this.object.matrix);
      //  _this.object.rotation.setFromRotationMatrix(rotationMatrix, _this.camera.rotation.order);
      // };

      // rotate around y-axis 
      var x = _this.position(frame, 'rotate')[0];
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
      var z = _this.position(frame, 'scale')[2];
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
      var x = _this.position(frame, 'pan')[0];
      var y = _this.position(frame, 'pan')[1];
      var z = _this.position(frame, 'pan')[2];
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