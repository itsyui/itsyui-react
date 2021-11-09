import { getDefaultRegistry, retrieveSchema, SchemaContainer, StateManagerContext, WidgetsFactory, withReducer } from "@itsy-ui/core";
import React, { Component } from "react";
import { getUrlParams, getlocaleText } from "@itsy-ui/utils";
import { doPageGetState, doPageInit, doPageInitLoad, doPageUpdateContext, onRemoveStateMachine } from "./actions";
import "./PageContainer/PageContainer";
import reducer from "./reducer";
import "../helpers/utils";
import "../commands/commandGenerator";
import "../locale";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"];
import stateJSON from "./state.json";

class RuntimePageLayout extends Component {
	componentWillMount() {
		this.initializePage();
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.schema.designerMetadata && nextProps.schema.designerMetadata.needRefresh) {
			this.initializePage(nextProps.schema);
		}
	}

	initializePage(schema = null) {
		const { basePath, pagesPath, appId, queryParams } = this.getControlSchemaProperties();
		let { pageId, designerMetadata, pageSchema } = this.getControlSchemaProperties();
		pageId = schema && schema.pageId ? schema.pageId : pageId;
		if (!pageId && !designerMetadata) {
			this.props.transition({
				type: "SHOW_INDICATOR",
				loadingMessage: "{{page.init}}",
			});
		}
		let urlQueryParams = {}, pathName = "";
		if (window.location) {
			urlQueryParams = getUrlParams(window.location.search);
			pathName = window.location.pathname;
		}
		if (queryParams) {
			urlQueryParams = { ...urlQueryParams, ...queryParams }
		}
		if (!designerMetadata || pageId || pageSchema) {
			this.props.transition({
				type: "PAGE_INIT",
				params: { queryParams: urlQueryParams, pathName: pathName, basePath, pageId, pagesPath, appId, pageSchema }
			});
		}
	}

	getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	componentWillUnmount() {
		const { currentPage, urlParams } = this.props;
		if (currentPage !== null) {
			this.props.removeStateMachine(currentPage, urlParams);
		}
	}

	getContextPath = (typeId, schemaId) => {
		return {
			contextPath: {
				"typeId": typeId,
				"schemaId": schemaId,
			}
		}
	}

	getDefaultPage() {
		let defaultPage = null;
		for (const k in this.props.pages) {
			if (this.props.pages[k].isDefault) {
				defaultPage = this.props.pages[k];
				break;
			}
		}

		return defaultPage;
	}

	queryParamsToMatch(params) {
		const qparams = {};
		let urlQueryParams = getUrlParams(window.location.search);
		const { urlParams } = this.props;
		const { queryParams } = this.getControlSchemaProperties();
		urlQueryParams = { ...urlQueryParams, ...queryParams, ...urlParams && urlParams["queryParams"] }
		params.forEach(element => {
			qparams[element["queryParamName"]] = urlQueryParams[element["queryParamName"]];
		});

		return qparams;
	}

	getRoutedLayoutElements() {
		const { designerMetadata } = this.getControlSchemaProperties();
		if (!this.props.loaded && !designerMetadata) {
			return null;
		}
		if (this.props.pages !== null && Object.keys(this.props.pages).length === 0) {
			return getlocaleText("{{widget.error}}");
		}
		const { basePath, appId, pageId, pageSchema } = this.props.urlParams;
		let layoutRoutes = [];
		if (!pageId && !pageSchema) {
			for (const pageID in this.props.pages) {
				const pageInfo = this.props.pages[pageID];
				const schema = this.getSchema(pageInfo);
				const el = <StateManagerContext.Provider key={`pageContainer-provider-${pageID}`} value={{ contextPath: { pageId: pageID } }}>
					<SchemaContainer key={`${pageInfo.id}-rt-container`} schema={schema} />
				</StateManagerContext.Provider>;
				layoutRoutes.push(el);
			}
		} else {
			const pageInfo = pageId ? this.props.pages[pageId] : this.props.currentPage;
			if (pageInfo) {
				const schema = this.getSchema(pageInfo);
				const el = <StateManagerContext.Provider key={`pageContainer-provider-${pageInfo.id}`} value={{ contextPath: { pageId: pageInfo.id } }}>
					<SchemaContainer key={`${pageInfo.id}-rt-container`} schema={schema} />
				</StateManagerContext.Provider>;
				layoutRoutes.push(el);
			}
		}
		return layoutRoutes;
	}

	getSchema(pageInfo) {
		if (pageInfo) {
			const { designerMetadata, pagesPath } = this.props.urlParams;
			return {
				"name": pageInfo.id,
				"properties": {
					"ui:widget": "pageContainer",
					"pageId": pageInfo.id,
					"components": pageInfo.components,
					"layout": pageInfo.layout,
					"currentPageQueryParams": pageInfo.queryParams && pageInfo.queryParams.length > 0 ? pageInfo.queryParams : null,
					"queryParams": pageInfo.queryParams && pageInfo.queryParams.length > 0 ? this.queryParamsToMatch(pageInfo.queryParams) : null,
					"designerMetadata": designerMetadata,
					"className": this.props.className,
					"style": this.props.style,
					pagesPath,
					controlID: pageInfo.id,
				}
			};
		}
		return {};
	}

	render() {
		return <>
			{this.getRoutedLayoutElements()}
		</>;
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		onPageInit: (event) => dispatch(doPageInit(event)),
		onPageInitLoad: ({ params }) => dispatch(doPageInitLoad(params)),
		onPageGetState: (event) => dispatch(doPageGetState(event.onData)),
		onPageUpdateContext: (event) => dispatch(doPageUpdateContext(event)),
		onUpdatePageContextObject: (event) => dispatch(doUpdatePageContextObject(event)),
		removeStateMachine: (currentPage, urlParams) => dispatch(onRemoveStateMachine(currentPage, urlParams)),
	};
};

const ItsyPage = withReducer("ItsyPage", reducer, mapDispatchToProps, stateJSON)(RuntimePageLayout);
ItsyPage.displayName = "ItsyPage";

WidgetsFactory.instance.registerFactory(ItsyPage);
WidgetsFactory.instance.registerControls({
	r: "ItsyPage",
	"itsy:page": "ItsyPage"
});


const layoutRegistry = dataLoader.getLoader("LayoutRegistry");
const pageLayoutRegistry = {
	getName() {
		return "r";
	},

	getSchema(params) {
		const layoutType = params["layout"] ? params["layout"] : "simple";
		if (layoutType === "simple") {
			const pageWidgetJSON = {
				"name": "page",
				"properties": {
					"ui:widget": "page",
					...params
				}
			};
			return pageWidgetJSON;
		} else {
			return null;
		}
	}
};
layoutRegistry.registerComponentSchema("r", pageLayoutRegistry);

export default ItsyPage;
