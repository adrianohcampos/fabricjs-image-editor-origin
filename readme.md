# Fabric.JS Image Editor
This image editor allows users to draw default shapes, pen-drawing, line, curve + straight path, text, png/jpg/svg images on browser.

[Demo!](https://fabricjs-image-editor-origin.vercel.app)

![Positioning Example](screenshots/editor.jpg)

## Dependency
  * jQuery v3.5.1
  * jQuery spectrum-colorpicker2
  * Fabric.js v5.3.1
  * IconScout Unicons v4.0.8

## Initialize
```javascript
  // define toolbar buttons to show
  // if this value is undefined or its length is 0, default toolbar buttons will be shown
  const buttons = [
    'select',
    'shapes',
    // 'draw',
    // 'line',
    // 'path',
    // 'textbox',
    // 'upload',
    // 'background',
    'undo',
    'redo',
    'save',
    'download',
    'clear',
    'images'
    'fullscreen',
    'templates',
    'animation',
    'frames',
    'rect',
    'ellipse',
    'triangle'
  ];

  // define custom shapes
  // if this value is undefined or its length is 0, default shapes will be used
  const shapes = [
    `<svg viewBox="-10 -10 180 180" fill="none" stroke="none" stroke-linecap="square" stroke-miterlimit="10"><path stroke="#000000" stroke-width="8" stroke-linecap="butt" d="m0 0l25.742783 0l0 0l38.614174 0l90.09974 0l0 52.74803l0 0l0 22.6063l0 15.070862l-90.09974 0l-61.5304 52.813744l22.916225 -52.813744l-25.742783 0l0 -15.070862l0 -22.6063l0 0z" fill-rule="evenodd"></path></svg>`,
    `<svg viewBox="-10 -10 180 180" fill="none" stroke="none" stroke-linecap="square" stroke-miterlimit="10"><path stroke="#000000" stroke-width="8" stroke-linejoin="round" stroke-linecap="butt" d="m1.0425826 140.35696l25.78009 -49.87359l0 0c-30.142242 -17.309525 -35.62507 -47.05113 -12.666686 -68.71045c22.958385 -21.65932 66.84442 -28.147947 101.387596 -14.990329c34.543175 13.1576185 48.438576 41.655407 32.10183 65.83693c-16.336761 24.181526 -57.559166 36.132935 -95.233955 27.61071z" fill-rule="evenodd"></path></svg>`,
    `<svg viewBox="0 -5 100 100" x="0px" y="0px"><path fill="none" stroke="#000" stroke-width="8" d="M55.2785222,56.3408313 C51.3476874,61.3645942 45.2375557,64.5921788 38.3756345,64.5921788 C31.4568191,64.5921788 25.3023114,61.3108505 21.3754218,56.215501 C10.6371566,55.0276798 2.28426396,45.8997866 2.28426396,34.8156425 C2.28426396,27.0769445 6.35589452,20.2918241 12.4682429,16.4967409 C14.7287467,7.0339786 23.2203008,0 33.3502538,0 C38.667844,0 43.5339584,1.93827732 47.284264,5.14868458 C51.0345695,1.93827732 55.9006839,0 61.2182741,0 C73.0769771,0 82.6903553,9.6396345 82.6903553,21.5307263 C82.6903553,22.0787821 82.6699341,22.6220553 82.629813,23.1598225 C87.1459866,27.1069477 90,32.9175923 90,39.396648 C90,51.2877398 80.3866218,60.9273743 68.5279188,60.9273743 C63.5283115,60.9273743 58.9277995,59.2139774 55.2785222,56.3408313 L55.2785222,56.3408313 Z M4.79695431,82 C7.44623903,82 9.59390863,80.6668591 9.59390863,79.0223464 C9.59390863,77.3778337 7.44623903,76.0446927 4.79695431,76.0446927 C2.1476696,76.0446927 0,77.3778337 0,79.0223464 C0,80.6668591 2.1476696,82 4.79695431,82 Z M13.7055838,71.9217877 C18.4995275,71.9217877 22.3857868,69.4606044 22.3857868,66.424581 C22.3857868,63.3885576 18.4995275,60.9273743 13.7055838,60.9273743 C8.91163999,60.9273743 5.02538071,63.3885576 5.02538071,66.424581 C5.02538071,69.4606044 8.91163999,71.9217877 13.7055838,71.9217877 Z"></path></svg>`
  ];

  const images = [
    `screenshots/astronaut.png`,
  ];

  const templates = [];

  // define custom fonts
  const fonts = [
    {
      name: 'WorkSans',
      path: 'fonts/WorkSans/WorkSans-Regular.ttf',
      style: 'normal',
      weight: 'normal'
    }
  ];

  const options = {
    buttons: buttons,
    shapes: shapes,
    images: images,    
    dimensions: {
      width: 1360,
      height: 768
    },
    templates: templates,
    canvasSizeBlock: true,
    fonts: fonts,
    layers: true,
    fixedCanvas: true // By default, the canvas is dynamic
  };  

  var imgEditor = new ImageEditor('#image-editor-container', options);
```

## Save/Load Editor status

```javascript
  let status = imgEditor.getCanvasJSON();
  imgEditor.setCanvasStatus(status);
```

## Rulers and Guides

This functionality allows adding rulers and guidelines to assist in object alignment, similar to the "Show ruler and guides (Shift+R)" function from Canva.com.

### How to use:

1. **Enable/Disable Rulers**: 
   - Click the ruler button in the toolbar
   - Or use the keyboard shortcut `Shift+R`

2. **Create Guides**:
   - Click and drag from the horizontal ruler to create a horizontal guide
   - Click and drag from the vertical ruler to create a vertical guide

3. **Move Guides**:
   - Select a guide and drag it to reposition
   - Horizontal guides can only be moved vertically
   - Vertical guides can only be moved horizontally

4. **Delete Guides**:
   - Double-click on a guide to remove it

The rulers show measurements in pixels and automatically adjust to the canvas zoom.

To enable this functionality, include 'ruler' in the toolbar buttons list:

```javascript
const buttons = [
  'select',
  'shapes',
  'draw',
  'ruler',  // Add this line to include the ruler button
  'undo',
  'redo',
  // ... other buttons
];
```

## Features

### 🎨 EyeDropper

The eyedropper functionality allows selecting colors from anywhere on the screen to use in editor elements. This feature utilizes the native browser `EyeDropper` API.

#### Compatibility:

- ✅ Chrome 95+
- ✅ Edge 95+
- ❌ Firefox (not yet supported)
- ❌ Safari (not yet supported)

**Note**: On unsupported browsers, the eyedropper button will not be displayed and an informative message will appear.