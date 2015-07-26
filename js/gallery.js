var puzzle = puzzle || {};
console.log(puzzle);

puzzle.gallery = (function() {
    var gallery = Object.create({});

    var _galleryImagesPath = 'images/gallery/',
        _maximumImagesInGallery = 2,
        carousel;


    Object.defineProperty(gallery, 'loadGallery', {
        value: function(name) {
            validateString(name);
            loadImages();

            carousel = new YAHOO.widget.Carousel(name);
            carousel.set("animation", {
                speed: 0.5
            });
            carousel.set("numVisible", 1);
            carousel.render();

            return this;
        }

    });

    Object.defineProperty(gallery, 'extractSelectedImage', {
        value: function(imgElement) {
            validateImage(imgElement);
            carousel.on("click", function(ev) {
                if (ev.srcElement.tagName == 'IMG') {
                    imgElement.src = ev.srcElement.src;
                    window.defaultPuzzleImage = ev.srcElement.src;
                }
            });

            return this;
        }
    });

    Object.defineProperty(gallery, 'selectedImageSource', {
        get: function() {
            return selectedImageSource;
        },
        set: function(value) {
            validateString(value);
            selectedImageSource = value;
        }
    });

    function loadImages() {
        var container = document.getElementById('gallery-container'),
            imagesList = document.createElement('ol');

        var imageCount = 1,
            imagePath = '';
        while (imageCount <= _maximumImagesInGallery) {
            imagePath = _galleryImagesPath + imageCount + '.jpg';

            var imageListElement = document.createElement('li');
            var image = document.createElement('img');
            image.src = imagePath;
            image.style.width = '250px';

            imageListElement.appendChild(image);
            imagesList.appendChild(imageListElement);

            imageCount++;
        }
        container.appendChild(imagesList);
    }

    function validateString(name) {
        if (name === undefined || name === "") {
            throw new Exeption("String shold be defined");
        };
    }

    function validateImage(imgElement) {
        if (imgElement.tagName != 'IMG') {
            throw new Exeption("Selected image must be exported to image tag");
        }
    }

    return gallery;
})();