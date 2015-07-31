$highscoresContainer = $('#highscores-container');

$('#btn-highscores, #set-options').on('click', function() {
	var imageName = getImageNameFromPath(window.defaultPuzzleImage),
        difficulty = window.defaultDifficulty,
        allHighscores,
        currentImageHighscores,
        player,
        playerName,
        playerTime,
        $olElement;

    imageName = imageName + '-' + difficulty;

    if (localStorage['highscores']) {
    	debugger;
        allHighscores = JSON.parse(localStorage['highscores']);
        currentImageHighscores = allHighscores[imageName];
        currentImageHighscores = sortHighscores(currentImageHighscores);
    }

    if (currentImageHighscores.length > 0) {
	    $olElement = $('<ol/>');
	    for (player in currentImageHighscores) {
	    	playerName = currentImageHighscores[player].name;
	        playerTime = currentImageHighscores[player].readableTime;

	        $('<li/>')
	            .html(playerName + ' - ' + playerTime)
	            .appendTo($olElement);
	    }

	    $('#highscores-container').html($olElement);
	} else {
		$('#highscores-container').html('No highscores for this picture.');
	}
});

function getImageNameFromPath(image) {
    var imageParts = image.split('/'),
        imageName = imageParts[imageParts.length - 1];

    return imageName.replace(/\s/g, '');
}

function sortHighscores(imageHighscores) {
    var highscores = [],
        playerName;

    for (playerName in imageHighscores) {
    	highscores.push(imageHighscores[playerName]);
    }

    highscores.sort(function(firstPlayer, secondPlayer) {
    	return firstPlayer.timeInSeconds - secondPlayer.timeInSeconds;
    });

    return highscores;
}