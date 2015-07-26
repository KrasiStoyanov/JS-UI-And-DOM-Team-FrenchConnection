var defaultDifficulty = 4,
    defaultPuzzleImage = 'images/gallery/cat.jpg';

//Choose an image from mthe library
document.getElementById("btn-gallery").addEventListener('click', function() {
    var galleryContainer = document.getElementById("gallery-container");

    if (galleryContainer.style.display === 'undefined' || galleryContainer.style.display === '') {
        galleryContainer.style.display = 'none';
    }

    if (galleryContainer.style.display != 'none') {
        galleryContainer.style.display = 'none';
        document.getElementById('gallery-container').innerHTML = "";
    } else {
        galleryContainer.style.display = 'block';
        window.puzzle.gallery.loadGallery("gallery-container");
        window.puzzle.gallery.extractSelectedImage(document.getElementById('myImg'));
        //defaultPuzzleImage = window.puzzle.gallery.extractSelectedImagePath();
    }
});

// Upload your own image
document.getElementById("uploadImg").addEventListener('change', function() {
    if (this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = imageIsLoaded;
        reader.readAsDataURL(this.files[0]);
    }
}, false);

// Paste your own image link
function useExternalLink() {
    var externalImageLink = document.getElementById('pasteLink').value;

    defaultPuzzleImage = externalImageLink;
    document.getElementById('myImg').src = externalImageLink;
}

function imageIsLoaded(e) {
    document.getElementById('myImg').src = e.target.result;
    defaultPuzzleImage = e.target.result;
}

// Set the difficulty level
document.getElementById("set-options").addEventListener('click', function() {
    var select = document.getElementById("difficulty"),
        selectedValue = select.options[select.selectedIndex].value;

    defaultDifficulty = parseInt(selectedValue);
    createPlayField(defaultPuzzleImage, defaultDifficulty);
}, false);

createPlayField(defaultPuzzleImage, defaultDifficulty);