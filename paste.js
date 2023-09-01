// @author       Sebastian Haas
// @namespace    http://sebastianhaas.de

// Modified by MrHencke

document.querySelector('.editor').addEventListener('paste', async (e) => {
	const images = getClipboardImages(e);
	if (images.length === 0) return;
	for (const image of images) {
		const hash = await sha256FromImage(image);
		uploadImage(image, hash);
		const insertText = getInsertText(hash);
		const cursorPos =
			window.wrappedJSObject._ide.editorManager.$scope.editor.sharejs_doc.cm6.view.state
				.selection.ranges[0].from;

		window.wrappedJSObject._ide.editorManager.$scope.editor.sharejs_doc.cm6.cmInsert(
			cursorPos,
			insertText
		);

		const endOfCaptionText = cursorPos + insertText.length - 14;

		window.wrappedJSObject._ide.editorManager.$scope.editor.sharejs_doc.cm6.view.dispatch({
			selection: { head: endOfCaptionText - 7, anchor: endOfCaptionText },
		});
	}
});

const getInsertText = (hash) => {
	return `\\begin{figure}[h!]
	\\centering
	\\includegraphics[width=0.66\\textwidth]{assets/${hash}.png}
	\\caption{Caption}
	\\label{fig:${hash}}
\\end{figure}`;
};

const getClipboardImages = (event) => {
	const images = [];
	if (!event.clipboardData) return images;
	const items = event.clipboardData.items;
	if (!items) return images;
	for (let i = 0; i < items.length; i++)
		if (items[i].type.startsWith('image')) images.push(items[i].getAsFile());
	return images;
};

const uploadImage = (imageBlob, hash) => {
	try {
		var xhr = new XMLHttpRequest();
		var url = `https://${document.location.host}${
			document.location.pathname
		}/upload?folder_id=${
			window.wrappedJSObject._ide.fileTreeManager.findEntityByPath('assets').id
		}&_csrf=${window.wrappedJSObject.csrfToken}`;
		let formData = new FormData();
		formData.append('qqfile', imageBlob, hash + '.png');
		formData.append('relativePath', null);
		formData.append('name', hash + '.png');
		formData.append('type', 'image/png');
		xhr.open('POST', url, true);
		xhr.send(formData);
	} catch (e) {
		console.log(e);
	}
};

const checkAndCreateAssetsFolder = () => {
	if (!window.wrappedJSObject._ide.fileTreeManager.findEntityByPath('assets')) {
		try {
			window.wrappedJSObject._ide.fileTreeManager.createFolder('assets', '/');
		} catch (e) {
			console.log(e);
		}
	}
};

const sha256FromImage = async (image) => {
	var reader = new FileReader();
	reader.readAsBinaryString(image);
	return await new Promise(
		(resolve) =>
			(reader.onloadend = async () => {
				const hash = (await sha256(reader.result)).substring(0, 10);
				resolve(hash);
			})
	);
};

const sha256 = async (message) => {
	const encoder = new TextEncoder();
	const data = encoder.encode(message);
	const hash = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hash));
	const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
	return hashHex;
};

(() => {
	try {
		const retry = setInterval(() => {
			if (!window.wrappedJSObject._ide.editorManager.$scope.editor.sharejs_doc.cm6) return;
			clearInterval(retry);
			checkAndCreateAssetsFolder();
		}, 2000);
	} catch (e) {
		console.log(e);
	}
})();
