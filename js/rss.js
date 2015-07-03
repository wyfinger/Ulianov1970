/*
   (C) Wyfinger, 2015
 */
var rsspath = 'https://github.com/wyfinger/Ulianov1970/commits/master.atom';

window.onload = function() {

    $.ajax({
        url: document.location.protocol + '//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=10&callback=?&q=' + encodeURIComponent(rsspath),
        dataType: 'json',
        success: function(data) {
            if (data.responseData.feed && data.responseData.feed.entries) {
                $.each(data.responseData.feed.entries, function(i, e) {
                    var d = new Date(Date.parse(e.publishedDate));
                    d = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
                    var a = $("<a />", {
                        href: e.link,
                        target: "_blank",
                        class: "newsItem",
                        text: d + ' - ' + e.title
                    });
                    $("#rssNews").append(a);
                });
            }
        }
    });
    
}