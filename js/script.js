(function () {
    this.Croploader = function (element, options, callback) {
        this.el = element;

        var defaults = {
            cropWidth: 300,
            cropHeight: 200,
            zoomPercentage: 5
        };

        options = extendDefaults(defaults, options);

        this.el.onchange = function (e) {

            var files = e.target.files;

            var selFile = files[0];
            var reader = new FileReader();

            reader.onerror = function (e) {
                console.error("Error trying to read file: " + e);
            };

            reader.onloadend = function () {

                var base64 = btoa(uint8ToString(new Uint8Array(reader.result)));
                var imageSrc = 'data:application/octet-stream;base64,' + base64;

                var cropContainer = document.createElement('div');
                cropContainer.className = 'cropContainer';
                cropContainer.style.width = '100%';
                cropContainer.style.height = '100%';
                cropContainer.style.top = 0;
                cropContainer.style.left = 0;

                var wHeight = window.innerHeight;
                var wWidth = window.innerWidth;
                var cropToolHeight = wHeight * 0.8;
                var croppingWidth = wWidth * 0.8;
                var cropToolWidth = croppingWidth - options.cropWidth;

                var cropToolMarginSides = wWidth * 0.1;
                var cropToolMarginTB = wHeight * 0.1;

                var cropping = document.createElement('div');
                cropping.className = 'cropping';
                cropping.style.width = croppingWidth + 'px';
                cropping.style.height = cropToolHeight + 'px';
                cropping.style.height = cropToolHeight + 'px';
                cropping.style.marginLeft = cropToolMarginSides + 'px';
                cropping.style.marginRight = cropToolMarginSides + 'px';
                cropping.style.marginTop = cropToolMarginTB + 'px';
                cropping.style.marginBottom = cropToolMarginTB + 'px';

                var cropTool = document.createElement('div');
                cropTool.className = 'cropTool';
                cropTool.style.width = cropToolWidth + 'px';
                cropTool.style.height = cropToolHeight + 'px';

                var cropArea = document.createElement('div');
                cropArea.className = 'cropArea';
                cropArea.style.width = cropToolWidth + 'px';
                cropArea.style.height = (cropToolHeight - 70) + 'px';
                cropTool.appendChild(cropArea);

                var cropView = document.createElement('div');
                cropView.className = 'cropView';
                cropView.style.width = (options.cropWidth + 10) + 'px';
                cropView.style.height = (options.cropHeight + 10) + 'px';
                setDraggable(cropView);

                var cropImage = new Image();
                cropImage.className = 'cropImage';

                cropArea.appendChild(cropView);
                cropArea.appendChild(cropImage);

                cropImage.src = imageSrc;

                var cropButtonWrapper = document.createElement('div');
                cropButtonWrapper.className = 'cropButtonWrapper';

                var cropButton = document.createElement('div');
                cropButton.className = 'cropButton crop';

                var cropIcon = document.createElement('i');
                cropIcon.className = 'icon-crop';
                cropButton.appendChild(cropIcon);

                cropButton.addEventListener('click', function () {
                    var canvas = document.createElement('canvas');
                    canvas.width = options.cropWidth;
                    canvas.height = options.cropHeight;
                    var context = canvas.getContext('2d');
                    var sX = parseInt(cropView.style.left) - parseInt(cropImage.style.left) + 5;
                    var sY = parseInt(cropView.style.top) - parseInt(cropImage.style.top) + 5;
                    context.drawImage(cropImage, sX, sY, options.cropWidth, options.cropHeight, 0, 0, options.cropWidth, options.cropHeight);

                    callback(canvas.toDataURL());

                    cropContainer.outerHTML = '';
                });

                cropButtonWrapper.appendChild(cropButton);

                var zoominButton = document.createElement('div');
                zoominButton.className = 'cropButton zoomin';

                var zoominIcon = document.createElement('i');
                zoominIcon.className = 'icon-zoom-in';
                zoominButton.appendChild(zoominIcon);

                cropButtonWrapper.appendChild(zoominButton);

                var zoomoutButton = document.createElement('div');
                zoomoutButton.className = 'cropButton zoomout';

                var zoomoutIcon = document.createElement('i');
                zoomoutIcon.className = 'icon-zoom-out';
                zoomoutButton.appendChild(zoomoutIcon);

                cropButtonWrapper.appendChild(zoomoutButton);


                cropTool.appendChild(cropButtonWrapper);


                cropping.appendChild(cropTool);


                var cropPreviewWrapper = document.createElement('div');
                cropPreviewWrapper.className = 'cropPreviewWrapper';
                cropPreviewWrapper.style.width = options.cropWidth + 'px';

                var cropPreviewBox = document.createElement('div');
                cropPreviewBox.className = 'cropPreviewBox';
                cropPreviewBox.style.height = options.cropHeight + 'px';
                cropPreviewBox.style.width = options.cropWidth + 'px';
                cropPreviewWrapper.appendChild(cropPreviewBox);

                var cropPreviewArea = document.createElement('div');
                cropPreviewArea.className = 'cropPreviewArea';
                cropPreviewArea.style.width = cropArea.style.width;
                cropPreviewArea.style.height = cropArea.style.height;

                var cropPreviewImage = new Image();
                cropPreviewImage.className = 'cropPreviewImage';
                cropPreviewImage.src = imageSrc;
                removeGhostImage(cropPreviewImage);
                cropPreviewArea.appendChild(cropPreviewImage);

                cropImage.onload = function () {
                    if (cropArea.height < cropArea.width) {
                        if (cropImage.height >= cropImage.width) {
                            if (cropImage.height > parseInt(cropArea.style.height)) {
                                cropImage.height = parseInt(cropArea.style.height);
                                cropPreviewImage.height = parseInt(cropArea.style.height);
                            }
                        }
                    } else {
                        if (cropImage.width >= cropImage.height) {
                            if (cropImage.width > parseInt(cropArea.style.width)) {
                                cropImage.width = parseInt(cropArea.style.width);
                                cropPreviewImage.width = parseInt(cropArea.style.width);
                            }
                        }
                    }


                    cropImage.style.width = cropImage.width + 'px';
                    cropImage.style.height = cropImage.height + 'px';
                    cropImage.style.left = (cropToolWidth / 2) - (cropImage.width / 2) + 'px';
                    cropImage.style.top = ((cropToolHeight - 70) / 2) - (cropImage.height / 2) + 'px';

                    removeGhostImage(cropImage);

                    cropPreviewImage.style.left = cropImage.style.left;
                    cropPreviewImage.style.top = cropImage.style.top;

                    // setDraggable(cropImage);
                };

                cropPreviewBox.appendChild(cropPreviewArea);
                cropPreviewWrapper.appendChild(cropPreviewBox);


                cropping.appendChild(cropPreviewWrapper);

                cropContainer.appendChild(cropping);

                zoominButton.addEventListener('click', function () {
                    var zoomWidth = (parseInt(cropImage.style.width) / 100) * options.zoomPercentage;
                    var zoomHeight = (parseInt(cropImage.style.height) / 100) * options.zoomPercentage;

                    var newPrevImgWidth = parseInt(cropImage.style.width) + zoomWidth;
                    var newPrevImgHeight = parseInt(cropImage.style.height) + zoomHeight;

                    var middleXCoordinate = parseInt(cropImage.style.left) + (parseInt(cropImage.style.width) / 2);
                    var middleYCoordinate = parseInt(cropImage.style.top) + (parseInt(cropImage.style.height) / 2);

                    cropImage.style.width = newPrevImgWidth + 'px';
                    cropImage.style.height = newPrevImgHeight + 'px';
                    cropImage.style.left = (middleXCoordinate - (newPrevImgWidth / 2)) + 'px';
                    cropImage.style.top = (middleYCoordinate - (newPrevImgHeight / 2)) + 'px';

                    cropPreviewImage.style.width = newPrevImgWidth + 'px';
                    cropPreviewImage.style.height = newPrevImgHeight + 'px';
                    cropPreviewImage.style.left = (middleXCoordinate - (newPrevImgWidth / 2)) + 'px';
                    cropPreviewImage.style.top = (middleYCoordinate - (newPrevImgHeight / 2)) + 'px';
                });

                zoomoutButton.addEventListener('click', function () {
                    var zoomWidth = (parseInt(cropImage.style.width) / 100) * options.zoomPercentage;
                    var zoomHeight = (parseInt(cropImage.style.height) / 100) * options.zoomPercentage;

                    var newPrevImgWidth = parseInt(cropImage.style.width) - zoomWidth;
                    var newPrevImgHeight = parseInt(cropImage.style.height) - zoomHeight;

                    var middleXCoordinate = parseInt(cropImage.style.left) + (parseInt(cropImage.style.width) / 2);
                    var middleYCoordinate = parseInt(cropImage.style.top) + (parseInt(cropImage.style.height) / 2);

                    cropImage.style.width = newPrevImgWidth + 'px';
                    cropImage.style.height = newPrevImgHeight + 'px';
                    cropImage.style.left = (middleXCoordinate - (newPrevImgWidth / 2)) + 'px';
                    cropImage.style.top = (middleYCoordinate - (newPrevImgHeight / 2)) + 'px';

                    cropPreviewImage.style.width = newPrevImgWidth + 'px';
                    cropPreviewImage.style.height = newPrevImgHeight + 'px';
                    cropPreviewImage.style.left = (middleXCoordinate - (newPrevImgWidth / 2)) + 'px';
                    cropPreviewImage.style.top = (middleYCoordinate - (newPrevImgHeight / 2)) + 'px';
                });

                document.getElementsByTagName('body')[0].appendChild(cropContainer);
            };
            reader.readAsArrayBuffer(selFile);
        }
    };

    function extendDefaults(source, properties) {
        var property;
        for (property in properties) {
            if (properties.hasOwnProperty(property)) {
                source[property] = properties[property];
            }
        }
        return source;
    }

    function uint8ToString(buf) {
        var i, length, out = '';
        for (i = 0, length = buf.length; i < length; i += 1) {
            out += String.fromCharCode(buf[i]);
        }
        return out;
    }

    function getWidth(newHeight, currentWidth, currentHeight) {
        if (currentHeight == 0) return 0;
        var aspectRatio = currentWidth / currentHeight;
        return newHeight * aspectRatio;
    }

    function hasClass(elem, className) {
        return elem.className.split(' ').indexOf(className) > -1;
    }

    function removeGhostImage(el) {
        el.addEventListener("dragstart", function (e) {
            e.preventDefault();
            return false;
        }, false);
    }

    function moveDiv(divid, xpos, ypos) {
        divid.style.left = xpos + 'px';
        divid.style.top = ypos + 'px';

        var jajaja = document.getElementsByClassName('cropPreviewArea')[0];
        jajaja.style.bottom = (ypos + 5) + 'px';
        jajaja.style.right = (xpos + 5) + 'px';
    }

    function setDraggable(el) {
        el.addEventListener('mousedown', function (e) {
            e = e || window.event;

            var draggable = e.target,
                posX = e.clientX,
                posY = e.clientY,
                divTop = draggable.style.top,
                divLeft = draggable.style.left,
                eWi = parseInt(draggable.style.width),
                eHe = parseInt(draggable.style.height),
                cWi = parseInt(draggable.parentNode.style.width),
                cHe = parseInt(draggable.parentNode.style.height);
            divTop = divTop.replace('px', '');
            divLeft = divLeft.replace('px', '');

            var diffX = posX - divLeft,
                diffY = posY - divTop;

            document.addEventListener("mousemove", function drag(e) {
                document.addEventListener("mouseup", function () {
                    document.removeEventListener('mousemove', drag, false);
                });
                e = e || window.event;
                var d = e.target;

                if (!hasClass(e.target, el.className)) {
                    d = e.target.querySelectorAll(el.className)[0];
                }
                var posX = e.clientX,
                    posY = e.clientY,
                    aX = posX - diffX,
                    aY = posY - diffY;
                if (aX < 0) aX = 0;
                if (aY < 0) aY = 0;
                if (aX + eWi > cWi) aX = cWi - eWi;
                if (aY + eHe > cHe) aY = cHe - eHe;

                moveDiv(d, aX, aY);
            }, false);

            return false;
        });
    }
}());

var element = document.getElementsByClassName('inputfile')[0];

var options = {
    cropWidth: 301
};

new Croploader(element, options, function (base64) {
    console.log(base64);
});