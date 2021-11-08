import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Geolocation } from '@capacitor/geolocation';
import { Network } from '@capacitor/network';
import { StatusBar } from '@capacitor/status-bar';
import { Toast } from '@capacitor/toast';
import { Share } from '@capacitor/share';
import { Keyboard } from '@capacitor/keyboard';
import { App } from '@capacitor/app';
import { Clipboard } from '@capacitor/clipboard';

export const MobileShimActions = {
	"State": {
		"MOBILE_INIT": "MOBILE_INIT",
		"MOBILE_CAMERA": "MOBILE_CAMERA",
		"MOBILE_GPS": "MOBILE_GPS",
		"MOBILE_FILEPICKER": "MOBILE_FILEPICKER",
		"MOBILE_ON_LOADED": "MOBILE_ON_LOADED",
		"MOBILE_BEFORE_NAVIGATE_BACK": "MOBILE_BEFORE_NAVIGATE_BACK",
		"MOBILE_NAVIGATE_BACK": "MOBILE_NAVIGATE_BACK",
		"MOBILE_BEFORE_SHOW_TOAST_MESSAGE": "MOBILE_BEFORE_SHOW_TOAST_MESSAGE",
		"MOBILE_SHOW_TOAST_MESSAGE": "MOBILE_SHOW_TOAST_MESSAGE",
		"MOBILE_BEFORE_NETWORK_STATE": "MOBILE_BEFORE_NETWORK_STATE",
		"MOBILE_NETWORK_STATE": "MOBILE_NETWORK_STATE",
		"MOBILE_BEFORE_APPSTATE": "MOBILE_BEFORE_APPSTATE",
		"MOBILE_APPSTATE": "MOBILE_APPSTATE",
		"MOBILE_KEYBOARD_SHOW": "MOBILE_KEYBOARD_SHOW",
		"MOBILE_KEYBOARD_HIDE": "MOBILE_KEYBOARD_HIDE",
		"MOBILE_SCAN_QR": "MOBILE_SCAN_QR",
	},
	MobileUpdateQRStatus: "MobileUpdateQRStatus",
	MobileAppState: "MobileAppState"

};
const AppActions = {
	NAVIGATE_HISTORY: "NAVIGATE_HISTORY",
};

export function doMobileInit() {
	return (_, dispatch, transition) => {
		transition({
			type: MobileShimActions.State.MOBILE_ON_LOADED
		});
	};
}

function getBase64Data(data) {
	return data.base64String ? data.base64String : data.base64Data ? data.base64Data.split(",")[1] : null;
}

export function doMobileCamera(event) {
	return async (_, dispatch, transition) => {
		const { quality, allowEditing, source, isBase64, isWebPath } = event;
		const src = source !== undefined ? source : "Prompt" //can Prompt, Photos, Camera
		transition({
			type: MobileShimActions.State.MOBILE_ON_LOADED,
		});
		try {
			const image = await Camera.getPhoto({
				quality: quality,
				allowEditing: allowEditing !== undefined ? allowEditing : false,
				resultType: isBase64 ? CameraResultType.Base64 : CameraResultType.Uri,
				source: CameraSource[src]
			});
			// image.webPath will contain a path that can be set as an image src. You can access
			// the original file using image.path, which can be passed to the Filesystem API to
			// read the raw data of the image, if desired (or pass resultType: CameraResultType.Base64 to getPhoto)

			// image.webPath gives the path
			// image.base64Data gives the base64 data if cameraResultType is base64
			event.onOK.call(null, image !== undefined ? isBase64 ? getBase64Data(image) : isWebPath ? image.webPath : image.path : null);
		} catch (e) {
			if (event.onError) {
				event.onError(e);
			}
		}
	};
}

export function doMobileGetCurrentPosition(event) {
	const { onData } = event;
	return async (_, dispatch, transition) => {
		try {
			const coordinates = await Geolocation.getCurrentPosition();
			transition({
				type: MobileShimActions.State.MOBILE_ON_LOADED
			});
			if (onData) {
				onData(coordinates);
			}
		} catch (e) {
			transition({
				type: MobileShimActions.State.MOBILE_ON_LOADED
			});
			if (event.onError) {
				event.onError(e);
			}
		}
	};
}

export function doMobileKeyboardShow() {
	return async (_, dispatch, transition) => {
		transition({
			type: MobileShimActions.State.MOBILE_ON_LOADED
		});
		Keyboard.show();
	};
}

export function doMobileKeyboardHide() {
	return async (_, dispatch, transition) => {
		Keyboard.hide();
		transition({
			type: MobileShimActions.State.MOBILE_ON_LOADED
		});
	};
}

