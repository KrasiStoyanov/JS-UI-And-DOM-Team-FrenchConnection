var mainCanvas = document.getElementById('canvas');
const MAX_CANVAS_WIDTH = mainCanvas.width;
const MAX_CANVAS_HEIGHT = mainCanvas.height;

var _highscores = {};

var playField = (function () {

    const PUZZLE_HOVER_TINT = '#009900';

    var _stage,
        _canvas,
        _img,
        _rotatedImg,
        _pieces,
        _puzzleWidth,
        _puzzleHeight,
        _pieceWidth,
        _pieceHeight,
        _currentPiece,
        _currentDropPiece,
        _mouse,
        _puzzle_difficulty,
        mouse,
        puzzlePiece,
        playField,
        timer;

    gameTimer = (function () {
        var clsStopwatch = function () {
            var startAt = 0,
                lapTime = 0;

            var now = function () {
                return (new Date()).getTime();
            };

            this.start = function () {
                startAt = startAt ? startAt : now();
            };


            this.stop = function () {
                lapTime = startAt ? lapTime + now() - startAt : lapTime;
                startAt = 0;
            };

            this.reset = function () {
                lapTime = startAt = 0;
            };

            this.time = function () {
                return lapTime + (startAt ? now() - startAt : 0);
            };
        };

        var playTime = new clsStopwatch(),
            timer,
            clocktimer;

        function pad(num, size) {
            var s = "0000" + num;
            return s.substr(s.length - size);
        }

        function formatTime(time) {
            var hours = 0,
                minutes = 0,
                seconds = 0,
                newTime = '';

            hours = Math.floor(time / (60 * 60 * 1000));
            time = time % (60 * 60 * 1000);
            minutes = Math.floor(time / (60 * 1000));
            time = time % (60 * 1000);
            seconds = Math.floor(time / 1000);

            newTime = pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2);
            return newTime;
        }

        var tmr = {
            showTimer:function() {
                timer = document.getElementById('timer');
                tmr.updateTimer();
            },

            updateTimer:function() {
                timer.innerHTML = formatTime(playTime.time());
            },

            startTimer: function () {
                clocktimer = setInterval("gameTimer.updateTimer()", 1000);
                playTime.start();
            },

            stopTimer:function () {
                playTime.stop();
                clearInterval(clocktimer);
            },

            resetTimer:function () {
                tmr.stopTimer();
                playTime.reset();
                tmr.updateTimer();
            }
        };

        return tmr;
    }());

    mouse = (function () {
        var mouse = Object.create({});

        Object.defineProperty(mouse, 'init', {
            value: function (x, y) {
                this.x = x;
                this.y = y;
                return this;
            }
        });

        Object.defineProperty(mouse, 'x', {
            get: function () {
                return this._x;
            },
            set: function (value) {
                this._x = value;
            }
        });

        Object.defineProperty(mouse, 'y', {
            get: function () {
                return this._y;
            },
            set: function (value) {
                this._y = value;
            }
        });

        return mouse;
    }());

    puzzlePiece = (function () {
        var piece = Object.create({});

        Object.defineProperty(piece, 'init', {
            value: function (startX, startY, index) {
                this.startX = startX;
                this.startY = startY;
                this.currentX = startX;
                this.currentY = startY;
                this.index = index;
                this.isRotatedCorrect = true;
                return this;
            }
        });

        Object.defineProperty(piece, 'startX', {
            get: function () {
                return this._startX;
            },
            set: function (value) {
                this._startX = value;
            }
        });

        Object.defineProperty(piece, 'startY', {
            get: function () {
                return this._startY;
            },
            set: function (value) {
                this._startY = value;
            }
        });

        Object.defineProperty(piece, 'currentX', {
            get: function () {
                return this._currentX;
            },
            set: function (value) {
                this._currentX = value;
            }
        });

        Object.defineProperty(piece, 'currentY', {
            get: function () {
                return this._currentY;
            },
            set: function (value) {
                this._currentY = value;
            }
        });

        Object.defineProperty(piece,'isRotatedCorrect',{
            get: function () {
                return this._isRotatedCorrect;
            },
            set: function (value) {
                this._isRotatedCorrect = value;
            }
        });
        Object.defineProperty(piece,'index',{
            get: function () {
                return this._index;
            },
            set: function (value) {
                this._index = value;
            }
        })

        return piece;
    }());

    function resizeImage(img) {
        // Create off-screen canvas for resizing purposes
        var canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d'),
            width = img.width,
            height = img.height,
            resizedImage;

        // Scale image
        if (width > height) {
            if (width > MAX_CANVAS_WIDTH) {
                height *= MAX_CANVAS_WIDTH / width;
                width = MAX_CANVAS_WIDTH;
            }
        } else {
            if (height > MAX_CANVAS_HEIGHT) {
                width *= MAX_CANVAS_HEIGHT / height;
                height = MAX_CANVAS_HEIGHT;
            }
        }

        // Set dimensions to target size
        canvas.width = width;
        canvas.height = height;

        // Draw source image into the off-screen canvas:
        ctx.drawImage(img, 0, 0, width, height);

        // Encode image to Base64
        resizedImage = canvas.toDataURL("image/png");
        return resizedImage;
    }

    function updateHighscores(image, difficulty, playerName, readableTime, timeInSeconds) {
        var imageName = getImageNameFromPath(image),
            player;

        // Update highscore list
        if (localStorage['highscores']) {
            _highscores = JSON.parse(localStorage['highscores']);
        }

        imageName = imageName + '-' + difficulty;

        if (_highscores.hasOwnProperty(imageName)) {
            if (_highscores[imageName].hasOwnProperty(playerName)) {
                player = _highscores[imageName][playerName];

                if (player.timeInSeconds > timeInSeconds) {
                    _highscores[imageName][playerName].readableTime = readableTime;
                    _highscores[imageName][playerName].timeInSeconds = timeInSeconds;
                }
            } else { // Create player entry and add time
                _highscores[imageName][playerName] = {
                    readableTime: readableTime,
                    timeInSeconds: timeInSeconds
                };
            }
        } else { // Create image entry, add player and his time
            _highscores[imageName] = _highscores[imageName] || {};
            _highscores[imageName][playerName] = {
                readableTime: readableTime,
                timeInSeconds: timeInSeconds
            }
        }
    }

    function getImageNameFromPath(image) {
        var imageParts = image.src.split('/'),
            imageName = imageParts[imageParts.length - 1];

        return imageName.replace(/\s/g, '');
    }

    function getSeconds(hhmmss) {
        var timeParts = hhmmss.split(':'),
            hours = timeParts[0],
            minutes = timeParts[1],
            seconds = timeParts[2],
            resultTimeInSeconds = 0;

        // Add hours, minites and seconds
        resultTimeInSeconds += parseInt(hours) * 3600;
        resultTimeInSeconds += parseInt(minutes) * 60;
        resultTimeInSeconds += parseInt(seconds);

        return resultTimeInSeconds;
    }

    function getRotatedImage(image){

        var canvas = document.createElement("canvas");
        var ctx =canvas.getContext('2d');

        canvas.width = image.width;
        canvas.height = image.height;

        ctx.translate(image.width * 0.5, image.height * 0.5);
        ctx.rotate(Math.PI);
        ctx.translate(-image.width * 0.5, -image.height * 0.5);

        ctx.drawImage(image, 0, 0);

        localStorage.setItem( "rotatedImageData", canvas.toDataURL("image/png") );
        var dataUri = localStorage.getItem("rotatedImageData");

        return dataUri;
    }

    playField = (function () {
        var playfield = Object.create({});

        Object.defineProperty(playfield, 'init', {
            value: function (imageSrc, difficulty) {
                _img = new Image();
                _img.crossOrigin = "Anonymous";
                _rotatedImg = new Image();
                _rotatedImg.crossOrigin = "Anonymous";
                _img.addEventListener('load', playField.onImage, false);
                _img.src = imageSrc;
                _puzzle_difficulty = difficulty;
                return this;
            }
        });

        Object.defineProperty(playfield, 'onImage', {
            value: function (e) {
                if (_img.width > MAX_CANVAS_WIDTH || _img.height > MAX_CANVAS_HEIGHT) {
                    var resizedImageSrc = resizeImage(_img);
                    _img.src = resizedImageSrc;

                }
                var resizedRotatedImgSrc = getRotatedImage(_img);
                _rotatedImg.src = resizedRotatedImgSrc;

                _pieceWidth = Math.floor(_img.width / _puzzle_difficulty);
                _pieceHeight = Math.floor(_img.height / _puzzle_difficulty);
                _puzzleWidth = _pieceWidth * _puzzle_difficulty;
                _puzzleHeight = _pieceHeight * _puzzle_difficulty;
                playField.setCanvas();
                playField.initPuzzle();
            }
        });

        Object.defineProperty(playfield, 'setCanvas', {
            value: function () {
                _canvas = document.getElementById('canvas');
                _stage = _canvas.getContext('2d');
                _canvas.width = _puzzleWidth;
                _canvas.height = _puzzleHeight;
                _canvas.style.border = "1px solid black";
            }
        });

        Object.defineProperty(playfield, 'initPuzzle', {
            value: function () {
                _pieces = [];
                _mouse = Object.create(mouse).init(0, 0);
                _currentPiece = null;
                _currentDropPiece = null;
                _stage.drawImage(_img, 0, 0, _puzzleWidth, _puzzleHeight, 0, 0, _puzzleWidth, _puzzleHeight);
                playField.createTitle("Click to Start Puzzle");
                playField.buildPieces();

                gameTimer.showTimer();
                gameTimer.resetTimer();
            }
        });

        Object.defineProperty(playfield, 'createTitle', {
            value: function (msg) {
                _stage.fillStyle = "#000000";
                _stage.globalAlpha = 0.4;
                _stage.fillRect(100, 0, _puzzleWidth - 200, 40);
                _stage.fillStyle = "#FFFFFF";
                _stage.globalAlpha = 1;
                _stage.textAlign = "center";
                _stage.textBaseline = "middle";
                _stage.font = "20px Arial";
                _stage.fillText(msg, _puzzleWidth / 2, 20);
            }
        });

        Object.defineProperty(playfield, 'buildPieces', {
            value: function () {
                var i,
                    piece,
                    puzzleDifficulty = _puzzle_difficulty * _puzzle_difficulty,
                    xPos = 0,
                    yPos = 0;

                for (i = 0; i < puzzleDifficulty; i += 1) {
                    piece = Object.create(puzzlePiece).init(xPos, yPos, i);
                    _pieces.push(piece);
                    xPos += _pieceWidth;
                    if (xPos >= _puzzleWidth) {
                        xPos = 0;
                        yPos += _pieceHeight;
                    }
                }
                _canvas.onmousedown = playField.shufflePuzzle;
            }
        });

        Object.defineProperty(playfield, 'shufflePuzzle', {
            value: function () {
                _pieces = playField.shuffleArray(_pieces);
                _stage.clearRect(0, 0, _puzzleWidth, _puzzleHeight);
                var i,
                    len,
                    piece,
                    xPos = 0,
                    yPos = 0;

                for (i = 0, len = _pieces.length; i < len; i += 1) {
                    piece = _pieces[i];
                    piece.currentX = xPos;
                    piece.currentY = yPos;
                    if(piece.isRotatedCorrect===true) {
                        _stage.drawImage(_img, piece.startX, piece.startY, _pieceWidth, _pieceHeight, xPos, yPos, _pieceWidth, _pieceHeight);
                    }else{
                        var rotatedPieceXYCoordinates = playfield.getRotatedPieceXYCoordinates(piece);
                        //console.log(rotatedPieceXYCoordinates);
                        _stage.drawImage(_rotatedImg, rotatedPieceXYCoordinates.x, rotatedPieceXYCoordinates.y, _pieceWidth, _pieceHeight, xPos, yPos, _pieceWidth, _pieceHeight);
                    }
                    _stage.strokeRect(xPos, yPos, _pieceWidth, _pieceHeight);
                    xPos += _pieceWidth;

                    if (xPos >= _puzzleWidth) {
                        xPos = 0;
                        yPos += _pieceHeight;
                    }
                }
                _canvas.ondblclick = playfield.rotateCurrentPiece;
                _canvas.onmousedown = playField.onPuzzleClick;

                gameTimer.startTimer();
                //console.log('timer has been started!');
            }
        });


        Object.defineProperty(playfield, 'onPuzzleClick', {
            value: function (e) {
                console.log(e);
                if (e.pageX || e.pageY) {
                    _mouse.x = e.pageX;
                    _mouse.y = e.pageY;
                }else {
                    _mouse.x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                    _mouse.y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                }
                _mouse.x -= _canvas.offsetLeft;
                _mouse.y -= _canvas.offsetTop;
                _currentPiece = playField.checkPieceClicked();

                if (_currentPiece != null) {
                    _currentDropPiece = _currentPiece;
                    _canvas.onmousemove = playField.updatePuzzle;
                    _canvas.onmouseup = playField.pieceDropped;
                }
            }
        });

        Object.defineProperty(playfield, 'checkPieceClicked', {
            value: function () {
                var i,
                    len,
                    piece;

                for (i = 0, len = _pieces.length; i < len; i += 1) {
                    piece = _pieces[i];
                    if (_mouse.x < piece.currentX || _mouse.x > (piece.currentX + _pieceWidth) ||
                        _mouse.y < piece.currentY || _mouse.y > (piece.currentY + _pieceHeight)) {
                        //PIECE NOT HIT
                    }
                    else {
                        return piece;
                    }
                }
                return null;
            }
        });

        Object.defineProperty(playfield, 'rotateCurrentPiece',{
            value: function (e){
                //console.log("Puzzle double clicked!");
                if(_currentPiece.isRotatedCorrect===true){
                    _currentPiece.isRotatedCorrect = false;
                }else{
                    _currentPiece.isRotatedCorrect = true;
                }
                if(_currentPiece.isRotatedCorrect===true){
                    _stage.save();
                    _stage.drawImage(_img,_currentPiece.startX,_currentPiece.startY,_pieceWidth,_pieceHeight,_currentPiece.currentX,_currentPiece.currentY,_pieceWidth,_pieceHeight);
                    _stage.restore();
                    console.log('Piece is rotated correctly!');
                }else{
                    var rotatedPieceXYCoordinates = playfield.getRotatedPieceXYCoordinates(_currentPiece);
                    _stage.save();
                    _stage.drawImage(_rotatedImg,rotatedPieceXYCoordinates.x,rotatedPieceXYCoordinates.y,_pieceWidth,_pieceHeight,_currentPiece.currentX,_currentPiece.currentY,_pieceWidth,_pieceHeight);
                    _stage.restore();
                    console.log('Piece is rotated incorrectly!');
                }
                playfield.resetPuzzleAndCheckWin();
            }
        });

        Object.defineProperty(playfield,'getRotatedPieceXYCoordinates', {
            value: function (piece) {
                var getPieceWithIdex = _pieces.length - 1 - piece.index;
                for (var i = 0, len = _pieces.length; i < len; i += 1) {
                    if (_pieces[i].index === getPieceWithIdex) {
                        return {x: _pieces[i].startX, y: _pieces[i].startY};
                    }
                }
            }
        });

        Object.defineProperty(playfield, 'updatePuzzle', {
            value: function (e) {
                var i,
                    len,
                    piece;
                _currentDropPiece = null;

                if (e.layerX || e.layerX == 0) {
                    _mouse.x = e.layerX - _canvas.offsetLeft;
                    _mouse.y = e.layerY - _canvas.offsetTop;
                } else if (e.offsetX || e.offsetX == 0) {
                    _mouse.x = e.offsetX - _canvas.offsetLeft;
                    _mouse.y = e.offsetY - _canvas.offsetTop;
                }
                _stage.clearRect(0, 0, _puzzleWidth, _puzzleHeight);

                for (i = 0, len = _pieces.length; i < len; i += 1) {
                    piece = _pieces[i];
                    if (piece == _currentPiece) {
                        continue;
                    }
                    if(piece.isRotatedCorrect===true) {
                        _stage.drawImage(_img, piece.startX, piece.startY, _pieceWidth, _pieceHeight, piece.currentX, piece.currentY, _pieceWidth, _pieceHeight);
                    }else{
                        var rotatedPieceXYCoordinates = playfield.getRotatedPieceXYCoordinates(piece);
                        _stage.drawImage(_rotatedImg, rotatedPieceXYCoordinates.x, rotatedPieceXYCoordinates.y, _pieceWidth, _pieceHeight, piece.currentX, piece.currentY, _pieceWidth, _pieceHeight);
                    }
                    _stage.strokeRect(piece.currentX, piece.currentY, _pieceWidth, _pieceHeight);

                    if (_currentDropPiece == null) {
                        if (_mouse.x < piece.currentX || _mouse.x > (piece.currentX + _pieceWidth) ||
                            _mouse.y < piece.currentY || _mouse.y > (piece.currentY + _pieceHeight)) {
                            //NOT OVER
                        }
                        else {
                            _currentDropPiece = piece;
                            _stage.save();
                            _stage.globalAlpha = 0.4;
                            _stage.fillStyle = PUZZLE_HOVER_TINT;
                            _stage.fillRect(_currentDropPiece.currentX,
                                _currentDropPiece.currentY,
                                _pieceWidth, _pieceHeight);
                            _stage.restore();
                        }
                    }
                }

                _stage.save();
                _stage.globalAlpha = 0.6;
                if(_currentPiece.isRotatedCorrect===true) {
                    _stage.drawImage(_img, _currentPiece.startX, _currentPiece.startY, _pieceWidth, _pieceHeight,
                        _mouse.x - (_pieceWidth / 2), _mouse.y - (_pieceHeight / 2), _pieceWidth, _pieceHeight);
                }else{
                    var rotatedPieceXYCoordinates = playfield.getRotatedPieceXYCoordinates(_currentPiece);
                    _stage.drawImage(_rotatedImg, rotatedPieceXYCoordinates.x, rotatedPieceXYCoordinates.y, _pieceWidth, _pieceHeight,
                        _mouse.x - (_pieceWidth / 2), _mouse.y - (_pieceHeight / 2), _pieceWidth, _pieceHeight);
                }
                _stage.restore();
                _stage.strokeRect(_mouse.x - (_pieceWidth / 2), _mouse.y - (_pieceHeight / 2), _pieceWidth, _pieceHeight);
            }
        });

        Object.defineProperty(playfield, 'pieceDropped', {
            value: function (e) {
                var tmp;

                _canvas.onmousemove = null;
                _canvas.onmouseup = null;
                if (_currentDropPiece != null) {
                    tmp = {xPos: _currentPiece.currentX, yPos: _currentPiece.currentY};
                    _currentPiece.currentX = _currentDropPiece.currentX;
                    _currentPiece.currentY = _currentDropPiece.currentY;
                    _currentDropPiece.currentX = tmp.xPos;
                    _currentDropPiece.currentY = tmp.yPos;
                }
                playField.resetPuzzleAndCheckWin();
            }
        });

        Object.defineProperty(playfield, 'resetPuzzleAndCheckWin', {
            value: function () {
                var i,
                    len,
                    piece,
                    gameWin = true;

                _stage.clearRect(0, 0, _puzzleWidth, _puzzleHeight);

                for (i = 0, len = _pieces.length; i < len; i += 1) {
                    piece = _pieces[i];
                    if(piece.isRotatedCorrect===true) {
                        _stage.drawImage(_img, piece.startX, piece.startY, _pieceWidth, _pieceHeight, piece.currentX, piece.currentY, _pieceWidth, _pieceHeight);
                    }else{
                        var rotatedPieceXYCoordinates = playfield.getRotatedPieceXYCoordinates(piece);
                        _stage.drawImage(_rotatedImg, rotatedPieceXYCoordinates.x, rotatedPieceXYCoordinates.y, _pieceWidth, _pieceHeight, piece.currentX, piece.currentY, _pieceWidth, _pieceHeight)
                    }
                    _stage.strokeRect(piece.currentX, piece.currentY, _pieceWidth, _pieceHeight);
                    if (piece.currentX != piece.startX || piece.currentY != piece.startY || (!(piece.isRotatedCorrect===true))) {
                        gameWin = false;
                    }
                }
                if (gameWin) {
                    setTimeout(playField.gameOver, 500);
                }
            }
        });

        Object.defineProperty(playfield, 'gameOver', {
            value: function () {
                var finalTime,
                    finalTimeInSecond,
                    congratsNote,
                    playerName = prompt('Enter your name:');

                _canvas.onmousedown = null;
                _canvas.onmousemove = null;
                _canvas.onmouseup = null;

                finalTime = document.getElementById("timer").innerHTML;
                finalTimeInSecond = getSeconds(finalTime);
                congratsNote = "Congratulations!\nYou win :))\nYour time is: " + finalTime;
                alert(congratsNote);
                playerName = !!playerName ? playerName : 'Unnamed';
                updateHighscores(_img, _puzzle_difficulty, playerName, finalTime, finalTimeInSecond);
                localStorage.setItem('highscores', JSON.stringify(_highscores));


                playField.initPuzzle();
            }
        });

        Object.defineProperty(playfield, 'shuffleArray', {
            value: function (o) {
                var j,
                    x,
                    i;

                for (j, x, i = o.length - 1; i > 0; i -= 1) {
                    j = parseInt(Math.random() * i);
                    x = o[i];
                    o[i] = o[j];
                    o[j] = x;
                    playfield.getRandomPieceRotation(o[i]);
                }
                return o;
            }
        });

        Object.defineProperty(playfield,'getRandomPieceRotation',{
            value: function (piece) {
                var x = Math.floor((Math.random() * 10) + 1);
                if(x<6){
                    piece.isRotatedCorrect = true;
                }else{
                    piece.isRotatedCorrect = false;
                }
            }
        });

        return playfield;
    }());

    return playField;
}());

function createPlayField(imageSrc, difficulty) {
    var plrField = Object.create(playField).init(imageSrc, difficulty);
    return plrField;
}