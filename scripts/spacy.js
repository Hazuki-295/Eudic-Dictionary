function removeElements() {
    var header = document.querySelector('.l-header');
    if (header) {
        header.parentNode.removeChild(header)
    }

    var footer = document.querySelector('footer');
    if (footer) {
        footer.parentNode.removeChild(footer);
    }
}

(function () {
    setTimeout(() => {
        removeElements();
    }, 1000);
})();

window.extractHTML = function () {
    // Clone the entire document
    var clone = document.documentElement.cloneNode(true);

    // Create a new document and import the clone to this new document
    var newDoc = document.implementation.createHTMLDocument();
    newDoc.replaceChild(clone, newDoc.documentElement);

    // Remove elements in the clone based on the selector
    var header = newDoc.querySelector('.d-header.d-wrapper.l-wrapper');
    if (header) {
        header.parentNode.removeChild(header);
    }

    return newDoc.querySelector('article').outerHTML;
}