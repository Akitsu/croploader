///////////////////////////////////////
// Uploader
///////////////////////////////////////

function uint8ToString(buf) {
    var i, length, out = '';
    for (i = 0, length = buf.length; i < length; i += 1) {
        out += String.fromCharCode(buf[i]);
    }
    return out;
}

function getWidth(newHeight, currentWidth, currentHeight) {
    if(currentHeight == 0) return 0;
    var aspectRatio = currentWidth / currentHeight;
    return newHeight * aspectRatio;
}

function hasClass(elem, className) {
    return elem.className.split(' ').indexOf(className) > -1;
}

function removeGhostImage (el) {
    el.addEventListener("dragstart", function (e) {
        e.preventDefault();
        return false;
    }, false);
}

function setDraggable (el) {
    function moveDiv(divid, xpos, ypos) {
        divid.style.left = xpos + 'px';
        divid.style.top = ypos + 'px';

        var jajaja = document.getElementsByClassName('cropPreviewArea')[0];
        jajaja.style.bottom = (ypos + 5) + 'px';
        jajaja.style.right = (xpos + 5) + 'px';
    }

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

document.querySelectorAll('.inputfile').forEach(function() {
    this.onchange = function(e) {
        var files = e.target.files;

        var selFile = files[0];
        var reader = new FileReader();

        reader.onerror = function(e) {
            console.log(e);
        };

        reader.onload = function () {
            console.log("loading");
        };

        reader.onloadend = function() {
            var cropWidth = 300;
            var cropHeight = 200;
            var zoomPercentage = 5;

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
            var cropToolWidth = croppingWidth - cropWidth;

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
            cropView.style.width = (cropWidth + 10) + 'px';
            cropView.style.height = (cropHeight + 10) + 'px';
            setDraggable(cropView);

            var cropImage = new Image();
            cropImage.className = 'cropImage';
            cropImage.style.left = (cropToolWidth / 2) - (cropWidth * 0.75) + 'px';
            cropImage.style.top = (cropToolHeight / 2) - (cropHeight * 0.75) + 'px';

            cropArea.appendChild(cropView);
            cropArea.appendChild(cropImage);

            cropImage.onload = function (e) {
                cropImage.style.width = cropImage.width + 'px';
                cropImage.style.height = cropImage.height + 'px';

                removeGhostImage(cropImage);
            };
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
                canvas.width = cropWidth;
                canvas.height = cropHeight;
                var context = canvas.getContext('2d');
                var sX = parseInt(cropView.style.left) - parseInt(cropImage.style.left) + 5;
                var sY = parseInt(cropView.style.top) - parseInt(cropImage.style.top) + 5;
                context.drawImage(cropImage, sX, sY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

                console.log(canvas.toDataURL());

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
            cropPreviewWrapper.style.width = cropWidth + 'px';

            var cropPreviewBox = document.createElement('div');
            cropPreviewBox.className = 'cropPreviewBox';
            cropPreviewBox.style.height = cropHeight + 'px';
            cropPreviewBox.style.width = cropWidth + 'px';
            cropPreviewWrapper.appendChild(cropPreviewBox);

            var cropPreviewArea = document.createElement('div');
            cropPreviewArea.className = 'cropPreviewArea';
            cropPreviewArea.style.width = cropArea.style.width;
            cropPreviewArea.style.height = cropArea.style.height;

            var cropPreviewImage = new Image();
            cropPreviewImage.className = 'cropPreviewImage';
            cropPreviewImage.src = imageSrc;
            cropPreviewImage.style.left = cropImage.style.left;
            cropPreviewImage.style.top = cropImage.style.top;
            cropPreviewArea.appendChild(cropPreviewImage);

            cropPreviewBox.appendChild(cropPreviewArea);
            cropPreviewWrapper.appendChild(cropPreviewBox);


            cropping.appendChild(cropPreviewWrapper);

            cropContainer.appendChild(cropping);

            zoominButton.addEventListener('click', function () {
                var zoomWidth = (parseInt(cropImage.style.width) / 100) * zoomPercentage;
                var zoomHeight = (parseInt(cropImage.style.height) / 100) * zoomPercentage;

                var newPrevImgWidth = (parseInt(cropImage.style.width) + zoomWidth) + 'px';
                var newPrevImgHeight = (parseInt(cropImage.style.height) + zoomHeight) + 'px';

                cropImage.style.width = newPrevImgWidth;
                cropImage.style.height = newPrevImgHeight;
                cropPreviewImage.style.width = newPrevImgWidth;
                cropPreviewImage.style.height = newPrevImgHeight;
            });

            zoomoutButton.addEventListener('click', function () {
                var zoomWidth = (parseInt(cropImage.style.width) / 100) * zoomPercentage;
                var zoomHeight = (parseInt(cropImage.style.height) / 100) * zoomPercentage;

                var newPrevImgWidth = (parseInt(cropImage.style.width) - zoomWidth) + 'px';
                var newPrevImgHeight = (parseInt(cropImage.style.height) - zoomHeight) + 'px';

                cropImage.style.width = newPrevImgWidth;
                cropImage.style.height = newPrevImgHeight;
                cropPreviewImage.style.width = newPrevImgWidth;
                cropPreviewImage.style.height = newPrevImgHeight;
            });

            document.getElementsByTagName('body')[0].appendChild(cropContainer);
        };
        reader.readAsArrayBuffer(selFile);

    }
});

///////////////////////////////////////////////////