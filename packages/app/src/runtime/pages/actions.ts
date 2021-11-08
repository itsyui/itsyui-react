import { WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory, IAppSchemaProvider } from "@itsy-ui/core";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
const schemaProvider = dataLoader.getLoader<IAppSchemaProvider>("appSchemaProvider");
const pageBindProvider: any = dataLoader.getLoader("pageBindProvider");
const customStateProvider: any = dataLoader.getLoader("customStateProvider");

export const PageWidgetActions = {
	LoadPage: "PageWidgetActions.LoadPage",
	UpdateCurrentPage: "PageWidgetActions.UpdateCurrentPage",
	UpdateContextObjectData: "PageWidgetActions.UpdateContextObjectData",
	State: {
		PAGE_INIT_LOAD: "PAGE_INIT_LOAD",
		PAGE_LOADED: "PAGE_LOADED",
	},
};

export function doPageInit(event: any) {
	return async (_, _dispatch, transition) => {
		const { params } = event;
		transition({
			type: PageWidgetActions.State.PAGE_INIT_LOAD,
			params,
		});
	}
}

function getDeviceType() {
	const ua = navigator.userAgent;
	if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
		return "tablet";
	}
	if (
		/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
			ua
		)
	) {
		return "mobile";
	}
	return "desktop";
};

function isMobileOrTablet() {
	const deviceType = getDeviceType();
	return deviceType === "mobile" || deviceType === "tablet";
}

function getPageBasedOnCurrentPlatform(pages: any, pageId: string) {
	if (pages[pageId] === undefined || pages[pageId] === null) {
		return null;
	}

	let pageData = pages[pageId];
	if (isMobileOrTablet()) {
		const mobilePageId = `${pageId}_mobile`;
		if (pages[mobilePageId]) {
			pageData = pages[mobilePageId]["data"] !== undefined ? pages[mobilePageId]["data"] : pages[mobilePageId];
		} else {
			pageData = pages[pageId]["data"] !== undefined ? pages[pageId]["data"] : pages[pageId];
		}
	} else {
		pageData = pages[pageId]["data"] !== undefined ? pages[pageId]["data"] : pages[pageId];
	}

	return pageData;
}

export function doPageInitLoad(params: any) {
	return async (_, dispatch, transition) => {
		const path = params.pagesPath ? params.pagesPath : "/app/pages";
		const pages = await schemaProvider.getSchema(path);
		let currentPage = null, objectData = {};
		const pagesData = {};
		if (pages !== undefined && pages !== null && Object.keys(pages).length > 0) {
			if (params.pageId) {
				if (pages[params.pageId]) {
					const pageJSON = getPageBasedOnCurrentPlatform(pages, params.pageId);//pages[params.pageId]["data"];
					currentPage = pageJSON;
					pagesData[params.pageId] = pageJSON;
				}
			} else if (params.pageSchema) {
				currentPage = params.pageSchema;
				pagesData[params.pageSchema.id] = params.pageSchema;
			} else {
				for (const pageID in pages) {
					// state will not have "data", that is only available in getState
					const pageJSON = getPageBasedOnCurrentPlatform(pages, pageID); //pages[pageID]["data"] !== undefined ? pages[pageID]["data"] : pages[pageID];
					if (params.pathName) {
						const appId = params.appId;
						const urlPaths = params.basePath ? appId ? params.pathName.split(`/${params.basePath}/${appId}`) : params.pathName.split(`/${params.basePath}`) : params.pathName.split('/r');
						const url = urlPaths.length > 1 ? urlPaths[1] : urlPaths[0];
						if (url === pageJSON["url"]) {
							currentPage = pageJSON;
							if (Object.keys(params.queryParams).length > 0) {
								pageJSON.queryParams && pageJSON.queryParams.forEach(element => {
									objectData = params.queryParams[element["queryParamName"]];
								});
							}
						}
						pagesData[pageID] = pageJSON;
					}
				}
			}
		} else if (params && params.pageSchema) {
			currentPage = params.pageSchema;
			pagesData[params.pageSchema.id] = params.pageSchema;
		}

		if (currentPage === null) {
			// fetch again using pageID as key to make sure if there
			// are other loaders that use this logic to fetch from DB or external source"
			const paths = params.pathName.split("/");
			const appIndex = params.basePath ? paths.findIndex(x => x === params.basePath) : -1;
			const appId = appIndex > -1 ? paths[appIndex + 1] : null;
			const urlPaths = params.basePath ? appId ? params.pathName.split(`/${params.basePath}/${appId}`) : params.pathName.split(`/${params.basePath}`) : params.pathName.split('/r');
			const url = params.pageId ? `/${params.pageId}` : urlPaths.length > 1 ? urlPaths[1] : urlPaths[0];
			if (!isMobileOrTablet()) {
				currentPage = await schemaProvider.getSchema(`${path}${url}/data`);
			} else {
				// check for mobile path
				currentPage = await schemaProvider.getSchema(`${path}${url}_mobile/data`);
				if (currentPage === null) {
					// load default path otherwise
					currentPage = await schemaProvider.getSchema(`${path}${url}/data`);
				}
			}

			if (currentPage !== undefined && currentPage !== null) {
				const pageId = url && url.startsWith("/") ? url.substring(1) : currentPage["id"]
				pagesData[pageId] = currentPage;
			}
		}

		registerOrRemoveCurrentPageCustomState(currentPage, params.queryParams);
		transition({
			type: "HIDE_INDICATOR",
		});
		dispatch({
			type: PageWidgetActions.LoadPage,
			pages: pagesData,
			currentPage: currentPage,
			objectData: objectData,
			urlParams: params,
			pagesPath: path,
		});
		transition({
			type: PageWidgetActions.State.PAGE_LOADED,
		})
	};
}

