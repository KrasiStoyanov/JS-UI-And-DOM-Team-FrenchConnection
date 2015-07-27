var $container = $('#gallery-container');
var galleryPath = 'images/gallery/';
var imagesInGallery = 10;

for (var i = 1; i <= imagesInGallery; i++) {
    var imagePath = galleryPath + i + '.jpg';
    var $image = $('<img>').attr('src', imagePath).addClass('thumb');
    $container.append($image);
}

$container.on('click', 'img', function() {
    var clickedImageSource = $(this).attr('src'),
        imagePreview = $('#myImg');

    window.defaultPuzzleImage = clickedImageSource;
    imagePreview.attr('src', clickedImageSource);
});