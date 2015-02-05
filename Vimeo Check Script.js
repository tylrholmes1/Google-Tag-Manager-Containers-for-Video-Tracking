function () {
    for (var e = document.getElementsByTagName('iframe'), x = e.length; x--;)
        if (/player.vimeo.com\/embed/.test(e[x].src)) return true;
    return false;
}