const getSchemaId = (key: any, schemaId: any) => {
	if (schemaId) {
		switch (key) {
			case "GridWidget":
				return { "gridSchemaId": schemaId };
			case "FormWidget":
				return { "formSchemaId": schemaId };
			case "SearchWidget":
			case "FilterbarPanel":
				return { "gridSchemaId": schemaId };
			default:
				return { "schemaId": schemaId };
		}
	}

	return undefined;
}

const getWidgetSchemaId = (widget) => {
	if (widget) {
		switch (widget) {
			case "GridWidget":
			case "SearchWidget":
			case "FilterbarPanel":
				return "gridSchemaId";
			case "FormWidget":
				return "formSchemaId";
			default:
				return "schemaId";
		}
	}

	return undefined;
}

function registerOrRemoveCurrentPageCustomState(currentPage, queryParams, isRegister = true) {
	if (currentPage === undefined || currentPage === null) {
		return;
	}

	if (currentPage.pageBinding) {
		for (const keys in currentPage.pageBinding) { // registering customState
			for (const featureKey in currentPage.pageBinding[keys]) {
				const curFeature = currentPage.pageBinding[keys][featureKey];
				const feature = curFeature.name;
				const currentState = pageBindProvider.getSchema(curFeature.provider, feature);
				let customState = currentState;
				if (currentState && typeof currentState === "function") {
					customState = currentState(currentPage, curFeature);
				}
				if (customState && curFeature.provider) {
					let featureContextPath;
					if (curFeature.providerId) {
						let providerWidget = currentPage["components"][curFeature["providerId"]];
						let schemaIdKey = "schemaId";
						providerWidget = !providerWidget ? getChildWidget(curFeature["providerId"], currentPage["components"]) : providerWidget;
						if (providerWidget) {
							schemaIdKey = getWidgetSchemaId(curFeature.provider);
							const { bounded, queryParamsTypeId, queryParamsSchemaId } = providerWidget.properties;
							if (bounded && queryParamsTypeId && queryParamsSchemaId) { // if bounded widget and queryParamsTypeId there in providerWidget means get from url queryParams 
								featureContextPath = { "typeId": queryParams[queryParamsTypeId], ...getSchemaId(curFeature.provider, queryParams[queryParamsSchemaId] ? queryParams[queryParamsSchemaId] : null) }
							} else { // otherwise get from components
								if (providerWidget.properties["typeId"] && providerWidget.properties[schemaIdKey]) {
									featureContextPath = { "typeId": providerWidget.properties["typeId"], ...getSchemaId(curFeature.provider, providerWidget.properties[schemaIdKey]) }
								} else { // typeId and schemaId not there, then add widget name to context path
									featureContextPath = { "widgetId": providerWidget.name }
								}
							}
						}
					} else if (curFeature.providerTypeId) {
						featureContextPath = { "typeId": curFeature.providerTypeId, ...getSchemaId(curFeature.provider, curFeature.providerSchemaId) }
					} else { // if curFeature.providerId === "" && curFeature.providerTypeId === "" && curFeature.providerSchemaId === ""
						let widget = currentPage["components"][keys];
						let schemaIdKey = "schemaId";
						widget = !widget ? getChildWidget(keys, currentPage["components"]) : widget;
						if (widget) {
							schemaIdKey = widget.properties["ui:widget"] === "grid" || widget.properties["ui:widget"] === "itsy:grid" ? "gridSchemaId" : "formSchemaId";
							const { bounded, queryParamsTypeId, queryParamsSchemaId } = widget.properties;
							if (bounded && queryParamsTypeId && queryParamsSchemaId) { // if bounded widget queryParamsTypeId there in widget means get from url queryParams
								featureContextPath = { "typeId": queryParams[queryParamsTypeId], ...getSchemaId(curFeature.provider, queryParams[queryParamsSchemaId] ? queryParams[queryParamsSchemaId] : null) };
							} else { // otherwise get from components
								featureContextPath = { "typeId": widget.properties["typeId"], ...getSchemaId(curFeature.provider, widget.properties[schemaIdKey]) }
							}
						}
					}
					const context = featureContextPath ? { ...featureContextPath, ...{ pageId: currentPage.id } } : currentPage.contextPath;

					if (isRegister) { // registerCustomStateMachine
						customStateProvider.registerCustomStateMachine(curFeature.provider, context, customState);
					} else { // removing customStateMachine
						customStateProvider.removeCustomStateMachine(curFeature.provider, context, customState);
					}
				} else {
					console.info(`${feature} custom state machine not found`);
				}
			}
		}
	}
}

