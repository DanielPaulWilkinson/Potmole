//when the doument is ready
$(document)
	.on("ready", function() {
		//on submition of the form trigger the addpothole method
		$('#AddPothole')
			.on('click', AddPothole);
		//instantly activate the getdata method
		GetData();
		//instantly activate and creat the map
		initMap();
	});
//find out if user browser supports geolocation
function initMap() {
		//if we have acsess to the geolocation
		if (navigator.geolocation) {
			//get the current position funcion to give us 2 methods that will either alow us to find a user or not
			navigator.geolocation.getCurrentPosition(success, fail);
		} else {
			//else we alert to the user that we cannot fiind them
			alert(
				"Sorry, your browser does not support geoLocation services. You may need to turn this on in settings or use another up to date browser."
			);
		}
	}
//google map variable so we can use this in functions.
var map;

function success(position) {
		// Define the coordinates as a Google Maps LatLng Object
		var coords = new google.maps.LatLng(position.coords.latitude, position.coords
			.longitude);
		//longitude & latitude values to the form
		$('#Lan')
			.val(position.coords.latitude);
		$('#Lon')
			.val(position.coords.longitude);
		// Prepare the map options
		var mapOptions = {
			zoom: 8,
			center: coords,
			mapTypeControl: false,
			navigationControlOptions: {
				style: google.maps.NavigationControlStyle.SMALL
			},
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		// Create the map, and place it in the map_canvas div
		map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
		var green = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
		var UserPosition = new google.maps.Marker({
			position: coords,
			map: map,
			icon: green,
			draggable: true
		});
		//alow a marker to display a clickable infowindow
		var infowindow = new google.maps.InfoWindow({
			content: "<h3>Your Current Location</h3>"
		});
		//add the event listener to the userposition marker
		UserPosition.addListener('click', function() {
			infowindow.open(map, UserPosition);
		});
		//incase users drags add event listener and put in the inputs new quords -
		//So, we can save a pothole eactly where it is, helps gain accurcy as google maps can sometimes be out.
		google.maps.event.addListener(UserPosition, 'dragend', function(event) {
			$("#Lan")
				.val(this.getPosition()
					.lat());
			$("#Lon")
				.val(this.getPosition()
					.lng());
		});
	}
	//if we cannot find the user

function fail() {
		alert(
			"Opps, it appears we cannot find you right now, please try again later!");
	}
	//=====================API Functionality: getting logged reports and showing them on map==================================
//get data from my api
function GetData() {
	//from this url
	var url = 'http://localhost:3000/?callback=?';
	//look for and expect json data
	$.getJSON(url, null, function(data) {
		//If we get data...
		if (data) {
			//cycle through
			$.each(data, function(var1, var2) {
				//use the data as coords
				var coords = new google.maps.LatLng(var2.Latitude, var2.Longitude);
				//and add a clickable marker comment which displays an image and some other data
				RefreshMap(coords, var2.Comment, var2.Title, var2.User, var2.IMG_File_Name);
			});
		}
	});
}

function RefreshMap(coords, comment, title, user, img) {
	//create an image tage here to make it easier for me to add to content.
	var imgtag =
		'<IMG BORDER="0" STYLE="width:250px; height:250px;"  ALIGN="Left" SRC="data:image/png;base64,' +
		img + '"><br /><br />';
	//create new marker and its properties
	var marker = new google.maps.Marker({
		position: coords,
		map: map,
		animation: google.maps.Animation.DROP,
		title: "Pothole!"
	});
	//create the info window wich includes the saved comment
	var infowindow = new google.maps.InfoWindow({
		content: "<h2>Title: " + title + "</h2>Image: <br>" + imgtag +
			"<br><br /><p>Comment:" + comment + "</p><br>" + "Submitted By: " + user +
			"<p>"
	});
	//add the event listener to our new marker which displays the information we passed as parameters
	marker.addListener('click', function() {
		infowindow.open(map, marker);
	});
}
//create a base64 encoder variable
var b69;
//add the addpole function
function AddPothole() {
	//create a new form object
	var form = {};
	//get the coords from the parameters
	var coords = new google.maps.LatLng($('#Lan')
		.val(), $('#Lon')
		.val());
	//create the ecoding of the file & add other form details to the form object
	b69 = btoa($("#file")[0].files[0]);
	form.Title = $('#Title')
		.val();
	form.Longitude = $('#Lon')
		.val();
	form.Latitude = $('#Lan')
		.val();
	form.Comment = $('#Comment')
		.val();
	form.User = $('#User')
		.val();
	//including adding the base 69ed image
	form.IMG_File_Name = b69;
	//refresh the map live to the user
	RefreshMap(coords, form.Comment, form.Title, form.User, form.IMG_File_Name);
}
