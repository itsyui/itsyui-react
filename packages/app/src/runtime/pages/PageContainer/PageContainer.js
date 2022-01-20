import { getDefaultRegistry, retrieveSchema, SchemaContainer, StateManagerContext, WidgetsFactory, withReducer } from "@itsy-ui/core";
import React, { Component } from "react";
import { doPageContainerInit, doPageContainerLoad } from "./actions";
import reducer from "./reducer";

import stateJSON from "./state.json";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"];
const pageBindProvider = dataLoader.getLoader("pageBindProvider");
const customStateProvider = dataLoader.getLoader("customStateProvider");

class PageContainer extends Component {
	constructor(props) {
		super(props);
	}

	getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	componentWillMount() {
		const { pageId, components, layout, currentPageQueryParams, queryParams, designerMetadata, pagesPath } = this.getControlSchemaProperties();
		this.props.transition({
			type: "PAGE_CONTAINER_INIT",
			pageId, components, layout, currentPageQueryParams, queryParams, designerMetadata, pagesPath
		});
	}

	getNegatedProps = (props, obj) => {
		const val = {};
		for (const key in obj) {
			if (props.indexOf(key) < 0) {
				val[key] = obj[key];
			}
		}

		return val;
	}

	getControlIDAndSchemaId(widgetName, updatedQP) {
		if (widgetName && updatedQP && updatedQP["typeId"] && updatedQP["schemaId"]) {
			switch (widgetName) {
				case "itsy:grid":
				case "grid":
					return {
						"typeId": updatedQP["typeId"],
						...updatedQP["schemaId"] && { "gridSchemaId": updatedQP["schemaId"] }
					}
				case "itsy:form":
				case "form":
					return {
						"typeId": updatedQP["typeId"],
						...updatedQP["schemaId"] && { "formSchemaId": updatedQP["schemaId"] }
					}
				default:
					return {
						"typeId": updatedQP["typeId"],
						...updatedQP["schemaId"] && { "schemaId": updatedQP["schemaId"] }
					}
			}
		}
		return {};
	}

	appendQueryParams(properties, queryParams, currentPageQueryParams) {
		const { bounded } = properties
		const updatedPro = {}
		if (Array.isArray(currentPageQueryParams)) { //base on currentPageQueryParams if currentPage QP if bounded that QP will add inside controlSchema
			for (const param of currentPageQueryParams) {
				if (param.isBounded) {
					updatedPro[param.queryParamName] = queryParams[param.queryParamName];
				}
			}
		}

		const mergedUpdatedPro = { ...updatedPro, ...this.getControlIDAndSchemaId(properties["ui:widget"], updatedPro) };
		return { ...properties, ...mergedUpdatedPro, "queryParams": queryParams }
	}

	getWidgets() {
		const { components, queryParams, currentPageQueryParams, designerMetadata, pagesPath, pageId } = this.props;
		const widgets = {};
		for (const key in components) {
			let schema = components[key];
			if (schema.properties && schema.properties.propertyType === "page" && schema.properties.pageId) {
				schema = {
					name: "pageLayout",
					properties: {
						"ui:widget": "r",
						"pageId": schema.properties.pageId,
						"designerMetadata": designerMetadata ? designerMetadata : null,
						...pagesPath && { pagesPath },
					}
				};
			} else if (schema.properties && schema.properties.widgetType === "itemsControl") {
				Array.isArray(schema.properties.items) && schema.properties.items.forEach(item => {
					if (item.content && item.content.pageId) {
						item.content.pagesPath = pagesPath;
					}
					if (queryParams) { // passing queryParams in tabs widgets
						item.content = Object.assign({ ...item.content, ...this.appendQueryParams(item.content, queryParams, currentPageQueryParams) });
					}
				});
			} else {
				if (queryParams) {
					schema = { ...schema, "properties": this.appendQueryParams(schema["properties"], queryParams, currentPageQueryParams) };
				}
				if (!schema["properties"]["controlID"]) {
					schema["properties"]["controlID"] = key;
				}
				if (designerMetadata) {
					schema["properties"]["designerMetadata"] = designerMetadata;
				}
			}
			schema["properties"]["pageContext"] = {
				pageId,
				pagesPath,
				queryParams,
				...schema["properties"]["pageContext"]
			};
			const schemaContainer = <SchemaContainer key={schema.name} schema={schema} />;
			widgets[key] = schemaContainer;
		}
		return widgets;
	}