function getChildWidget(id: string, components: any) {
	if (id && components) {
		for (const component in components) {
			const items = components[component]["properties"]["items"];
			if (items) {
				let item = items.find(item => item.name === id);
				item = item ? { ...item, ...{ properties: item["content"] } } : item;
				item && delete item["content"];
				return item;
			}
		}
	}
	return {};
}

export function doLoadPage(evt: any) {
	return (getState, _dispatch, transition) => {
		const { pages } = getState();
		const shouldLoadDefaultPage = evt.pageID === undefined;
		if (shouldLoadDefaultPage) {

		} else {
			const isPageAlreadyLoaded = evt.pageID !== undefined && pages[evt.pageID] !== undefined;
			if (!isPageAlreadyLoaded) {

			}
		}

		transition({
			type: "PAGE_LOADED",
		});
	};
}

export function doPageGetState(onData: any) {
	return (getState, _dispatch, transition) => {
		transition({
			type: "PAGE_LOADED",
		});
		const pageState = getState();
		onData.call(null, pageState);
	};
}

export function doPageUpdateContext(evt: any) {
	return (getState, dispatch, transition) => {
		const { pages, currentPage } = getState();
		if (evt.data && evt.data.length > 0) {
			dispatch({
				type: PageWidgetActions.LoadPage,
				pages: pages,
				currentPage: currentPage
			});
		}
		transition({
			type: "PAGE_LOADED",
		});
	};
}

export function doUpdatePageContextObject(evt: any) {
	return (_getState, dispatch, _transition) => {
		dispatch({
			type: PageWidgetActions.UpdateContextObjectData,
			objectData: evt.data
		});
	};
}

export function onRemoveStateMachine(currentPage: any, urlParams: any) {
	return (_getState, dispatch, _transition) => {
		dispatch(registerOrRemoveCurrentPageCustomState(currentPage, urlParams && urlParams["queryParams"] ? urlParams["queryParams"] : {}, false));
	};
}