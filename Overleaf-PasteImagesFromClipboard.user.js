// ==UserScript==
// @name         Overleaf - Paste Images from Clipboard
// @namespace    http://sebastianhaas.de
// @version      0.5
// @description  Paste images from your clipboard directly into Overleaf (Community Edition, Cloud and Pro)
// @author       Sebastian Haas
// @match        https://www.overleaf.com/project/*
// @match        http://192.168.100.239/project/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/crypto-js.js
// @grant        none
// ==/UserScript==

// Parse images from the clipboard
function retrieveImageFromClipboardAsBlob(pasteEvent, callback){
    if(pasteEvent.clipboardData == false){
        if(typeof(callback) == "function"){
            callback(undefined);
        }
    };

    var items = pasteEvent.clipboardData.items;

    if(items == undefined){
        if(typeof(callback) == "function"){
            callback(undefined);
        }
    };

    for (var i = 0; i < items.length; i++) {
        // Skip content if not image
        if (items[i].type.indexOf("image") == -1) continue;
        // Retrieve image on clipboard as blob
        var blob = items[i].getAsFile();

        if(typeof(callback) == "function"){
            callback(blob);
        }
    }
}

// Upload the image blob
function uploadImage(imageBlob,hash){
    try{
        var xhr = new XMLHttpRequest();
        var url = document.location.pathname + "/upload?folder_id=" + _ide.fileTreeManager.findEntityByPath("assets").id + "&_csrf=" + csrfToken;
        let formData = new FormData();
        formData.append("qqfile", imageBlob, hash + ".png");
        xhr.open("POST", url, true);
        //xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var json = JSON.parse(xhr.responseText);
                console.log(json.entity_id + " Asset created :)");
            }
        };
        xhr.send(formData);
    }catch(e)
    {
        console.log(e)
    }
};

function checkAndCreateAssetsFolder(){
    if (_ide.fileTreeManager.findEntityByPath("assets")){
        console.log("Assets folder exists...")
    }
    else {
        console.log("Assets folder does not exist...")
        try {
            _ide.fileTreeManager.createFolder("assets","/");
        } catch(e) {
            console.log(e);
        }
    }
}

// Editor Startup
(function(e) {
    try{
        'use strict';
        // poll until editor is loaded
        const retry = setInterval(() => {
            console.log("Polling...")
            if (window._debug_editors === undefined) return
            clearInterval(retry)
            // get current editor instance
            const editor = window._debug_editors[window._debug_editors.length -1]
            // Create assets folder
            checkAndCreateAssetsFolder();
        }, 1000)
        } catch(e) {
            console.log(e);
        }
})();

// Listen for paste events
document.querySelector('.ace_editor').addEventListener('paste', function(e){
    try {
        // Handle the event
        retrieveImageFromClipboardAsBlob(e, function(imageBlob){
            // Image?
            if(imageBlob){
                checkAndCreateAssetsFolder();
                var reader = new FileReader();
                reader.readAsBinaryString(imageBlob);
                reader.onloadend = function () {
                    var  hash = CryptoJS.SHA256(reader.result).toString().substring(0,8);
                    console.log("Uploading image...")
                    uploadImage(imageBlob,hash);
                    _ide.editorManager.$scope.editor.sharejs_doc.ace.insert("\\begin{figure}[h!]\n\
\t\\centering\n\
\t\\includegraphics[width=0.66\\textwidth]{assets/" + hash + ".png}\n\
\t\\caption{Caption}\n\
\t\\label{fig:_" + hash + "}\n\
\\end{figure}"
                                                                           );
                    _ide.editorManager.$scope.editor.sharejs_doc.ace.selection.moveCursorBy(-2,1);
                    _ide.editorManager.$scope.editor.sharejs_doc.ace.selection.selectWordRight()
                };
            }
        })
    } catch (e) {
        console.log(e);
    }}
                                                      );