	getCell(cell, widgets, pageId, cellIdx) {
		if (cell.hasOwnProperty("widget")) {
			const cellProps = widgets[cell.widget].props.schema;
			const cellStyle = {
				backgroundColor: cellProps && cellProps.properties.backgroundColor ? cellProps.properties.backgroundColor : "",
				width: "100%",
				justifyContent: cellProps && cellProps.properties.align && cellProps.properties.align === "right" ? "flex-end" : cellProps && cellProps.properties.align && cellProps.properties.align === "center" ? "center" : "flex-start",
				height: cellProps && cellProps.properties.height ? cellProps.properties.height + "%" : "auto",
				padding: cellProps && cellProps.properties.padding ? cellProps.properties.padding + "rem" : "0rem",
				...cellProps && cellProps.properties.align && { display: "flex" },
			};
			const contextPath = {}
			if (cellProps.properties.typeId) {
				contextPath["typeId"] = cellProps.properties.typeId;
			}
			if (cellProps.properties.gridSchemaId && cellProps.properties.gridSchemaId !== "") {
				contextPath["gridSchemaId"] = cellProps.properties.gridSchemaId;
			}
			if (cellProps.properties.formSchemaId && cellProps.properties.formSchemaId !== "") {
				contextPath["formSchemaId"] = cellProps.properties.formSchemaId;
			}
			if (contextPath && Object.keys(contextPath).length === 0) { // if contextPath is empty load widget name
				contextPath["widgetId"] = cellProps.name;
			}

			return (
				<StateManagerContext.Provider key={`rt-provider-${cellIdx}`} value={{ contextPath: { ...contextPath, pageId } }}>
					<div className="widget-wrapper" style={cellStyle}>
						{widgets[cell.widget]}
					</div>
				</StateManagerContext.Provider>
			);
		} else if (cell.hasOwnProperty("columns")) {
			return this.getRows([cell], widgets, pageId);
		}
	}

	getCells(columns, widgets, pageId) {
		return columns.map((column, index) => {
			const colSchema = {
				name: "column_control",
				properties: {
					"ui:widget": "col_control",
					"span": 12 / columns.length,
					"style": {
						"width": "100%",
					},
					"height": "auto",
					"padding": "0rem",
					...this.getNegatedProps(["widget"], column),
				}
			};
			let cells = [];
			if (Array.isArray(column.cell) && column.cell.length > 0) {
				cells = column.cell.map((x, i) => {
					return this.getCell(x, widgets, pageId, i);
				});
			}
			return <SchemaContainer key={`${pageId}-col-${index}`} schema={colSchema}>
				{cells}
			</SchemaContainer>;
		});
	}

	getRows(layoutRows, widgets, pageId) {
		return layoutRows.map((item, index) => {
			let cells = [];
			const rowControlSchema = {
				name: `row-control-${index}`,
				properties: {
					"ui:widget": "row_control",
					...this.getNegatedProps(["widget"], item),
				},
			};
			if (item && Array.isArray(item["columns"]) && item["columns"].length > 0) {
				const columns = item["columns"];
				cells = this.getCells(columns, widgets, pageId)
			} else if (item && item["widget"]) {
				const colSchema = {
					name: "column_control",
					properties: {
						"ui:widget": "col_control",
						"span": 12,
						"style": {
							"width": "100%",
						},
						"height": "auto",
						"padding": "0rem"
					}
				};
				const col = <SchemaContainer schema={colSchema}>
					{this.getCell(item, widgets, pageId, Math.floor(Math.random() * 1000) + 1)}
				</SchemaContainer>;
				cells.push(col);
			}
			return <SchemaContainer key={index} schema={rowControlSchema}>
				{cells}
			</SchemaContainer>;
		});
	}

