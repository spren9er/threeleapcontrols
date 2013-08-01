/*
 * @author Torsten Sprenger / http://torstensprenger.com
 *
 * Leap Motion Controls (http://leapmotion.com)
 * 
 */

THREE.LeapControls = function(object, domElement) {
	var _this = this;

	this.object = object;
	this.domElement = (domElement !== undefined) ? domElement : document;

	// api
	this.enabled = true;
	this.screen  = {left: 0, top: 0, width: 0, height: 0};
	this.target  = new THREE.Vector3(0, 0, 0);
	this.step 	 = (object.position.z == 0 ? Math.pow(10, (Math.log(object.near) + Math.log(object.far)) / Math.log(10)) / 10.0 : object.position.z);

	// `...Hands`       : integer or range given as an array of length 2
	// `...Fingers`     : integer or range given as an array of length 2
	// `...RightHanded`	: boolean indicating whether to use left or right hand for controlling (if number of hands > 1)

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
	
	// internals
	var _rotateXLast       = null;
	var _rotateYLast       = null;
	var _zoomZLast         = null;
	var _panXLast          = null;
	var _panYLast          = null;
	var _panZLast          = null;

	// helpers
	this.rotateTransform = function(delta) {
		return _this.rotateSpeed * THREE.Math.mapLinear(delta, -400, 400, -Math.PI, Math.PI);
	};

	this.zoomTransform = function(delta) {
		return _this.zoomSpeed * THREE.Math.mapLinear(delta, -400, 400, -_this.step, _this.step);
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
			case 'zoom':
				if (_this.zoomHands instanceof Array) {
					if (_this.zoomFingers instanceof Array) {
						if (_this.zoomHands[0] <= hl && hl <= _this.zoomHands[1] && _this.zoomFingers[0] <= fl && fl <= _this.zoomFingers[1]) return true;
					} else {
						if (_this.zoomHands[0] <= hl && hl <= _this.zoomHands[1] && _this.zoomFingers == fl) return true;
					};
				} else {
					if (_this.zoomFingers instanceof Array) {
						if (_this.zoomHands == hl && _this.zoomFingers[0] <= fl && fl <= _this.zoomFingers[1]) return true;
					} else {
						if (_this.zoomHands == hl && _this.zoomFingers == fl) return true;
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
					case 'zoom':
						if (_this.zoomRightHanded) {
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
	this.handleResize = function() {
		if (this.domElement === document) {
			this.screen.left   = 0;
			this.screen.top    = 0;
			this.screen.width  = window.innerWidth;
			this.screen.height = window.innerHeight;
		} else {
			this.screen = this.domElement.getBoundingClientRect();
		}
	};

	this.rotateCamera = function(frame) {
		if (_this.rotateEnabled && _this.applyGesture(frame, 'rotate')) {
			var h = _this.hand(frame, 'rotate');

			// rotate around axis in xy-plane which is orthogonal to camera vector
      var y = h.palmPosition[1];
      if (!_rotateYLast) _rotateYLast = y;
      var yDelta = y - _rotateYLast;
      var v = _this.object.position;
      var n = new THREE.Vector3(v.z, 0, -v.x).normalize();
      var matrixX = new THREE.Matrix4().makeRotationAxis(n, _this.rotateTransform(yDelta));
      _this.object.position.applyMatrix4(matrixX);

      // rotate around y-axis
      var x = h.palmPosition[0];
      if (!_rotateXLast) _rotateXLast = x;
      var xDelta = x - _rotateXLast;
      var matrixY = new THREE.Matrix4().makeRotationY(-_this.rotateTransform(xDelta));
      _this.object.position.applyMatrix4(matrixY);
      _this.object.lookAt(_this.target);
      
      _rotateYLast = y;
      _rotateXLast = x;
			_zoomZLast   = null;
			_panXLast    = null;
			_panYLast    = null;
			_panZLast    = null;			
		} else {
      _rotateYLast = null;
      _rotateXLast = null;			
		};
	};

	this.zoomCamera = function(frame) {
		if (_this.zoomEnabled && _this.applyGesture(frame, 'zoom')) {
			var h = _this.hand(frame, 'zoom');
      var z = h.palmPosition[2];
      if (!_zoomZLast) _zoomZLast = z;
      var zDelta = z - _zoomZLast;
      var factor = 1 + _this.zoomTransform(-zDelta)/_this.object.position.length();
      _this.object.position.multiplyScalar(factor);

      _zoomZLast   = z; 
			_rotateXLast = null;
			_rotateYLast = null;
			_panXLast    = null;
			_panYLast    = null;
			_panZLast    = null;
		} else {
      _zoomZLast = null; 
		};
	};

	this.panCamera = function(frame) {
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

      var v = _this.object.localToWorld(new THREE.Vector3(_this.panTransform(xDelta), _this.panTransform(yDelta), _this.panTransform(zDelta)));
      v.sub(_this.object.position);

      _this.object.position.x -= v.x;
      _this.object.position.y -= v.y;
      _this.object.position.z -= v.z;
      _this.target.x -= v.x;
      _this.target.y -= v.y;
      _this.target.z -= v.z;			

			_panXLast    = x;
			_panYLast    = y;
			_panZLast    = z;
			_rotateXLast = null;
			_rotateYLast = null;
			_zoomZLast   = null;
		} else {
			_panXLast = null;
			_panYLast = null;
			_panZLast = null;			
		};
	};

	this.update = function(frame) {
		if (_this.enabled) {
			_this.rotateCamera(frame);
			_this.zoomCamera(frame);
			_this.panCamera(frame);
		};
	};

	this.handleResize();
};

THREE.LeapControls.prototype = Object.create(THREE.EventDispatcher.prototype);