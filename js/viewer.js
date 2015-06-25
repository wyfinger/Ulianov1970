/*
   (C) Wyfinger, 2015
 */

var pdffile = 'https://github.com/wyfinger/Ulianov1970/raw/master/main.pdf';//'http://wyfinger.github.io/Ulianov1970/main.pdf';
var scale = 1.5;


var PDF;

function preparePage(page) {
    
    var viewport = page.getViewport(scale);
    
    // Ancor
    var pageAncor = $("<a />", {
        name  : 'page' + page.pageNumber
    });
    $("#pdfContainer").append(pageAncor);

    // Page DIV
    var pageDiv = $("<div />", {
        id    : 'page' + page.pageNumber,
        class : 'page',
        style : 'width:' + Math.ceil(viewport.width+3) + 'px; height:' + Math.ceil(viewport.height+3) + 'px;'
    });
    $("#pdfContainer").append(pageDiv);

    // Annotation DIV
    var pageAnnotation = $("<a />", {
        id    : 'annotation' + page.pageNumber,
        class : 'annotationLayer'
    });
    $("#pdfContainer").append(pageAnnotation);

}

function renderPage(page) {

    var pageNum = page.pageNumber;
    var viewport = page.getViewport(scale);
    var pageCanvas = $("<canvas />")[0];
    var pageContext = pageCanvas.getContext("2d");
    
    pageCanvas.width = viewport.width;
    pageCanvas.height = viewport.height;
        
    $("#page" + pageNum).append(pageCanvas);
    $("#page" + pageNum).addClass('rendered');

    var $textLayerDiv = jQuery("<div />", {
                id    : 'pageText' + pageNum,
                class : 'textLayer',
                style : 'width:' + Math.ceil(viewport.width) + 'px; height:' + Math.ceil(viewport.height) + 'px;'
         }).offset({
            top: pageCanvas.offsetTop-5,
            left:pageCanvas.offsetLeft 
        });

    $("#page" + pageNum).append($textLayerDiv);

    page.getTextContent().then(function (textContent) {
        
        var textLayer = new TextLayerBuilder({
            textLayerDiv : $textLayerDiv.get(0),
            pageIndex    : pageNum-1,
            viewport     : viewport
        });

        textLayer.setTextContent(textContent);
        textLayer.renderLayer;

        var renderContext = {
            canvasContext : pageContext,
            viewport      : viewport,
            textLayer     : textLayer
        };

        page.render(renderContext);

        // My hack
        for (var i = 0; i < textLayer.textDivs.length; i++) {
            $("#pageText" + pageNum).append(textLayer.textDivs[i]);
        }

        //setupAnnotations(page, viewport, pageCanvas, $('.annotation'+pageNum));
        
    });

   /* page.getAnnotations().then(function (annotationContent){
       
        var annotationLayer = new AnnotationsLayerBuilder({
            pageDiv : $("#page" + pageNum),
            pdfPage : page
        });
        
        annotationLayer.setupAnnotations(;

    });*/

   /* var renderContext = {
        canvasContext: pageContext,
        viewport: viewport
    };

    page.render(renderContext);*/

}


function setupAnnotations(page, viewport, canvas, $annotationLayerDiv) {

    var canvasOffset = $(canvas).offset();
    var promise = page.getAnnotations().then(function (annotationsData) {
      viewport = viewport.clone({
        dontFlip: true
      });

      for (var i = 0; i < annotationsData.length; i++) {
        var data = annotationsData[i];
        var annotation = PDFJS.Annotation.fromData(data);
        if (!annotation || !annotation.hasHtml()) {
          continue;
        }

        var element = annotation.getHtmlElement(page.commonObjs);
        data = annotation.getData();
        var rect = data.rect;
        var view = page.view;
        rect = PDFJS.Util.normalizeRect([
          rect[0],
          view[3] - rect[1] + view[1],
          rect[2],
          view[3] - rect[3] + view[1]]);
        element.style.left = (canvasOffset.left + rect[0]) + 'px';
        element.style.top = (canvasOffset.top + rect[1]) + 'px';
        element.style.position = 'absolute';

        var transform = viewport.transform;
        var transformStr = 'matrix(' + transform.join(',') + ')';
        CustomStyle.setProp('transform', element, transformStr);
        var transformOriginStr = -rect[0] + 'px ' + -rect[1] + 'px';
        CustomStyle.setProp('transformOrigin', element, transformOriginStr);

        if (data.subtype === 'Link' && !data.url) {
          // In this example,  I do not handle the `Link` annotations without url.
          // If you want to handle those annotations, see `web/page_view.js`.
          continue;
        }
        $annotationLayerDiv.append(element);
      }
    });
    return promise;
}

