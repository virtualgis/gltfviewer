var viewer,
	debugAxis,
	showingBoundingVolume = false;

function initCesium(){
	Cesium.BingMapsApi.defaultKey = "Ag-6WHiJUeX5dm4qedvjgqzGcB-mgrZe1KtjnNz-8gwzIP_8PUu9kVZUKXhuwRsX";

	var globe = new Cesium.Globe();
	globe.baseColor = Cesium.Color.WHITE;

	viewer = new Cesium.Viewer('cesiumContainer',{
		animation: false,
		scene3DOnly: true,
		globe: globe,
		skyBox: false,
		vrButton: true,
		skyAtmosphere: false,
		shadows: false,
		baseLayerPicker: false,
		geocoder: false,
		homeButton: false,
		fullscreenButton: true,
		infoBox: false,
		sceneModePicker: false,
		selectionIndicator: false,
		timeline: false,
		navigationHelpButton: false,
		navigationInstructionsInitiallyVisible: false
	});
	viewer.scene.backgroundColor = Cesium.Color.WHITE;
	viewer.scene.imageryLayers.removeAll();

	document.body.onkeydown = function(e){
		switch((e.keyCode || e.which)){
			case 70:
				toggleDebugAxis();
				break;
			case 66:
				toggleBoundingVolume();
				break;
			case 72:
				toggleHelpCredits();
				break;
		}
	};
}

function initDropzone(){
	var reader  = new FileReader();
	reader.addEventListener("load", function () {
	    showGlTF(reader.result);
	}, false);

	["div#cesiumContainer", "div#home .dragndrop"].forEach(function(container){
		var dz = new Dropzone(container, { 
			url: "#",
			acceptedFiles: ".gltf,.glb",
			maxFilesize: 1000,
			clickable: container.indexOf("dragndrop") !== -1,
			maxFiles: 1,
			createImageThumbnails: false,
			autoProcessQueue: false,
			accept: function(file, done){
				document.getElementById("home").style.display = 'none';
				reader.readAsDataURL(file);
			}
		});
	});
}

function getPrimitive(){
	return viewer.scene.primitives.get(0);
}

function toggleHelpCredits(){
	["credits", "instructions"].forEach(function(id){
		var el = document.getElementById(id);
		el.style.display = el.style.display === 'block' ? 'none' : 'block';
	});
}

function toggleBoundingVolume(){
	showingBoundingVolume ? hideBoundingVolume() : showBoundingVolume();
}

function showBoundingVolume(){
	getPrimitive().debugShowBoundingVolume = showingBoundingVolume = true;
}

function hideBoundingVolume(){
	getPrimitive().debugShowBoundingVolume = showingBoundingVolume = false;
}

function toggleDebugAxis(){
	if (viewer && getPrimitive().modelMatrix){
		if (debugAxis){
			hideDebugAxis();
		}else{
			showDebugAxis();
		}
	}
}

function showDebugAxis(){
	debugAxis = viewer.scene.primitives.add(new Cesium.DebugModelMatrixPrimitive({
	  modelMatrix : getPrimitive().modelMatrix
	}));
}

function hideDebugAxis(){
	viewer.scene.primitives.remove(debugAxis);
	debugAxis = null;
}

function showGlTF(uri){
	if (!viewer){
		initCesium();
	}

	viewer.entities.removeAll();
	viewer.scene.primitives.removeAll();
	
	var entity = viewer.entities.add({
	    position : Cesium.Cartesian3.fromDegrees(0, 0, 100000000000),
	    model : {
	        uri : uri,
	        minimumPixelSize : 128,
	        maximumScale : 20000
	    }
	});
	viewer.trackedEntity = entity;

	function checkOnLoad(entity){
	    setTimeout(function(){
	    	var boundingSphere = new Cesium.BoundingSphere();
			var state = viewer.dataSourceDisplay.getBoundingSphere(entity, false, boundingSphere);
			if (state === Cesium.BoundingSphereState.DONE) {
				// Set camera
				viewer.camera.moveBackward(2);

				// Show debug
				if (debugAxis){
					showDebugAxis();
				}

				if (showingBoundingVolume){
					showBoundingVolume();
				}
			}else{
				checkOnLoad(entity);
			}
	    }, 50);
	}
	checkOnLoad(entity);
}

initDropzone();