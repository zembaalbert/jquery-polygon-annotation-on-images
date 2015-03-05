# jQuery plugin for polygonal annotations on images

Demo at http://jsfiddle.net/bqyxuhgb/21/

There are lots of plugins and tools for both jQuery and raw JS for adding annotations to an image. But all of them seems to support very simple shapes (like rectangels or points). Here's one that can be used to add poligon shaped annotations.

Usage example:
```
<div id="annotation"></div>
<input type="hidden" id="annotationsJSON" name="annotationsJSON" />
$('#annotation').annotation({
    image: 'img.jpg',
    editable: true,
    hiddenInputId: 'annotationsJSON'
});
```

Options: 
 * image: URL to the image that you want to annotate 
 * editable: true/false. If true the user can add new annotations to the image
 * hiddenInputId: if specified the plugin will automatically add the annotations as JSON to the input's value. Can be saved later (i.e. server side) and loaded via the annotationsJSON option
 * annotationsJSON: specifies a json produced in "hiddenInputId" with "editable" set to true
