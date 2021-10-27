function pluginIdent(pluginUri: string) {
	return "_" + pluginUri.replace(/\./g, "_");
}

function pluginChunk(pluginUri: string) {
	return pluginUri + ".js";
}

function loadPluginChunk(pluginUri: string, callback: any) {
	loadScript(pluginChunk(pluginUri), callback);
}

function loadScript(url: string, callback: any) {
	const script = document.createElement("script");
	script.src = url;
	script.onload = function() {
		document!.head!.removeChild(script);
		if (callback) {
			callback();
		}
	};
	document!.head!.appendChild(script);
}

export function loadPlugin(pluginUri: string) {
	return new Promise<void>((resolve, _reject) => {
		loadPluginChunk(pluginUri, () => {
			resolve();
		});
	});
}

export function loadPlugins(pluginUris: string[]) {
	const p = pluginUris.map(t => {
		return loadPlugin(t);
	});
	return Promise.all(p);
}