function preparePages(pdf){

    PDF = pdf;

    for (var i = 1; i <= PDF.numPages; i++) {
       PDF.getPage(i).then(preparePage);
    }
    var three = 3;
    if (PDF.numPages < 3) three = PDF.numPages
    for (var i = 1; i <= three ; i++) {
       PDF.getPage(i).then(renderPage);
    }

}

window.onload = function (){

    //PDFJS.disableWorker = true;
    var pdf = PDFJS.getDocument(pdffile).then(preparePages);
    
}

window.onscroll = function() {
  
    if (PDF == null) return;
    var bottomOffset = (window.pageYOffset || document.documentElement.scrollTop) + window.innerHeight;
    for (var i = PDF.numPages; i >= 1; i--) {
        var pageDiv = $("#page" + i);
        if (pageDiv.offset().top < bottomOffset) {
            for (var j = i-2; j < i+2; j++) {                
                if ((j <= PDF.numPages) & ($("#page" + j).hasClass('rendered') == false)) {
                    PDF.getPage(j).then(renderPage); 
                }  
            }        
            break;
        }
    }

}

/*
window.onload = function () {


    
    var scale = 1.5; //Set this to whatever you want. This is basically the "zoom" factor for the PDF.

    function loadPdf(pdfData) {
        //PDFJS.disableWorker = true; //Not using web workers. Not disabling results in an error. This line is
        //missing in the example code for rendering a pdf.

        var pdf = PDFJS.getDocument(pdfData);
        pdf.then(renderPdf);
    }

    function renderPdf(pdf) {
        for (var i = 1; i<=pdf.numPages; i++) {
            pdf.getPage(i).then(renderPage);
        }
    }

    function renderPage(page) {
        var viewport = page.getViewport(scale);
        var $canvas = jQuery("<canvas></canvas>");

        //Set the canvas height and width to the height and width of the viewport
        var canvas = $canvas.get(0);
        var context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        //Append the canvas to the pdf container div
        var $pdfContainer = jQuery("#pdfContainer");
        //$pdfContainer.css("height", canvas.height + "px").css("width", canvas.width + "px");
        $pdfContainer.append($canvas);

        var canvasOffset = $canvas.offset();
        var $textLayerDiv = jQuery("<div />")
            .addClass("textLayer")
            .css("height", viewport.height + "px")
            .css("width", viewport.width + "px")
            .offset({
                top: canvasOffset.top,
                left: canvasOffset.left
            });

        //The following few lines of code set up scaling on the context if we are on a HiDPI display
        var outputScale = getOutputScale();
        if (outputScale.scaled) {
            var cssScale = 'scale(' + (1 / outputScale.sx) + ', ' +
                (1 / outputScale.sy) + ')';
            CustomStyle.setProp('transform', canvas, cssScale);
            CustomStyle.setProp('transformOrigin', canvas, '0% 0%');

            if ($textLayerDiv.get(0)) {
                CustomStyle.setProp('transform', $textLayerDiv.get(0), cssScale);
                CustomStyle.setProp('transformOrigin', $textLayerDiv.get(0), '0% 0%');
            }
        }

        context._scaleX = outputScale.sx;
        context._scaleY = outputScale.sy;
        if (outputScale.scaled) {
            context.scale(outputScale.sx, outputScale.sy);
        }

        $pdfContainer.append($textLayerDiv);

        page.getTextContent().then(function (textContent) {
            var textLayer = new TextLayerBuilder($textLayerDiv.get(0), page-1); //The second zero is an index identifying
            //the page. It is set to page.number - 1.
            textLayer.setTextContent(textContent);

            var renderContext = {
                canvasContext: context,
                viewport: viewport,
                textLayer: textLayer
            };

            page.render(renderContext);
        });
    }

    loadPdf('http://127.0.0.1:8000/pdf/main.pdf');
};
*/
