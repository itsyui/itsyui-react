import { WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory, IAppSchemaProvider, IAuthService, ILocaleLoader, IResourceLoader } from "@itsy-ui/core";

export const AppActions = {
	State: {
		APP_INIT: "APP_INIT",
		LOAD_RESOURCES: "LOAD_RESOURCES",
		PRE_LOAD_RESOURCES: "PRE_LOAD_RESOURCES",
		LOAD_LANGUAGE: "LOAD_LANGUAGE",
		LOAD_APP_SCHEMA: "LOAD_APP_SCHEMA",
		AUTH_SUCCESS: "AUTH_SUCCESS",
		AUTH_FAILURE: "AUTH_FAILURE",
		USER_AUTHENTICATED: "USER_AUTHENTICATED",
		USER_REQUIRE_AUTHENTICATE: "USER_REQUIRE_AUTHENTICATE",
		APP_READY: "APP_READY",
		DONE: "DONE",
		RESOURCES_READY: "RESOURCES_READY",
		NAVIGATE_URL: "NAVIGATE_URL",
		LANGUAGE_CHANGE_DONE: "LANGUAGE_CHANGE_DONE",
		USER_AUTHENTICATE_REQUIRED: "USER_AUTHENTICATE_REQUIRED",
	},
	AppSchema: "AppActions.AppSchema",
	UserAuthenticated: "AppActions.UserAuthenticated",
	AuthPageState: {
		Init: "AppActions.AuthPageState.Init",
		Login: "AppActions.AuthPageState.Login",
		Home: "AppActions.AuthPageState.Home",
	},
	NavigateURL: "AppActions.NavigateURL",
	UpdateMessageJson: "AppActions.UpdateMessageJson",
};

export function onUserAuthenticated(isUserLoggedIn: boolean): any {
	return {
		type: AppActions.UserAuthenticated,
		isUserLoggedIn,
	};
}

function navigateToURL(url: string, type: string) {
	return {
		type,
		url,
	};
}

function getItemFromLocalStorage(key: string) {
	if (typeof Storage !== undefined) {
		const v = localStorage.getItem(key);
		if (v === undefined) {
			return "{}";
		} else {
			return v;
		}
	}

	return "{}";
}

function tryGetUserDecoded(userLocal: string) {
	try {
		const userPass = atob(userLocal).split(":");
		return userPass;
	} catch (error) {
		return [];
	}
}

export function doUserRequireAuthentication() {
	return async (_: any, _dispatch: any, transition: any) => {
		// check if user logged in or not via local storage
		const userBTOA = getItemFromLocalStorage("USER_LOCAL");
		if (userBTOA !== undefined && userBTOA !== null && userBTOA !== "{}") {
			const userPass = tryGetUserDecoded(userBTOA);
			const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
			const authService = dataLoader.getLoader<IAuthService>("auth");
			try {
				const authResult = await authService.authenticate(userPass.length > 0 ? userPass[0] : undefined, userPass.length > 0 ? userPass[1] : undefined, userBTOA);
				if (authResult.isAuthenticated) {
					const authSuccess = { "fromLogin": false, ...authResult };
					transition({
						"type": "AUTH_SUCCESS",
						"authResult": authSuccess,
					});
				} else {
					transition({
						"type": "AUTH_FAILURE",
						error: new Error(JSON.stringify(authResult)),
					});
				}
			} catch (e) {
				transition({
					"type": "AUTH_FAILURE",
					error: e,
				});
			}
		} else {
			transition({
				"type": "AUTH_FAILURE",
			});
		}
	};
}

export function doNavigateToHome(history: any, _action: string) {
	return (getState: any, dispatch: any, transition: any) => {
		transition({ type: AppActions.State.APP_READY });
		// dispatch at the end
		dispatch({
			type: AppActions.AuthPageState.Home,
			isAuthenticated: true,
		});
		const { defaultURL } = getState();
		if (!!defaultURL) {
			history.push(defaultURL);
		}
	};
}

export function doNavigateToLogin(history: any, action: string) {
	return (_, dispatch: any) => {
		history.replace("/login");
		dispatch(navigateToURL(action, AppActions.AuthPageState.Login));
	};
}

export function doNavigateTo(history: any, url: string, persistCurrentUrl: boolean, shouldReplace: boolean) {
	return (getState: any, dispatch: any, transition: any) => {
		// replace history only if its different
		const { initialLocation } = getState();
		if (persistCurrentUrl && initialLocation.pathname !== "/" && initialLocation.pathname !== "/login") {
			// if page is refreshed on the same url
			if (initialLocation.pathname !== history.location.pathname && initialLocation.search !== history.location.search) {
				history.replace(initialLocation);
			}
		} else {
			const uri = new URL(`${window.location.origin}${url}`);
			if (history.location.pathname !== uri.pathname || (history.location.pathname === uri.pathname && history.location.search !== uri.search)) {
				if (shouldReplace !== undefined && shouldReplace) {
					history.replace(url);
				} else {
					history.push(url);
				}

				dispatch({
					type: AppActions.NavigateURL,
					url
				});
			}
		}

		transition({
			type: AppActions.State.DONE,
		});
	};
}

export function doUserAuthenticated(_authResult: any) {
	return (_, _dispatch: any, transition: any) => {
		transition({
			type: AppActions.State.USER_AUTHENTICATED,
		});
	};
}

