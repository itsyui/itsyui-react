import { WidgetsFactory } from '@itsy-ui/core';
import React from 'react';

const AuthLayout = function AuthLayout(props) {
	return (
		<>
			{props.children}
		</>
	);
};

AuthLayout.displayName = 'AuthLayoutWidget';

WidgetsFactory.instance.registerFactory(AuthLayout);
WidgetsFactory.instance.registerControls({
	auth_layout: 'AuthLayoutWidget',
	'itsy:authlayout': 'AuthLayoutWidget'
});