	renderLayout() {
		const { layout, pageId } = this.props;
		const { className, style } = this.getControlSchemaProperties();

		const widgets = this.getWidgets();
		//
		if (Array.isArray(layout) && layout.length > 0) {
			const gridSchema = {
				name: `grid-control-page-container`,
				properties: {
					"ui:widget": "content_control",
					isScrollable: true,
					className: className,
					style: style
				},
			}
			return <SchemaContainer schema={gridSchema} >
				{this.getRows(layout, widgets, pageId)}
			</SchemaContainer>
		}
		//TODO: need to remove old rendering logic 
		const rowElements = layout.rows.map((r, ridx) => {
			const rowControlSchema = {
				name: `row-control-${ridx}`,
				properties: {
					"ui:widget": "row_control",
					...this.getNegatedProps(["widget"], r),

				},
			};

			const columnElements = r.columns.filter((col) => {
				return widgets[col.widget] !== undefined && widgets[col.widget] !== null;
			}).map((col, cidx) => {
				const colProps = widgets[col.widget].props.schema;
				const colSchema = {
					name: `column-control-${ridx}-${cidx}`,
					properties: {
						"ui:widget": "col_control",
						"span": colProps.properties.span ? colProps.properties.span : 12 / r.columns.length,
						"style": {
							"background-color": colProps.properties.backgroundColor ? colProps.properties.backgroundColor : "",
							"display": colProps.properties.align ? "flex" : "initial",
							"width": "100%",
							"justifyContent": colProps.properties.align && colProps.properties.align == "right" ? "flex-end" : colProps.properties.align && colProps.properties.align == "center" ? "center" : "flex-start",
						},
						"height": colProps.properties.height ? colProps.properties.height + "%" : "auto",
						"padding": colProps.properties.padding ? colProps.properties.padding + "rem" : "0rem",
						...this.getNegatedProps(["widget"], col),
					},
				};
				const contextPath = {}
				if (colProps.properties.typeId) {
					contextPath["typeId"] = colProps.properties.typeId;
				}
				if (colProps.properties.gridSchemaId && colProps.properties.gridSchemaId !== "") {
					contextPath["gridSchemaId"] = colProps.properties.gridSchemaId;
				}
				if (colProps.properties.formSchemaId && colProps.properties.formSchemaId !== "") {
					contextPath["formSchemaId"] = colProps.properties.formSchemaId;
				}
				if (contextPath && Object.keys(contextPath).length === 0) { // if contextPath is empty load widget name
					contextPath["widgetId"] = colProps.name;
				}

				return (
					<StateManagerContext.Provider key={`rt-provider-${cidx}`} value={{ contextPath: { ...contextPath, pageId } }}>
						<SchemaContainer schema={colSchema}>
							{widgets[col.widget]}
						</SchemaContainer>
					</StateManagerContext.Provider>
				);
			});

			return (
				<SchemaContainer schema={rowControlSchema} key={ridx}>
					{columnElements}
				</SchemaContainer>
			);
		});
		const gridSchema = {
			name: `grid-control-page-container`,
			properties: {
				"ui:widget": "content_control",
				"isScrollable": true
			},
		}
		return (<SchemaContainer schema={gridSchema}>
			{rowElements}
		</SchemaContainer>);
	}

	render() {
		if (this.props.isLoaded) {
			return this.renderLayout();
		}

		return null;
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		onPageContainerInit: (event) => dispatch(doPageContainerInit(event)),
		onPageContainerLoad: (event) => dispatch(doPageContainerLoad(event))
	};
};

const PageContainerC = withReducer("PageContainer", reducer, mapDispatchToProps, stateJSON)(PageContainer);
PageContainerC.displayName = "PageContainer";

WidgetsFactory.instance.registerFactory(PageContainerC);
WidgetsFactory.instance.registerControls({
	pageContainer: "PageContainer",
	"itsy:pagecontainer": "PageContainer"
});
