import { arrayToObjectMap, getDefaultRegistry, LayoutManagerWidget, retrieveSchema, SchemaContainer, UnsupportedField, WidgetsFactory, withReducer } from "@itsy-ui/core";
import {ItsyLoadingOverlay as LoadingOverlay} from '@itsy-ui/feedback';
import {ItsyPopup as Popup} from '@itsy-ui/navigation';
import React, { Component } from "react";
import { Route, Switch, withRouter } from "react-router-dom";
import {
	AppActions,
	doAppInit,
	doLanguageChange, doLoadAppSchema, doLoadLanguageData, doLoadResources, doNavigateTo,
	doNavigateToHistory, doNavigateToHome, doNavigateToLogin,
	doPreLoadResources,
	doUserAuthenticated, doUserRequireAuthentication
} from "./actions";
import "./AppContainer/AppContainer";
import "./AppLoginContainer";
import history from "./history";
import reducer from "./reducer";
import "./app.css";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"];

class AppWidget extends Component {
	componentWillReceiveProps(nextProps) {
		if (nextProps.url) {
			const { pathname, query } = nextProps.url;
			console.log("pathname: " + pathname + "; query: " + query);
		}
	}

	componentWillMount() {
		const { history } = this.props;
		this.unsubscribeFromHistory = history.listen(this.handleLocationChange);
		this.handleLocationChange(history.location);
		if (this.props.transition && !this.props.isUserLoggedIn) {
			this.props.transition({
				type: AppActions.State.APP_INIT,
				location: {
					pathname: history.location.pathname !== undefined ? history.location.pathname : "",
					search: history.location.search !== undefined ? history.location.search : ""
				}
			});
		}
	}

	shouldComponentUpdate(nextProps, nextState) {
		return nextProps.authState !== undefined && nextProps.authState.type !== AppActions.AuthPageState.Init;
	}

	componentWillUnmount() {
		if (this.unsubscribeFromHistory) {
			this.unsubscribeFromHistory();
		}
	}

	handleLocationChange = (location) => {
		console.log('location changed: ', location);
	}

	getSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	getRoutedLayoutElements() {
		const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"];
		const layoutRegistry = dataLoader.getLoader("LayoutRegistry");
		const layoutTypes = layoutRegistry.getAllComponents();
		let layoutRoutes = [];
		if (layoutTypes.length > 0) {
			layoutRoutes = layoutTypes.map(t => {
				const path = `/${t.getName()}`;
				const schema = {
					"name": t.getName(),
					"properties": {
						"ui:widget": t.getName()
					}
				};

				return <Route key={t.getName()} path={path} component={() => <SchemaContainer key={`${t.getName()}-route-container`} schema={schema} />}>
				</Route>;
			});
		}

		return <Switch>
			{layoutRoutes}
		</Switch>;
	}

	render() {
		const localeLoader = dataLoader.getLoader("localeLoader");
		const language = localeLoader.getlocale();
		if (this.props.authState === undefined) {
			return null;
		}

		if (this.props.authState.type === AppActions.AuthPageState.Init) {
			return <>
				<LoadingOverlay key="app-loading-overlay" />
				<Popup key="app-popup" />
			</>;
		} else {
			const { properties } = this.getSchemaProperties();
			if (!properties.hasOwnProperty("regions")) {
				return (
					<UnsupportedField
						schema={null}
						reason="regions"
					/>
				);
			}

			const { regions, layoutType, themeView } = properties;
			const regionViews = arrayToObjectMap(regions, (t) => t.name);
			if (this.props.authState.type === AppActions.AuthPageState.Login) {
				const { login } = properties;
				const loginContainerSchema = {
					name: "Login-container",
					properties: {
						"ui:widget": "login_container",
					}
				};
				login.properties["themeView"] = themeView;
				return <SchemaContainer key="login-container" schema={loginContainerSchema} >
					<SchemaContainer key="login" schema={login} />
					{this.props.children}
				</SchemaContainer>;
			}
			else if (this.props.authState.type === AppActions.AuthPageState.Home) {
				const appContainerSchema = {
					name: "app-container",
					properties: {
						"ui:widget": "appContainer",
						controlID: "app-container",
						regionViews: regionViews,
						layoutType: layoutType,
						themeView: themeView,
						className: this.props.className,
						style: this.props.style
					}
				};
				return <>
					<LoadingOverlay key="app-loading-overlay" />
					<SchemaContainer key="app-container" schema={appContainerSchema}>
						{this.getRoutedLayoutElements()}
					</SchemaContainer>
					<Popup key="app-popup" />
					{this.props.children}
				</>;
			} else {
				return <label>default</label>;
			}
		}
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		onAppInit: (e) => dispatch(doAppInit(e)),
		onPreLoadResources: (e) => dispatch(doPreLoadResources(e)),
		onLoadResources: (e) => dispatch(doLoadResources(e)),
		onLoadAppSchema: (e) => dispatch(doLoadAppSchema(e)),
		onUserRequireAuthenticate: () => dispatch(doUserRequireAuthentication()),
		onNavigateToHome: () => dispatch(doNavigateToHome(history, "home")),
		onNavigateToLogin: () => dispatch(doNavigateToLogin(history, "login")),
		onUserAuthenticated: ({ authResult }) => dispatch(doUserAuthenticated(authResult)),
		onNavigateTo: (event) => dispatch(doNavigateTo(history, event.url, event.persistCurrentUrl, event.shouldReplace)),
		onLanguageChange: (event) => dispatch(doLanguageChange(event.language)),
		onLoadLanguageData: (e) => dispatch(doLoadLanguageData(e)),
		onNavigateToHistory: (event) => dispatch(doNavigateToHistory({ history, ...event })),
	};
};

export const withLayoutManager = WrappedComponent => {
	const Extended = (props) => {
		return <LayoutManagerWidget>
			<WrappedComponent {...props} />
		</LayoutManagerWidget>;
	};

	return Extended;
};

import stateJSON from "./state.json";
const AppWidgetC = withLayoutManager(withReducer("AppWidget", reducer, mapDispatchToProps, stateJSON)(withRouter(AppWidget)));
AppWidgetC.displayName = "AppWidget";

WidgetsFactory.instance.registerFactory(AppWidgetC);
WidgetsFactory.instance.registerControls({
	app: "AppWidget",
	"itsy:app": "AppWidget"
});

export default AppWidgetC;