export function doMobileBeforeNavigateBack(event) {
	return async (_, dispatch, transition) => {
		transition({
			type: MobileShimActions.State.MOBILE_NAVIGATE_BACK,
			move: event.canGoBack ? "back" : undefined,
		});
	};
}

export function doMobileNavigateBack(event) {
	return async (_, dispatch, transition) => {
		const { move } = event;
		transition({
			type: MobileShimActions.State.MOBILE_ON_LOADED
		});
		if (move !== undefined) {
			transition({
				type: AppActions.NAVIGATE_HISTORY,
				move: move,
			});
		} else {
			if (window.location.pathname === "/login" || window.location.pathname === "/") {
				const popupData = {
					popupMessage: "Are you sure you want to exit the app?",
					popupType: 2,
					onOk: () => {
						App.exitApp();
					},
					onCancel: {
						type: "HIDE_POPUP",
					},
				};
				transition({
					type: "SHOW_POPUP",
					event: popupData,
				});
			} else {
				window.history.replaceState({}, "", "/");
			}
		}
	};
}

export function doMobileShowToastMessage(event) {
	const { toastMessage, duration, position } = event;
	return async (_, dispatch, transition) => {
		transition({
			type: MobileShimActions.State.MOBILE_ON_LOADED
		});
		showToast(toastMessage, duration, position);

	};
}

async function showToast(toastMessage, duration, position) {
	try {
		await Toast.show({
			text: toastMessage,
			duration: duration ? duration : "short",
			position: position ? position : "bottom"
		});
	} catch (e) {
		throw e;
	}
}

export function doMobileBeforeNetworkState(event) {
	return async (getState, dispatch, transition) => {
		transition({
			type: MobileShimActions.State.MOBILE_NETWORK_STATE,
			networkStatus: event.status
		});
	};
}
export function doMobileNetworkState(event) {
	const { onData, networkStatus } = event;
	return async (_, dispatch, transition) => {
		try {
			let status;
			if (networkStatus !== undefined && networkStatus !== null) {
				status = {
					...networkStatus
				}
			} else {
				status = await Network.getStatus();
			}
			transition({
				type: MobileShimActions.State.MOBILE_ON_LOADED
			});
			if (onData) {
				onData(status);
			}
		} catch (e) {
			transition({
				type: MobileShimActions.State.MOBILE_ON_LOADED
			});
			if (evt.onError) {
				evt.onError(e);
			}
		}
	};
}

export function doMobileBeforeAppState(isActive) {
	return async (getState, dispatch, transition) => {
		transition({
			type: MobileShimActions.State.MOBILE_APPSTATE,
			isActive,
		});
	};
}

export function doMobileAppState(isAppActive) {
	return async (getState, dispatch, transition) => {
		transition({
			type: MobileShimActions.State.MOBILE_ON_LOADED
		});
		dispatch(updateAppState(isAppActive));
	};
}

function updateAppState(isAppActive) {
	return {
		type: MobileShimActions.MobileAppState,
		isAppActive
	};
}

export function doMobileReadFile(evt) {
	return async (getState, dispatch, transition) => {
		// move to onloaded early so other transitions can be invoked
		const { dir } = evt; //dir can be Documents, Data, Cache, External, ExternalStorage
		const readDir = dir !== undefined && dir !== null ? dir : "Documents";
		const readFileAsPath = evt.readFileAsPath !== undefined ? evt.readFileAsPath : false;
		const readFileUri = evt.readFileUri !== undefined ? evt.readFileUri : false;
		transition({
			type: MobileShimActions.State.MOBILE_ON_LOADED
		});
		if (readFileAsPath === true) {
			try {
				let contents = await Filesystem.readFile({
					path: evt.path, //has to be full path
				});
				evt.getData.call(null, contents);
			} catch (e) {
				if (evt.onError) {
					evt.onError(e);
				}
			}
		} else {
			if (readFileUri === true) {
				try {
					const result = await Filesystem.getUri({
						directory: Directory[readDir],
						path: evt.path
					});
					evt.getData.call(null, { path: result.uri });
				} catch (e) {
					if (evt.onError) {
						evt.onError(e);
					}
				}
			} else {
				try {
					let contents = await Filesystem.readFile({
						path: evt.path,
						directory: Directory[readDir],
					});
					evt.getData.call(null, contents);
				} catch (e) {
					if (evt.onError) {
						evt.onError(e);
					}
				}
			}
		}
	};
}

export function doMobileWriteFile(evt) {
	return async (getState, dispatch, transition) => {
		const { dir } = evt; //dir can be Documents, Data, Cache, External, ExternalStorage
		const writeDir = dir !== undefined && dir !== null ? dir : "Documents";
		Filesystem.writeFile({
			path: evt.path,
			data: evt.data,
			directory: Directory[writeDir],
		});
		transition({
			type: MobileShimActions.State.MOBILE_ON_LOADED
		});
	};
}

