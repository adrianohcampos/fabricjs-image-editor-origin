/**
 * Define util functions
 */

(function () {
  'use strict';

  function utils() {

    // this.applyZoom = (zoom) => {
    //   this.canvas.setZoom(zoom)
    //   this.canvas.setWidth(this.canvas.originalW * this.canvas.getZoom())
    //   this.canvas.setHeight(this.canvas.originalH * this.canvas.getZoom())
    //   this.inputZoomLevel(zoom)
    // }


    /**
   * Get fabric js gradient from colorstops, orientation and angle
   * @param {Array} handlers array of color stops
   * @param {Number} width gradient width
   * @param {Number} height gradient height
   * @param {String} orientation orientation type linear/radial
   * @param {Number} angle the angle of linear gradient
   */
    this.generateFabricGradientFromColorStops = (handlers, width, height, orientation, angle) => {
      const gradAngleToCoords = (angle) => {
        let anglePI = (-parseInt(angle, 10)) * (Math.PI / 180)
        let angleCoords = {
          'x1': (Math.round(50 + Math.sin(anglePI) * 50)) / 100,
          'y1': (Math.round(50 + Math.cos(anglePI) * 50)) / 100,
          'x2': (Math.round(50 + Math.sin(anglePI + Math.PI) * 50)) / 100,
          'y2': (Math.round(50 + Math.cos(anglePI + Math.PI) * 50)) / 100,
        }

        return angleCoords
      }

      let bgGradient = {};
      let colorStops = [];

      for (var i in handlers) {
        colorStops.push({
          id: i,
          color: handlers[i].color,
          offset: handlers[i].position / 100,
        })
      }

      if (orientation === 'linear') {
        let angleCoords = gradAngleToCoords(angle)
        bgGradient = new fabric.Gradient({
          type: 'linear',
          coords: {
            x1: angleCoords.x1 * width,
            y1: angleCoords.y1 * height,
            x2: angleCoords.x2 * width,
            y2: angleCoords.y2 * height
          },
          colorStops,
        })
      } else if (orientation === 'radial') {
        bgGradient = new fabric.Gradient({
          type: 'radial',
          coords: {
            x1: width / 2,
            y1: height / 2,
            r1: 0,
            x2: width / 2,
            y2: height / 2,
            r2: width / 2
          },
          colorStops: colorStops
        });
      }

      return bgGradient
    }

    this.getRealBBox = async (obj) => {

      let tempCanv, ctx, w, h;

      // we need to use a temp canvas to get imagedata
      const getImageData = (dataUrl) => {
        if (tempCanv == null) {
          tempCanv = document.createElement('canvas');
          tempCanv.style.border = '1px solid blue';
          tempCanv.style.position = 'absolute';
          tempCanv.style.top = '-100%';
          tempCanv.style.visibility = 'hidden';
          ctx = tempCanv.getContext('2d');
          document.body.appendChild(tempCanv);
        }

        return new Promise(function (resolve, reject) {
          if (dataUrl == null) return reject();

          var image = new Image();
          image.addEventListener('load', () => {
            w = image.width;
            h = image.height;
            tempCanv.width = w;
            tempCanv.height = h;
            ctx.drawImage(image, 0, 0, w, h);
            var imageData = ctx.getImageData(0, 0, w, h).data.buffer;
            resolve(imageData, false);
          });
          image.src = dataUrl;
        });
      }


      // analyze pixels 1-by-1
      const scanPixels = (imageData) => {
        var data = new Uint32Array(imageData),
          x, y, y1, y2, x1 = w,
          x2 = 0;

        // y1
        for (y = 0; y < h; y++) {
          for (x = 0; x < w; x++) {
            if (data[y * w + x] & 0xff000000) {
              y1 = y;
              y = h;
              break;
            }
          }
        }

        // y2
        for (y = h - 1; y > y1; y--) {
          for (x = 0; x < w; x++) {
            if (data[y * w + x] & 0xff000000) {
              y2 = y;
              y = 0;
              break;
            }
          }
        }

        // x1
        for (y = y1; y < y2; y++) {
          for (x = 0; x < w; x++) {
            if (x < x1 && data[y * w + x] & 0xff000000) {
              x1 = x;
              break;
            }
          }
        }

        // x2
        for (y = y1; y < y2; y++) {
          for (x = w - 1; x > x1; x--) {
            if (x > x2 && data[y * w + x] & 0xff000000) {
              x2 = x;
              break;
            }
          }
        }

        return {
          x1: x1,
          x2: x2,
          y1: y1,
          y2: y2,
          width: x2 - x1,
          height: y2 - y1
        }
      }

      let data = await getImageData(obj.toDataURL());

      return scanPixels(data);

    }

    /**
     * Align objects on canvas according to the pos
     * @param {Object} canvas fabric js canvas
     * @param {Array} activeSelection the array of fabric js objects
     * @param {String} pos the position to align left/center-h/right/top/center-v/bottom
     */
    this.alignObject = (canvas, activeSelection, pos) => {
      switch (pos) {
        case 'left':

          (async () => {
            let bound = activeSelection.getBoundingRect()
            let realBound = await this.getRealBBox(activeSelection)
            activeSelection.set('left', (activeSelection.left - bound.left - realBound.x1))
            activeSelection.setCoords()
            canvas.renderAll()
            canvas.fire('object:modified')
          })()

          break

        case 'center-h':

          (async () => {
            let bound = activeSelection.getBoundingRect()
            let realBound = await this.getRealBBox(activeSelection)
            activeSelection.set(
              'left',
              (activeSelection.left - bound.left - realBound.x1) + (canvas.width / 2) - (realBound.width / 2)
            )
            activeSelection.setCoords()
            canvas.renderAll()
            canvas.fire('object:modified')
          })()

          break

        case 'right':

          (async () => {
            let bound = activeSelection.getBoundingRect()
            let realBound = await this.getRealBBox(activeSelection)
            activeSelection.set('left', (activeSelection.left - bound.left - realBound.x1) + canvas.width - realBound.width)
            activeSelection.setCoords()
            canvas.renderAll()
            canvas.fire('object:modified')
          })()

          break

        case 'top':

          (async () => {
            let bound = activeSelection.getBoundingRect()
            let realBound = await this.getRealBBox(activeSelection)
            activeSelection.set('top', (activeSelection.top - bound.top - realBound.y1))
            activeSelection.setCoords()
            canvas.renderAll()
            canvas.fire('object:modified')
          })()

          break

        case 'center-v':

          (async () => {
            let bound = activeSelection.getBoundingRect()
            let realBound = await this.getRealBBox(activeSelection)
            activeSelection.set(
              'top',
              (activeSelection.top - bound.top - realBound.y1) + (canvas.height / 2) - (realBound.height / 2)
            )
            activeSelection.setCoords()
            canvas.renderAll()
            canvas.fire('object:modified')
          })()

          break

        case 'bottom':

          (async () => {
            let bound = activeSelection.getBoundingRect()
            let realBound = await this.getRealBBox(activeSelection)
            activeSelection.set(
              'top',
              (activeSelection.top - bound.top - realBound.y1) + (canvas.height - realBound.height)
            )
            activeSelection.setCoords()
            canvas.renderAll()
            canvas.fire('object:modified')
          })()

          break

        default:
          break
      }
    }

    /**
     * Get the filters of current image selection
     * @param {Object} activeSelection fabric js object
     */
    this.getCurrentEffect = (activeSelection) => {
      let updatedEffects = {
        opacity: 100,
        blur: 0,
        brightness: 50,
        saturation: 50,
        gamma: {
          r: 45,
          g: 45,
          b: 45
        }
      }

      updatedEffects.opacity = activeSelection.opacity * 100

      let hasBlur = activeSelection.filters.find(x => x.blur)
      if (hasBlur) {
        updatedEffects.blur = hasBlur.blur * 100
      }

      let hasBrightness = activeSelection.filters.find(x => x.brightness)
      if (hasBrightness) {
        updatedEffects.brightness = ((hasBrightness.brightness + 1) / 2) * 100
      }

      let hasSaturation = activeSelection.filters.find(x => x.saturation)
      if (hasSaturation) {
        updatedEffects.saturation = ((hasSaturation.saturation + 1) / 2) * 100
      }

      let hasGamma = activeSelection.filters.find(x => x.gamma)
      if (hasGamma) {
        updatedEffects.gamma.r = Math.round(hasGamma.gamma[0] / 0.022)
        updatedEffects.gamma.g = Math.round(hasGamma.gamma[1] / 0.022)
        updatedEffects.gamma.b = Math.round(hasGamma.gamma[2] / 0.022)
      }

      return updatedEffects;
    }

    this.getUpdatedFilter = (effects, effect, value) => {
      let updatedEffects = {
        ...effects
      }
      switch (effect) {
        case 'gamma.r':
          updatedEffects.gamma.r = value
          break
        case 'gamma.g':
          updatedEffects.gamma.g = value
          break
        case 'gamma.b':
          updatedEffects.gamma.b = value
          break

        default:
          updatedEffects[effect] = value
          break
      }

      effects = updatedEffects;

      // rebuild filter array, calc values for fabric
      // blur 0-1 (def val 0), brightness, saturation -1-1 (def val: 0), gamma 0-2.2 (def val: 1)
      let updatedFilters = []

      if (effects.blur > 0) {
        updatedFilters.push(new fabric.Image.filters.Blur({
          blur: effects.blur / 100
        }));
      }

      if (effects.brightness !== 50) {
        updatedFilters.push(new fabric.Image.filters.Brightness({
          brightness: ((effects.brightness / 100) * 2) - 1
        }));
      }

      if (effects.saturation !== 50) {
        updatedFilters.push(new fabric.Image.filters.Saturation({
          saturation: ((effects.saturation / 100) * 2) - 1
        }));
      }

      if (
        effects.gamma.r !== 45 ||
        effects.gamma.g !== 45 ||
        effects.gamma.b !== 45
      ) {
        updatedFilters.push(new fabric.Image.filters.Gamma({
          gamma: [
            Math.round((effects.gamma.r * 0.022) * 10) / 10,
            Math.round((effects.gamma.g * 0.022) * 10) / 10,
            Math.round((effects.gamma.b * 0.022) * 10) / 10
          ]
        }));
      }

      return updatedFilters;
    }

    this.getActiveFontStyle = (activeSelection, styleName) => {
      if (activeSelection.getSelectionStyles && activeSelection.isEditing) {
        let styles = activeSelection.getSelectionStyles()
        if (styles.find(o => o[styleName] === '')) {
          return ''
        }

        return styles[0][styleName]
      }

      return activeSelection[styleName] || ''
    }


    this.setActiveFontStyle = (activeSelection, styleName, value) => {
      if (activeSelection.setSelectionStyles && activeSelection.isEditing) {
        let style = {}
        style[styleName] = value;
        activeSelection.setSelectionStyles(style)
        activeSelection.setCoords()
      } else {
        activeSelection.set(styleName, value)
      }
    }

    this.downloadImage = (data, extension = 'png', mimeType = 'image/png') => {
      const imageData = data.toString().replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
      const byteCharacters = atob(imageData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i += 1) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const file = new Blob([byteArray], {
        type: mimeType + ';base64'
      });
      const fileURL = window.URL.createObjectURL(file);

      // IE doesn't allow using a blob object directly as link href
      // instead it is necessary to use msSaveOrOpenBlob
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(file);
        return;
      }
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = 'image.' + extension;
      link.dispatchEvent(new MouseEvent('click'));
      setTimeout(() => {
        // for Firefox it is necessary to delay revoking the ObjectURL
        window.URL.revokeObjectURL(fileURL);
      }, 60);
    }


    this.downloadSVG = (SVGmarkup) => {
      const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(SVGmarkup);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'image.svg';
      link.dispatchEvent(new MouseEvent('click'));
      setTimeout(() => {
        // for Firefox it is necessary to delay revoking the ObjectURL
        window.URL.revokeObjectURL(url);
      }, 60);
    }

    this.downloadJSON = (json) => {
      var jsonStr = JSON.stringify(json);
      var link = document.createElement('a');
      link.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonStr);
      link.download = 'canvas.json';
      link.click();
    }

    this.addImageFromUrl = (imgUrl) => {
      const _self = this;

      // Crie um novo elemento de imagem
      const imgElement = new Image();
      imgElement.crossOrigin = 'anonymous'; // Definindo CORS
      imgElement.src = imgUrl;

      imgElement.onload = function () {
        fabric.Image.fromURL(imgUrl, (img) => {
          const maxHeight = _self.canvas.originalH * 0.9;
          const maxWidth = _self.canvas.originalW * 0.9;

          const originalHeight = img.height;
          const originalWidth = img.width;

          // Resize only if image exceeds maximum dimensions
          if (originalHeight >= maxHeight || originalWidth >= maxWidth) {
            if (originalHeight >= originalWidth) {
              img.scaleToHeight(maxHeight);
            } else {
              img.scaleToWidth(maxWidth);
            }
          }

          const canvasCenterX = _self.canvas.originalW / 2;
          const canvasCenterY = _self.canvas.originalH / 2;

          img.set({
            left: canvasCenterX - (img.getScaledWidth() / 2),
            top: canvasCenterY - (img.getScaledHeight() / 2),
          });

          _self.canvas.add(img);
          _self.canvas.setActiveObject(img);
          _self.canvas.renderAll();
          _self.canvas.fire('object:modified');

          $(`${_self.containerSelector} #toolbar button`).removeClass('active');
        }, {
          crossOrigin: 'anonymous'
        });
      };

      imgElement.onerror = function () {
        console.error("Error loading image. Check that the URL is correct and that the image allows CORS.");
      };
    };

    this.setCanvasStatus = (savedCanvas) => {
      const _self = this;
      if (savedCanvas) {
        _self.canvas.loadFromJSON(savedCanvas, _self.canvas.renderAll.bind(_self.canvas));
      }
    }

    this.animateObject = (object) => {
      const fabricCanvas = this.canvas;

      if (object.animation) {

        const easingFunction = fabric.util.ease?.[object.animation.easing] || fabric.util.ease.linear || ((t) => t); // Fallback seguro

        let origem = object.left;
        let neworigem = origem + 100;

        // Animação de 'opacity' (fade in)
        object.set({ opacity: 1, left: neworigem });
        // object.animate("opacity", 1, {
        //     duration: 800,
        //     onChange: fabricCanvas.renderAll.bind(fabricCanvas),
        //     easing: easingFunction,
        // });

        // Animação de 'left' (deslizamento)
        object.animate("left", object.animation.to, {
          duration: 800,
          onChange: fabricCanvas.renderAll.bind(fabricCanvas),
          easing: easingFunction,
          onComplete: function () {
            console.log("Animação concluída!");
          },
        });
      }
    }

    this.clearGuidesline = (canvas) => {
      const objects = canvas.getObjects();
      objects.forEach(obj => {
        if (
          (obj.id && obj.id.startsWith('vertical-')) ||
          (obj.id && obj.id.startsWith('horizontal-'))
        ) {
          canvas.remove(obj);
        }
      });
      canvas.renderAll();
    }


    this.guidelines = [];

    this.setGuidelines = (canvas) => {      
      this.guidelines.forEach(line => {
        canvas.add(line);
      });
    }

    this.handleObjectMoving = (canvas, obj) => {
      const snappingDistance = 10;
      const zoom = canvas.getZoom();

      const canvasWidth = canvas.width / zoom;
      const canvasHeight = canvas.height / zoom;

      const left = obj.left - (obj.width * obj.scaleX) / 2;
      const top = obj.top - (obj.height * obj.scaleY) / 2;
      const right = left + (obj.width * obj.scaleX);
      const bottom = top + (obj.height * obj.scaleY);

      const centerX = obj.left;
      const centerY = obj.top;

      let newGuidelines = [];

      this.clearGuidesline(canvas);

      let snapped = false;      

      if (Math.abs(left) < snappingDistance) {
        obj.set({ left: (obj.width * obj.scaleX) / 2, });

        if (!this.guidelineExists(canvas, "vertical-left")) {
          const line = this.createVerticalGuideline(canvas, 0, "vertical-left");
          newGuidelines.push(line);
          canvas.add(line);
        }
        snapped = true;
      }

      if (Math.abs(top) < snappingDistance) {
        obj.set({ top: (obj.height * obj.scaleY) / 2 });
        if (!this.guidelineExists(canvas, "horizontal-top")) {
          const line = this.createHorizontalGuideline(canvas, 0, "horizontal-top");
          newGuidelines.push(line);
          canvas.add(line);
        }
        snapped = true;
      }

      if (Math.abs(right - canvasWidth) < snappingDistance) {
        obj.set({ left: canvasWidth - (obj.width * obj.scaleX) / 2 });
        if (!this.guidelineExists(canvas, "vertical-right")) {
          const line = this.createVerticalGuideline(canvas, canvasWidth - 1, "vertical-right");
          newGuidelines.push(line);
          canvas.add(line);
        }
        snapped = true;
      }

      if (Math.abs(bottom - canvasHeight) < snappingDistance) {
        obj.set({ top: canvasHeight - (obj.height * obj.scaleY) / 2 });
        if (!this.guidelineExists(canvas, "horizontal-bottom")) {
          const line = this.createHorizontalGuideline(canvas, canvasHeight, "horizontal-bottom");
          newGuidelines.push(line);
          canvas.add(line);
        }
        snapped = true;
      }

      if (Math.abs(centerX - canvasWidth / 2) < snappingDistance) {
        obj.set({ left: canvasWidth / 2 });
        if (!this.guidelineExists(canvas, "vertical-center")) {
          const line = this.createVerticalGuideline(
            canvas,
            canvasWidth / 2,
            "vertical-center"
          );
          newGuidelines.push(line);
          canvas.add(line);
        }
        snapped = true;
      }

      if (Math.abs(centerY - canvasHeight / 2) < snappingDistance) {
        obj.set({ top: canvasHeight / 2 });
        if (!this.guidelineExists(canvas, "horizontal-center")) {
          const line = this.createHorizontalGuideline(
            canvas,
            canvasHeight / 2,
            "horizontal-center"
          );
          newGuidelines.push(line);
          canvas.add(line);
        }
        snapped = true;
      }


      if (!snapped) {
        this.clearGuidesline(canvas);
      } else {
        this.setGuidelines(newGuidelines);
      }

      canvas.renderAll();
    };


    this.createVerticalGuideline = (canvas, x, id) => {
      const line = new fabric.Line([x, 0, x, canvas.height], {
        stroke: 'red',
        strokeWidth: 1,
        selectable: false,
        evented: false,
        name: id,
        id: id,
        opacity: 0.8,
        strokeDashArray: [5, 5],
      });
      return line;
    }

    this.createHorizontalGuideline = (canvas, y, id) => {
      const line = new fabric.Line([0, y, canvas.width, y], {
        stroke: 'red',
        strokeWidth: 1,
        selectable: false,
        evented: false,
        name: id,
        id: id,
        opacity: 0.8,
        strokeDashArray: [5, 5],
      });
      return line;
    }

    this.guidelineExists = (canvas, id) => {
      const objects = canvas.getObjects();
      return objects.some(obj => obj.name === id || obj.id === id);
    }

    this.onObjectMoving = (canvas,obj) => {
      
    }

  }
  window.ImageEditor.prototype.initializeUtilsEvents = utils;
})();