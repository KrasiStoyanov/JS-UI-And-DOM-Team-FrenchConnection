var mainCanvas = document.getElementById('canvas');
const MAX_CANVAS_WIDTH = mainCanvas.width;
const MAX_CANVAS_HEIGHT = mainCanvas.height;

var playField = (function () {

    const PUZZLE_HOVER_TINT = '#009900';
    
    var _stage,
        _canvas,
        _img,
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
        playField;

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
            value: function (startX, startY) {
                this.startX = startX;
                this.startY = startY;
                this.currentX = startX;
                this.currentY = startY;
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

        return piece;
    }());

    playField = (function () {
        var playfield = Object.create({});

        Object.defineProperty(playfield, 'init', {
            value: function (imageSrc, difficulty) {
                _img = new Image();
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
                    _img.setAttribute('src', resizedImageSrc);
                }

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
            }
        });

        Object.defineProperty(playfield, 'createTitle', {
            value: function (msg) {
                _stage.fillStyle = "#000000";
                _stage.globalAlpha = .4;
                _stage.fillRect(100, _puzzleHeight - 40, _puzzleWidth - 200, 40);
                _stage.fillStyle = "#FFFFFF";
                _stage.globalAlpha = 1;
                _stage.textAlign = "center";
                _stage.textBaseline = "middle";
                _stage.font = "20px Arial";
                _stage.fillText(msg, _puzzleWidth / 2, _puzzleHeight - 20);
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
                    piece = Object.create(puzzlePiece).init(xPos, yPos);
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
                var i;
                var piece;
                var xPos = 0;
                var yPos = 0;
                for (i = 0; i < _pieces.length; i++) {
                    piece = _pieces[i];
                    piece.currentX = xPos;
                    piece.currentY = yPos;
                    _stage.drawImage(_img, piece.startX, piece.startY, _pieceWidth, _pieceHeight, xPos, yPos, _pieceWidth, _pieceHeight);
                    _stage.strokeRect(xPos, yPos, _pieceWidth, _pieceHeight);
                    xPos += _pieceWidth;
                    if (xPos >= _puzzleWidth) {
                        xPos = 0;
                        yPos += _pieceHeight;
                    }
                }
                _canvas.onmousedown = playField.onPuzzleClick;
            }
        });

        Object.defineProperty(playfield, 'onPuzzleClick', {
            value: function (e) {
                if (e.layerX || e.layerX == 0) {
                    _mouse.x = e.layerX - _canvas.offsetLeft;
                    _mouse.y = e.layerY - _canvas.offsetTop;
                }
                else if (e.offsetX || e.offsetX == 0) {
                    _mouse.x = e.offsetX - _canvas.offsetLeft;
                    _mouse.y = e.offsetY - _canvas.offsetTop;
                }
                _currentPiece = playField.checkPieceClicked();
                if (_currentPiece != null) {
                    _stage.clearRect(_currentPiece.currentX, _currentPiece.currentY, _pieceWidth, _pieceHeight);
                    _stage.save();
                    _stage.globalAlpha = .9;
                    _stage.drawImage(_img, _currentPiece.startX, _currentPiece.startY, _pieceWidth, _pieceHeight, _mouse.x - (_pieceWidth / 2), _mouse.y - (_pieceHeight / 2), _pieceWidth, _pieceHeight);
                    _stage.restore();
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
                    if (_mouse.x < piece.currentX || _mouse.x > (piece.currentX + _pieceWidth) || _mouse.y < piece.currentY || _mouse.y > (piece.currentY + _pieceHeight)) {
                        //PIECE NOT HIT
                    }
                    else {
                        return piece;
                    }
                }
                return null;
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
                    _stage.drawImage(_img, piece.startX, piece.startY, _pieceWidth, _pieceHeight, piece.currentX, piece.currentY, _pieceWidth, _pieceHeight);
                    _stage.strokeRect(piece.currentX, piece.currentY, _pieceWidth, _pieceHeight);
                    if (_currentDropPiece == null) {
                        if (_mouse.x < piece.currentX || _mouse.x > (piece.currentX + _pieceWidth) || _mouse.y < piece.currentY || _mouse.y > (piece.currentY + _pieceHeight)) {
                            //NOT OVER
                        }
                        else {
                            _currentDropPiece = piece;
                            _stage.save();
                            _stage.globalAlpha = .4;
                            _stage.fillStyle = PUZZLE_HOVER_TINT;
                            _stage.fillRect(_currentDropPiece.currentX, _currentDropPiece.currentY, _pieceWidth, _pieceHeight);
                            _stage.restore();
                        }
                    }
                }

                _stage.save();
                _stage.globalAlpha = .6;
                _stage.drawImage(_img, _currentPiece.startX, _currentPiece.startY, _pieceWidth, _pieceHeight, _mouse.x - (_pieceWidth / 2), _mouse.y - (_pieceHeight / 2), _pieceWidth, _pieceHeight);
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
                    tmp = { xPos: _currentPiece.currentX, yPos: _currentPiece.currentY };
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
                    _stage.drawImage(_img, piece.startX, piece.startY, _pieceWidth, _pieceHeight, piece.currentX, piece.currentY, _pieceWidth, _pieceHeight);
                    _stage.strokeRect(piece.currentX, piece.currentY, _pieceWidth, _pieceHeight);
                    if (piece.currentX != piece.startX || piece.currentY != piece.startY) {
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
                _canvas.onmousedown = null;
                _canvas.onmousemove = null;
                _canvas.onmouseup = null;
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
                }
                return o;
            }
        });

        return playfield;
    }());

    return playField;
}());

function createPlayField(imageSrc, difficulty) {
    var plr = Object.create(playField).init(imageSrc, difficulty);
}

function resizeImage(img) {
    // Create off-screen canvas for resizing purposes
    var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');

    var width = img.width;
    var height = img.height;

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

    // Set dimension to target size
    canvas.width = width;
    canvas.height = height;

    // Draw source image into the off-screen canvas:
    ctx.drawImage(img, 0, 0, width, height);

    // Encode image to Base64
    var newImage = canvas.toDataURL("image/png");
    return newImage;
}