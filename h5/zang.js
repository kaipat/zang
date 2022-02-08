class Zang {
  _SCALE_TIME = 0.1;
  _SCALE_RANGE = [0.6, 0.9, 1.2];
  _rander_list = [];
  _scanning = false;
  constructor(options) {
    if (!options) throw new Error('Zang constructor expect 1 argument');
    this._loadImages(options.icons);
    var canvas = document.getElementById(options.canvas_id);
    this._ctx = canvas.getContext('2d');
    this._width = canvas.width;
    this._height = canvas.height;
  }
  _getRandom(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1))
  }
  _loadImages(icons) {
    var self = this;
    self._images = [];
    icons.forEach(function(src) {
      var img = new Image();
      img.onload = function() {
        self._images.push(img);
      }
      img.onerror = function() {};
      img.src = src;
      img.width = 80;
      img.height = 80;
    })
  }
  _createRender() {
    var self = this;
    var basic_scale = self._SCALE_RANGE[self._getRandom(0, 2)];
    var getScale = function(diffTime) {
        if (diffTime < self._SCALE_TIME) {
            return +((diffTime/ self._SCALE_TIME).toFixed(2)) * basic_scale;
        } else {
            return basic_scale;
        }
    };
    var context = self._ctx;
    var images = self._images;
    var image = images[self._getRandom(0, images.length - 1)];
    var basicX = self._width / 2 + self._getRandom(-20, 20);
    var angle = self._getRandom(2, 10);
    var ratio = self._getRandom(10, 30) * ((self._getRandom(0, 1) ? 1 : -1));
    var getTranslateX = function(diffTime) {
      if (diffTime < self._SCALE_TIME) {
          return basicX;
      } else {
          return basicX + ratio * Math.sin(angle * (diffTime - self._SCALE_TIME));
      }
    };
    var getTranslateY = function(diffTime) {
        return image.height / 2 + (self._height - image.height / 2) * (1 - diffTime);
    };
    var fadeOutStage = self._getRandom(14, 18) / 100;
    var getAlpha = function(diffTime) {
        let left = 1 - +diffTime;
        if (left > fadeOutStage) {
            return 1;
        } else {
            return 1 - +((fadeOutStage - left) / fadeOutStage).toFixed(2);
        }
    };
    return function(diffTime) {
        if(diffTime >= 1) return true;
        context.save();
        const scale = getScale(diffTime);
        const translateX = getTranslateX(diffTime);
        const translateY = getTranslateY(diffTime);
        context.translate(translateX, translateY);
        context.scale(scale, scale);
        context.globalAlpha = getAlpha(diffTime);
        context.drawImage(
            image,
            -image.width / 2,
            -image.height / 2,
            image.width,
            image.height
        );
        context.restore();
    };
  }
  _scan() {
    this._ctx.clearRect(0, 0, this._width, this._height);
    let index = 0;
    let length = this._rander_list.length;
    if (length > 0) {
        this._requestFrame(this._scan.bind(this));
        this._scanning = true;
    } else {
        this._scanning = false;
    }
    while (index < length) {
        var child = this._rander_list[index];
        if (!child || !child.render || child.render.call(null, (Date.now() - child.timestamp) / child.duration)) {
            this._rander_list.splice(index, 1);
            length--;
        } else {
            index++;
        }
    }
  }
  start() {
    if (!this._images.length) return;
    var render = this._createRender();
    var duration = this._getRandom(1500, 3000);
    this._rander_list.push({
        render,
        duration,
        timestamp: Date.now(),
    });
    if (!this._scanning) {
        this._scanning = true;
        this._requestFrame(this._scan.bind(this));
    }
    return this;
  }
  _requestFrame(cb) {
    return (
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      function(callback) {
        window.setTimeout(callback, 1000 / 60);
      }
    )(cb);
  }
}