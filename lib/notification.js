/**
 * Define action to zoom in/out
 */
(function () {
  'use strict';

  var notification = function () {   

    try { 
      
      const container = document.querySelector(`${this.containerSelector} .main-panel`);

    const toastType = (color) => {
      switch (color) {
        case 'Danger':
          return "#eb3b5a"
          break;
        case 'Warning':
          return "#fdcb6e"
          break;
        case 'Success':
          return "#00b894"
          break;
        default:
          return "#00b894"
          break;
      }
    }

    class Toast {
      constructor(message, color, time) {
        this.message = message;
        this.color = color;
        this.time = time;
        this.element = null;
        var element = document.createElement('div');
        element.className = "toast-notification";
        this.element = element;
        var countElements = document.getElementsByClassName("toast-notification");

        element.style.opacity = 0.8;

        element.style.marginTop = (countElements.length * 55) + "px";

        element.style.backgroundColor = this.color;

        var message = document.createElement("div");
        message.className = "message-container";
        message.textContent = this.message;

        element.appendChild(message);

        var close = document.createElement("div");
        close.className = "close-notification";

        close.innerHTML ='<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>';

        element.append(close);

        container.appendChild(element);
        
        setTimeout(function () {
          element.remove();
        }, this.time);

        close.addEventListener("click", () => {
          element.remove();
        })
      }

    }
    
    this.toast = (message, color, time) => {
      time = time !== null && time !== undefined ? time : 5000;
      color = toastType(color);
      new Toast(message, color, time);
    }

  } catch (error) {
      console.error(error);
  }

  }

  window.ImageEditor.prototype.initializeNotification = notification;
})();