import { useEffect } from 'react';
import { WidgetsFactory, useTransition } from "@itsy-ui/core";
import {
	doMobileInit, doMobileCamera, doMobileGetCurrentPosition, doMobileKeyboardHide, doMobileKeyboardShow
	, doMobileBeforeNavigateBack, doMobileNavigateBack, doMobileShowToastMessage, doMobileBeforeNetworkState, doMobileNetworkState
	, doMobileBeforeAppState, doMobileAppState, doMobileReadFile, doMobileWriteFile, doMobileOpenFile, doMobileStatusBar, doMobileScanQR, doUpdateQRStatus, doMobileShare, doMobileReadDirectory, doMobileMakeDirectory, doMobileClipBoard
} from "./actions";
import reducer from "./reducer"
import { App } from '@capacitor/app';
import { Network } from '@capacitor/network';
import { Keyboard } from '@capacitor/keyboard';

import {
	MobileShimActions
} from "./actions";
import stateJSON from "./state.json";

function MobileShimWidget(props) {
	const [, transition] = useTransition("MobileShimWidget",
		reducer,
		mapDispatchToProps,
		stateJSON
	);
	useEffect(() => {
		transition({
			type: MobileShimActions.State.MOBILE_INIT,
		});
		App.addListener("backButton", (data) => {
			transition({
				type: MobileShimActions.State.MOBILE_BEFORE_NAVIGATE_BACK,
				canGoBack: data.canGoBack,
			});
		});
		App.addListener("appStateChange", (state) => {
			transition({
				type: MobileShimActions.State.MOBILE_BEFORE_APPSTATE,
				isActive: state.isActive,
			});
		});
		Network.addListener("networkStatusChange", (status) => {
			transition({
				type: MobileShimActions.State.MOBILE_BEFORE_NETWORKSTATE,
				status
			});
		});
		Keyboard.addListener('keyboardDidShow', (info) => {
			transition({
				type: MobileShimActions.State.MOBILE_KEYBOARD_SHOW
			});
		});
		Keyboard.addListener('keyboardDidHide', () => {
			transition({
				type: MobileShimActions.State.MOBILE_KEYBOARD_HIDE
			});
		});
	}, []);
	return null;
}

const mapDispatchToProps = (dispatch) => {
	return {
		onMobileInit: (evt) => dispatch(doMobileInit(evt)),
		onMobileCamera: (evt) => dispatch(doMobileCamera(evt)),
		onMobileGPS: (evt) => dispatch(doMobileGetCurrentPosition(evt)),
		onMobileKeyboardShow: (evt) => dispatch(doMobileKeyboardShow()),
		onMobileKeyboardHide: (evt) => dispatch(doMobileKeyboardHide()),
		onMobileBeforeNavigateBack: (evt) => dispatch(doMobileBeforeNavigateBack(evt)),
		onMobileNavigateBack: (evt) => dispatch(doMobileNavigateBack(evt)),
		onMobileShowToastMessage: (evt) => dispatch(doMobileShowToastMessage(evt)),
		onMobileBeforeNetworkState: (evt) => dispatch(doMobileBeforeNetworkState(evt)),
		onMobileNetworkState: (evt) => dispatch(doMobileNetworkState(evt)),
		onMobileBeforeAppState: ({ isActive }) => dispatch(doMobileBeforeAppState(isActive)),
		onMobileAppState: ({ isActive }) => dispatch(doMobileAppState(isActive)),
		onMobileReadFile: (evt) => dispatch(doMobileReadFile(evt)),
		onMobileReadDirectory: (evt) => dispatch(doMobileReadDirectory(evt)),
		onMobileMakeDirectory: (evt) => dispatch(doMobileMakeDirectory(evt)),
		onMobileWriteFile: (evt) => dispatch(doMobileWriteFile(evt)),
		onMobileOpenFile: (evt) => dispatch(doMobileOpenFile(evt)),
		onMobileStatusBar: (evt) => dispatch(doMobileStatusBar(evt)),
		onMobileScanQR: (evt) => dispatch(doMobileScanQR(evt)),
		onUpdateQRStatus: (evt) => dispatch(doUpdateQRStatus(evt)),
		onMobileShare: (evt) => dispatch(doMobileShare(evt)),
		onMobileClipBorad: (evt) => dispatch(doMobileClipBoard(evt))
	};
};

MobileShimWidget["displayName"] = "MobileShimWidget";

WidgetsFactory.instance.registerFactory(MobileShimWidget);
WidgetsFactory.instance.registerControls({
	mobile_shim: "MobileShimWidget",
	"itsy:shim": "MobileShimWidget"
});

export default MobileShimWidget;