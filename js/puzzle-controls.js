var defaultDifficulty = 4;
var defaultPuzzleImage = 'images/gallery/cat.jpg';

// Upload your own image
document.getElementById("uploadImg").addEventListener('change', function () {
    if (this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = imageIsLoaded;
        reader.readAsDataURL(this.files[0]);
    }
}, false);

function imageIsLoaded(e) {
    document.getElementById('myImg').src = e.target.result;
    defaultPuzzleImage = e.target.result;
}

// Set the difficulty level
document.getElementById("set-options").addEventListener('click', function () {
    var select = document.getElementById("difficulty");
    var selectedValue = select.options[select.selectedIndex].value;
    defaultDifficulty = parseInt(selectedValue);
    createPlayField(defaultPuzzleImage, defaultDifficulty);
}, false);

createPlayField(defaultPuzzleImage, defaultDifficulty);