function updateAppSchema(schema: any, location: any, defaultURL: string) {
	return {
		type: AppActions.AppSchema,
		schema: schema,
		initialLocation: location,
		defaultURL: defaultURL,
	};
}

export function doLanguageChange(language: string) {
	const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
	const localeMsg = WidgetsFactory.instance.services["appStateProvider"];
	const schemaProvider = dataLoader.getLoader<IAppSchemaProvider>("appSchemaProvider");
	const localeLoader = dataLoader.getLoader<ILocaleLoader>("localeLoader");
	return async (getState, dispatch: any, transition: any) => {
		const { authState } = getState();
		localeLoader.registerLocale(language);
		let localeJson = await schemaProvider.getSchema(`/app/locale/${language}`);
		for (const [key, value] of (Object as any).entries(localeJson)) {
			if (typeof value === "object") {
				localeJson = { ...value, ...localeJson };
				delete localeJson[key];
			}
		}
		localeMsg.setLocaleData(localeJson);
		dispatch({
			type: AppActions.UpdateMessageJson,
			jsonData: localeJson,
		});
		if (authState.type === AppActions.AuthPageState.Home) {
			transition({
				type: AppActions.State.LANGUAGE_CHANGE_DONE,
			});
		} else if (authState.type === AppActions.AuthPageState.Login) {
			transition({
				type: AppActions.State.USER_AUTHENTICATE_REQUIRED,
			});
		}
	};
}

export function doAppInit(event: any) {
	return async (_, _dispatch: any, transition: any) => {
		transition({
			type: AppActions.State.LOAD_LANGUAGE,
			location: event.location,
			defaultURL: event.defaultURL
		});
	};
}

export function doLoadLanguageData(event: any) {
	return async (_, dispatch: any, transition: any) => {
		const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
		const localeMsg = WidgetsFactory.instance.services["appStateProvider"];
		const schemaProvider = dataLoader.getLoader<IAppSchemaProvider>("appSchemaProvider");
		const localeLoader = dataLoader.getLoader<ILocaleLoader>("localeLoader");
		if (schemaProvider !== null) {
			const language = localeLoader.getlocale();
			let localeJson = schemaProvider.getSchemaSync(`/app/locale/${language}`);
			localeJson = localeJson ? localeJson : {};
			for (const [key, value] of (Object as any).entries(localeJson)) {
				if (typeof value === "object") {
					localeJson = { ...value, ...localeJson };
					delete localeJson[key];
				}
			}
			localeMsg.setLocaleData(localeJson);
			dispatch({
				type: AppActions.UpdateMessageJson,
				jsonData: localeJson,
			});
		}
		transition({
			type: AppActions.State.PRE_LOAD_RESOURCES,
			location: event.location,
			defaultURL: event.defaultURL
		});
	};
}

export function doPreLoadResources(event: any) {
	return async (_, _dispatch: any, transition: any) => {
		transition({
			type: AppActions.State.LOAD_RESOURCES,
			location: event.location,
			defaultURL: event.defaultURL
		});
	};
}

export function doLoadResources(event: any) {
	return async (_, _dispatch: any, transition: any) => {
		// 1) fetch all resources.json
		// 2) load via JS loader into the UI
		// const appScriptURI = "/lib/app-schema.js";
		// await System.import(appScriptURI);
		const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
		//const appSchemaLoader = dataLoader.getLoader("appSchemaLoader");
		//await appSchemaLoader.load(process.env.ITSY_APP_HREF); // load app-schema.js
		const schemaProvider = dataLoader.getLoader<IAppSchemaProvider>("appSchemaProvider");
		if (schemaProvider !== null) {
			const resourceLoader = dataLoader.getLoader<IResourceLoader>("resourceLoader");
			const resources = await resourceLoader.getResources();
			if (Array.isArray(resources)) {
				for (let i = 0; i < resources.length; i++) {
					await resourceLoader.loadResource(resources[i].name, process.env.ITSY_APP_HREF);
				}
			}

			transition({
				type: AppActions.State.LOAD_APP_SCHEMA,
				location: event.location,
				defaultURL: event.defaultURL
			});
		}
	};
}

export function doLoadAppSchema(event: any) {
	return async (_, dispatch: any, transition: any) => {
		const { location, defaultURL } = event;
		const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
		const schemaProvider = dataLoader.getLoader<IAppSchemaProvider>("appSchemaProvider");
		const appSchema = await schemaProvider.getSchema("/app/data");
		if (appSchema) {
			const { properties } = appSchema;
			let defaultURLString = properties.defaultURL !== undefined ? properties.defaultURL : "";
			if (defaultURLString === "") {
				defaultURLString = defaultURL !== undefined ? defaultURL : "";
			}
			dispatch(updateAppSchema(appSchema, location, defaultURLString));
			// loop and load resources from APP.JSON file
			transition({
				type: AppActions.State.RESOURCES_READY,
			});
		}
	};
}

export function doNavigateToHistory(event: any) {
	return async (_, _dispatch: any, transition: any) => {
		const { move, history } = event;
		if (move === "back") {
			history.goBack();
		} else if (move === "forward") {
			history.goForward();
		} else {
			//need to implement
		}
		transition({
			type: AppActions.State.DONE,
		});
	};
}