export function doMobileMakeDirectory(evt) {
	return async (getState, dispatch, transition) => {
		const { dir, path, isRecursive } = evt; //dir can be Documents, Data, Cache, External, ExternalStorage
		const parentDir = dir !== undefined && dir !== null ? dir : "Documents";
		try {
			await Filesystem.mkdir({
				path: path,
				directory: Directory[parentDir],
				recursive: isRecursive !== undefined ? isRecursive : false
			});
		} catch (e) {
			if (evt.onError) {
				evt.onError(e);
			}
		}
		transition({
			type: MobileShimActions.State.MOBILE_ON_LOADED
		});
	};
}

export function doMobileReadDirectory(evt) {
	return async (getState, dispatch, transition) => {
		const { dir } = evt; //dir can be Documents, Data, Cache, External, ExternalStorage
		const readDir = dir !== undefined && dir !== null ? dir : "Documents";
		try {
			const result = await Filesystem.readdir({
				path: evt.path,
				directory: Directory[readDir],
			});
			evt.getData.call(null, result);
		} catch (e) {
			if (evt.onError) {
				evt.onError(e);
			} else {
				evt.getData.call(null, undefined);
			}
		}
		transition({
			type: MobileShimActions.State.MOBILE_ON_LOADED
		});
	};
}

export function doMobileOpenFile(evt) {
	return async (getState, dispatch, transition) => {
		transition({
			type: MobileShimActions.State.MOBILE_ON_LOADED
		});
		if (window.cordova.plugins.fileOpener2) {
			window.cordova.plugins.fileOpener2.open(evt.path, evt.mimeType,
				{
					error: function (e) {
						evt.onError.call(null, e);
					},
					success: function () {
						console.log('file opened successfully');
					}
				});
		}
	};
}

export function doMobileStatusBar(event) {
	return async (_, dispatch, transition) => {
		if (event.isShow === undefined || !event.isShow) {
			StatusBar.hide();
		} else {
			StatusBar.show();
		}
		transition({
			type: MobileShimActions.State.MOBILE_ON_LOADED
		});
	};
}

export function doMobileScanQR(evt) {
	const { onData } = evt;
	return async (getState, dispatch, transition) => {
		transition({
			type: MobileShimActions.State.MOBILE_ON_LOADED
		});
		if (window.QRScanner) {
			window.QRScanner.prepare((err, status) => {
				if (err) {
					if (evt.onError) {
						evt.onError(err)
					}
					console.error(err);
				}
				if (status.authorized) {
					window.QRScanner.show((status) => {
						const bodyStyle = window.document.body;
						const computedStyle = window.getComputedStyle(bodyStyle)
						window.document.body.style.opacity = 0;
						dispatch({ type: MobileShimActions.MobileUpdateQRStatus, isQREnabled: true, bodyStyle: computedStyle });
						window.QRScanner.scan((err, batchId) => {
							if (err) {
								console.error(err);
								if (evt.onError) {
									evt.onError(err)
								}
							} else {
								window.document.body.style.opacity = 1;
								window.QRScanner.destroy();
								window.QRScanner.hide();
								if (onData) {
									onData(batchId);
								}
								dispatch({ type: MobileShimActions.MobileUpdateQRStatus, isQREnabled: false, bodyStyle: computedStyle });
								window.document.body.style = computedStyle;
							}
						});
					});
				} else if (status.denied) {
					console.error("click Allow to access camera to scan");
				}
			});
		} else {
			console.error("Cordova plugin not installed properly")
		}
	};
}
export function doUpdateQRStatus(evt) {
	return async (getState, dispatch, transition) => {
		const { isQREnabled } = evt;
		transition({
			type: MobileShimActions.State.MOBILE_ON_LOADED
		});
		dispatch({
			type: MobileShimActions.MobileUpdateQRStatus,
			isQREnabled
		});
	}
}

export function doMobileShare(evt) {
	return async (getState, dispatch, transition) => {
		console.log(evt);
		transition({
			type: MobileShimActions.State.MOBILE_ON_LOADED
		});
		try {
			await Share.share({
				title: evt.title,
				text: evt.text,
				url: evt.url,
				dialogTitle: evt.dialogTitle,
			});
		} catch (e) {
			throw e;
		}
	};
}


export function doMobileClipBoard(evt) {
	return async (getState, dispatch, transition) => {
		try {
			transition({
				type: MobileShimActions.State.MOBILE_ON_LOADED
			});
			await Clipboard.write({
				string: evt.value
			})
		} catch (e) {
			throw e;
		}
	}
}