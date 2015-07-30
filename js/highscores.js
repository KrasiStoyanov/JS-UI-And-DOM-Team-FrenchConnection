$highscoresContainer = $('#highscores-container');

$('#btn-highscores, #set-options').on('click', function() {
	var imageName = getImageNameFromPath(window.defaultPuzzleImage),
        difficulty = window.defaultDifficulty,
        allHighscores,
        currentImageHighscores,
        playerName,
        playerTime,
        $olElement;

    imageName = imageName + '-' + difficulty;

    if (localStorage['highscores']) {
        allHighscores = JSON.parse(localStorage['highscores']);
        currentImageHighscores = allHighscores[imageName];
    }

    if (currentImageHighscores) {
	    $olElement = $('<ol/>');
	    for (playerName in currentImageHighscores) {
	        playerTime = currentImageHighscores[playerName].readableTime;

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