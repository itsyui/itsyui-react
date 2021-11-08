import { WidgetsFactory } from '@itsy-ui/core';
import {ItsyLoadingOverlay as LoadingOverlay} from '@itsy-ui/feedback';
import {ItsyPopup as Popup} from '@itsy-ui/navigation';
import React from 'react';

const LoginContainer = function container(props) {
	return (
		<>
			<LoadingOverlay key="app-loading-overlay" />
			{props.children}
			<Popup key="app-popup" />
		</>
	);
};

LoginContainer.displayName = 'LoginContainer';

WidgetsFactory.instance.registerFactory(LoginContainer);
WidgetsFactory.instance.registerControls({
	login_container: 'LoginContainer'
});

export default LoginContainer;