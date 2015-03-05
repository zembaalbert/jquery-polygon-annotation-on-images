$.fn.annotation = function(options) {
	// some globals used all over... TODO: use params instead
    var annotations    = [];
    var annIdxEditing  = -1;  //idx in array "annotations" or -1 if no annotation is being edited
	var hiddenInputId  = $('#' + options.hiddenInputId);
	var annotationDiv  = $(this);
	var isDialogOpen   = false;
	
    preventSelectionOnDbClick(annotationDiv);

    var img = $('<img>');
    img.attr('src', options.image);
    img.css('position', 'absolute');
    preventSelectionOnDbClick(img);
    img.appendTo(this);
    
    var canvas = $('<canvas id="annotation-canvas">');
    canvas.css('position', 'absolute');
    canvas.appendTo(this);
    
    img.load(function() {
        canvas.attr('width', this.width);
        canvas.attr('height', this.height);
        canvas.css('width', this.width + 'px');
        canvas.css('height', this.height + 'px');
        annotationDiv.css('height', this.height + 'px');
		
		if (options.annotationsJSON) {
			annotations = JSON.parse(options.annotationsJSON);
			renderAnnotations(canvas, annotations);
		}
    });

    canvas.qtip({ 
        content: {
            text: ''
        },
        position: {
            target: 'mouse', 
            adjust: {x: 5,y: 5} 
        },
        style: {
            classes: 'qtip-annotation'
        }
    });
    $('.qtip-annotation').hide();
    
	if (options.editable) {
		canvas.click(function(e) {
			if (annIdxEditing == -1) {
				annIdxEditing = annotations.length;
				annotations[annIdxEditing] = {
					path: [],
					text: ''
				};
			}
			
			var p = getMousePosOnCanvas($(this), e);
			annotations[annIdxEditing].path.push(p);
			annotations[annIdxEditing].path.push(p); // last item is always mouse position
			renderAnnotations($(this), annotations);
		});
		
		canvas.dblclick(function(e) {
			if (annIdxEditing != -1) {
				var p = getMousePosOnCanvas($(this), e);
				annotations[annIdxEditing].path.push(p);
				annotations[annIdxEditing].path.push(annotations[annIdxEditing].path[0]);

				annIdxEditing = -1;
				
				renderAnnotations($(this), annotations);
				
				showTxtDialog();
			}
		});
	}    
	
    canvas.mousemove(function(e) {
        var p = getMousePosOnCanvas($(this), e);
        
        if (annIdxEditing != -1) {
            var lastItem = annotations[annIdxEditing].path.length - 1;
            annotations[annIdxEditing].path[lastItem] = p;
            renderAnnotations($(this), annotations);
        }
		
		showQtipIfPointInPath($(this), p);
    });
    
    function renderAnnotations(canvas, annotations) {
        var ctx = canvas.get(0).getContext("2d");
        ctx.clearRect(0, 0, canvas.get(0).width, canvas.get(0).height);
        ctx.fillStyle   = 'rgba(255, 255, 255, 0.2)';
        ctx.strokeStyle = '#ffcc33';
        ctx.lineWidth = 2;

        for (var i = 0; i < annotations.length; i++) {
            var path = annotations[i].path;
            
            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);
            for (var j = 1; j < path.length; j++) {
                ctx.lineTo(path[j].x, path[j].y);
            }
            ctx.fill();
            ctx.stroke();
        }
    }
    
    function showQtipIfPointInPath(canvas, point) {
		var shouldBeVisible = false;
		if ((!isDialogOpen) && (annIdxEditing == -1)) {
			var ctx = canvas.get(0).getContext("2d");
			
			for (var i = 0; i < annotations.length; i++) {
				var path = annotations[i].path;
				
				ctx.beginPath();
				ctx.moveTo(path[0].x, path[0].y);
				for (var j = 1; j < path.length; j++) {
					ctx.lineTo(path[j].x, path[j].y);
				}
				
				if (ctx.isPointInPath(point.x, point.y)) {
					shouldBeVisible = true;
					canvas.qtip('option', 'content.text', annotations[i].text.replace(/\n/g,"<br>"));
				}
			}
		}
		
		if (shouldBeVisible) {
			$('.qtip-annotation').show();
		} else {
			$('.qtip-annotation').hide();
		}
    }

    function showTxtDialog() {
        var message = $('<p />'),
            input = $('<textarea />', {
                id: 'annotation-popup-text',
                rows: 6
            }),
            ok = $('<button />', {
                id: 'annotation-popup-btn-ok',
                text: 'Ok',
                style: 'float: left;'
            }),
            cancel = $('<button />', {
                id: 'annotation-popup-btn-cancel',
                text: 'Cancel',
                style: 'float: left;'
            });
        
		isDialogOpen = true;
        $('<div />').qtip({
            content: {
                text: message.add(input).add(ok).add(cancel),
                title: 'Enter text'
            },
            position: {
                my: 'center', at: 'center',
                target: $(window)
            },
            show: {
                ready: true,
                modal: {
                    on: true,
                    blur: false
                }
            },
            hide: false,
            style: 'dialogue',
            events: {
                render: function(event, api) {
					setTimeout(function () {
						$('#annotation-popup-text').focus();
					}, 500);
                    $('#annotation-popup-btn-ok', api.elements.content).click(function(e) {
                        saveTxtForLastAnnotation($('#annotation-popup-text').val());
						hiddenInputId.val(JSON.stringify(annotations));
                        api.hide(e);
                    });
                    $('#annotation-popup-btn-cancel', api.elements.content).click(function(e) {
                        cancelLastAnnotation();
                        api.hide(e);
                    });
                },
                hide: function(event, api) { 
					api.destroy(); 
					isDialogOpen = false;
				}
            }
        });
    }
    
    function saveTxtForLastAnnotation(txt) {
        annotations[annotations.length - 1].text = txt;
        renderAnnotations(canvas, annotations);
    }
    
    function cancelLastAnnotation() {
        annotations.pop();
        renderAnnotations(canvas, annotations);
    }
    
    function preventSelectionOnDbClick(element) {
        element.css('-moz-user-select', 'none');
        element.css('-khtml-user-select', 'none');
        element.css('-webkit-user-select', 'none');
        element.css('-o-user-select', 'none');
        element.css('user-select', 'none');
    }
    
    function getMousePosOnCanvas(canavs, evt) {
        var p = {
            x: evt.pageX - canavs.position().left, 
            y: evt.pageY - canavs.position().top
        };
        return p;
    }
}
