<html>

<head>
	<title>Polygon Annotation Demo</title>
	
	<!-- Required stuff. Include from your server if you want. Make sure you don't include twice (i.e. if you already include them in your project) -->
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
	<script src="//cdn.jsdelivr.net/qtip2/2.2.1/jquery.qtip.min.js"></script>
	<link rel="stylesheet" href="//cdn.jsdelivr.net/qtip2/2.2.1/jquery.qtip.min.css">

	<!-- The plugin -->
	<script src="annotation.js"></script>
</head>

<body>
	<div id="annotation"></div>
	
	<script type="text/javascript">
		$('#annotation').annotation({
			image: '<?php echo $_POST['image']; ?>',
			editable: false,
			annotationsJSON: '<?php echo $_POST['annotationsJSON']; ?>'
		});
	</script>
</body>

</html>





