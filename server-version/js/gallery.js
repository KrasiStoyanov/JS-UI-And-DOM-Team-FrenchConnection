var $container = $('#gallery-container'),
	galleryPath = 'images/gallery/',
	imagesInGallery = 10,
	i,
	imagePath,
	$image;

for (i = 1; i <= imagesInGallery; i++) {
    imagePath = galleryPath + i + '.jpg';
    $image = $('<img>').attr('src', imagePath).addClass('thumb');
    $container.append($image);
}

$container.on('click', 'img', function() {
    var $clickedImage = $(this),
    	clickedImageSource = $clickedImage.attr('src'),
        imagePreview = $('#myImg');

    window.defaultPuzzleImage = clickedImageSource;
    imagePreview.attr('src', clickedImageSource);

    $container.children('.selected-image').removeClass('selected-image');
    $clickedImage.addClass('selected-image');
});

// Remove selected-image class, when image preview is changed
$('#myImg').on('load', function() {
    var selectedImage = $container.children('.selected-image'),
        imagePreview = $(this);

    if (selectedImage.attr('src') !== imagePreview.attr('src')) {
        selectedImage.removeClass('selected-image');
    }
});