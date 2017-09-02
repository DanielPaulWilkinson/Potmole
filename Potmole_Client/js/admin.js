//create an array variable
var objectArray;
//create the map variable
var map;
//on load of the admin page
$(document)
	.on("ready", function() {
		//get the data from the API
		GetDataForAdmin();
		//make sure the bootstrap modal isnt appearing before its called
		$('#myModal')
			.modal({
				show: false
			})
			//foreach of the tables rows if the ID is clicked show the user data
		$('#tablerows')
			.on('click', 'a.linkshowuser', showUserInfo);
			//foreach of the table rows if the Delete button is clicked delete the data
		$('#tablerows')
			.on('click', 'a.linkdeleteuser', deleteUser);
			//on the click of the submit button update that user in the api
		$('#SaveChanges')
			.on('click', updateUser);
	});
//we need to see the data the user has entered, this method returns a map with a marker
//that alows the admin to see the users pothole coords
function LoadMap(lat, log) {
	//we create the new coords
	var coords = new google.maps.LatLng(lat, log);
	//give the map its properties
	var mapOptions = {
		zoom: 10,
		center: coords,
		mapTypeControl: false,
		navigationControlOptions: {
			style: google.maps.NavigationControlStyle.SMALL
		},
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	//build the map in the mapcavas div
	map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
	//initiate a resize event to make it quicker to load when the user or admin draggs the marker
	google.maps.event.trigger(map, 'resize');
	//get the green marker from the google libary
	var green = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
	//create a new user position marker
	var UserPosition = new google.maps.Marker({
		position: coords,
		map: map,
		icon: green
	});
	//create the info window for this marke
	var infowindow = new google.maps.InfoWindow({
		content: "<h3>Users Pothole Current Location</h3>"
	});
	//add the clickable listener to the marker
	UserPosition.addListener('click', function() {
		infowindow.open(map, UserPosition);
	});
}
//update the user
function updateUser() {
		//get the data from the form
		var data = {};
		data.Title = $('#Title')
			.val();
		data.Longitude = $('#Lon')
			.val();
		data.Latitude = $('#Lan')
			.val();
		data.Id = $('#Id')
			.val();
		data.Comment = $('#Comment')
			.val();
		data.User = $('#User')
			.val();
		data.PotStatus = $('#PotStatus')
			.val();
			//send this in a ajax function to the update endpoint
		$.ajax({
			url: "http://localhost:3000/auth/update/" + data.Id,
			type: "POST",
			dataType: "json",
			data: JSON.stringify(data),
			contentType: "application/json"
		});
		$('#myModal')
			.modal('hide');
		//update the results to see changd result
		GetDataForAdmin();
	}
//get data from my api
function GetDataForAdmin() {
	var tableContent = '';
	//from this url
	var url = 'http://localhost:3000/auth';
	//look for and expect json data
	$.getJSON(url, function(data) {
		objectArray = data;
		//cycle through
		$.each(data, function() {
			tableContent += '<tr>';
			tableContent += '<td><a href="#" class="linkshowuser" rel="' + this.Id +
				'" title="Show Details">' + this.Id + '</a></td>';
			tableContent += '<td>' + this.Title + '</td>';
			tableContent += '<td>' + this.User + '</td>';
			tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this.Id +
				'">delete</a></td>';
			tableContent += '</tr>';
		});
		$('#tablerows')
			.html(tableContent);
	});
};

function showUserInfo(event) {
	//prevent a link to a unknown page
	event.preventDefault();
	// Retrieve username from link rel attribute
	var thisReportId = $(this)
		.attr('rel');
	//from 2016 have to use 'find index' instead of $.grep/arr.map more here http://stackoverflow.com/questions/15997879/get-the-index-of-the-object-inside-an-array-matching-a-condition
	var arrayPosition = objectArray.findIndex(x => x.Id == thisReportId)
		//use that index to return that object from the arr
	var ThisReport = objectArray[arrayPosition];
	//fetch rhw data from the current object
	$('#changeimage')
		.attr('src', 'data:image/png;base64,' + ThisReport.IMG_File_Name);
	LoadMap(ThisReport.Latitude, ThisReport.Longitude);
	$('#myModalLabel')
		.text(ThisReport.Title);
	$('#Title')
		.val(ThisReport.Title);
	$('#Lon')
		.val(ThisReport.Longitude);
	$('#Lan')
		.val(ThisReport.Latitude);
	$('#Id')
		.val(ThisReport.Id);
	$('#Comment')
		.val(ThisReport.Comment);
	$('#User')
		.val(ThisReport.User);
	$('#PotStatus')
		.val(ThisReport.PotStatus);
		//show my modal
	$('#myModal')
		.modal('show');
}

function deleteUser(event) {
	//prevent a link to unknown page
	event.preventDefault();
	// Pop up a confirmation dialog
	var confirmation = confirm('Are you sure you want to delete this report?');
	// Check and make sure the user confirmed
	if (confirmation === true) {
		// If they did, do our delete
		$.ajax({
				type: 'DELETE',
				url: 'http://localhost:3000/auth/' + $(this)
					.attr('rel')
			})
			.done(function(response) {
				// Check for a successful (blank) response
				if (response.msg === '') {} else {
					alert('Error: ' + response.msg);
				}
				// Update the table
				GetDataForAdmin();
			});
	} else {
		// If they said no to the confirm, do nothing
		return false;
	}
};
