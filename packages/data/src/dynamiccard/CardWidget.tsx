import * as React from 'react';
import { WidgetsFactory, getDefaultRegistry, retrieveSchema, SchemaContainer, withReducer } from '@itsy-ui/core';
import { getWidth, getSchema } from "./utils";
import { doUpdateSchema } from "./action";
import reducer from "./reducer";

import stateJson from "./state.json";

class DynamicCardWidget extends React.Component<any> {
	_getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	componentWillMount() {
		if (this.props.cardJson && Object.keys(this.props.cardJson).length === 0) {
			this.props.transition({
				type: "UPDATE_CARD_SCHEMA",
				fieldSchema: this.props.schema.fieldSchema,
				objectId: this.props.schema.objectId,
			});
		}
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

	async handleClick(item) {
		const { fieldSchema, pageContext } = this._getControlSchemaProperties();
		const { typeId } = fieldSchema;
		const contextParams = {
			contextPath: {},
			context: {
				"record": fieldSchema.record ? fieldSchema.record : this.props.record,
				"typeId": item.typeId ? item.typeId : typeId,
				"pageContext": pageContext ? pageContext : {}
			}
		}
		const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"];
		const commandManager = dataLoader.getLoader("commandManager");
		const contextPath = contextParams !== undefined && contextParams.contextPath !== undefined ? contextParams.contextPath : {};
		const context = contextParams !== undefined && contextParams.context !== undefined ? contextParams.context : {};
		const cmd = commandManager.getCommand(item.name, contextPath);
		try {
			await cmd.execute(context, this.props.transition);
		} catch (e) {
			throw e;
		}
	}

	renderCardActions() {
		const { propertyDefinitions } = this.props.cardJson;
		let actionSchema = {};
		return Object.keys(propertyDefinitions).map(propDef => {
			if (Array.isArray(propertyDefinitions[propDef])) {
				return propertyDefinitions[propDef].map(t => {
					if (t.hasOwnProperty("ui:widget")) {
						actionSchema = getSchema(t, t.name, this.props.record)
					} else {
						actionSchema = {
							name: `button_control`,
							properties: {
								"ui:widget": "button_control",
								"displayName": t.displayText,
								"onButtonClick": () => this.handleClick(t),
								...t
							},
						};
					}
					return <SchemaContainer schema={actionSchema} />
				});
			}
		})
	}

	renderLayout(r, ridx, widgets) {
		const rowControlSchema = {
			name: `card_row-control-${ridx}`,
			properties: {
				"ui:widget": "row_control",
				...this.getNegatedProps(["widget"], r),
			},
		};
		const columnElements = r.columns.map((col, cidx) => {
			if (col.rows) {
				return this.renderCardAttributes(col.rows, widgets, true);
			} else {
				const colProps = widgets[col.widget].props.schema;
				const colSchema = {
					name: `card_column-control-${ridx}-${cidx}`,
					properties: {
						"ui:widget": "col_control",
						"span": colProps.properties.span ? colProps.properties.span : 12 / r.columns.length,
						"className": colProps.properties.className ? colProps.properties.className : "",
						"style": {
							"display": colProps.properties.alignment ? "flex" : "initial",
							"justifyContent": colProps.properties.alignment && colProps.properties.alignment == "right" ? "flex-end" : colProps.properties.alignment && colProps.properties.alignment == "center" ? "center" : "flex-start",
						},
						"height": colProps.properties.height ? colProps.properties.height + "%" : "auto",
						"padding": colProps.properties.padding ? colProps.properties.padding + "rem" : "0rem",
						...this.getNegatedProps(["widget"], col),
					},
				};
				const contextPath = {}
				if (colSchema.properties.span) {
					colSchema.properties.style["width"] = getWidth(colSchema.properties.span);
				}
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
					<SchemaContainer schema={colSchema}>
						{widgets[col.widget]}
					</SchemaContainer>
				);
			}
		})
		return (
			<SchemaContainer schema={rowControlSchema} key={ridx}>
				{columnElements}
			</SchemaContainer>
		);
	}


	renderCardAttributes(rows, widgets, isChild?) {
		let rowElements;
		rowElements = rows.map((r, ridx) => {
			return this.renderLayout(r, ridx, widgets);
		});
		const gridSchema = {
			name: `grid-control-page-container`,
			properties: {
				"ui:widget": "content_control",
				"isScrollable": true,
				"style": isChild ? { "width": "50%" } : {}
			},
		}
		return (
			<SchemaContainer schema={gridSchema}>
				{rowElements}
			</SchemaContainer>
		);
	}

	onRowSelect(id) {
		const { fieldSchema } = this.props.schema;
		const { onGridSelectedRows, selectedRows, data, rowSelectionMode } = fieldSchema;
		if (onGridSelectedRows !== undefined && data !== undefined) {
			const selectedRecord = data.records.filter(rec => {
				if (rec["objectId"]) {
					return rec["objectId"] === id;
				} else if (rec["id"]) {
					return rec["id"] === id
				} else {
					return rec["cmis:objectId"] === id
				}
			});
			let newSelected = [];
			if (rowSelectionMode === 2) {
				const isAlreadySelected = selectedRows.find(rec => {
					if (rec["objectId"]) {
						return rec["objectId"] === id;
					} else if (rec["id"]) {
						return rec["id"] === id
					} else {
						return rec["cmis:objectId"] === id
					}
				});
				if (!isAlreadySelected) {
					newSelected = newSelected.concat(selectedRows, selectedRecord);
				} else {
					if (selectedRows.length === 1) {
						newSelected = newSelected.concat(selectedRows.slice(1));
					} else {
						const index = selectedRows.findIndex(rec => {
							if (rec["objectId"]) {
								return rec["objectId"] === id;
							} else if (rec["id"]) {
								return rec["id"] === id
							} else {
								return rec["cmis:objectId"] === id
							}
						});
						newSelected = newSelected.concat(selectedRows.slice(0, index), selectedRows.slice(index + 1));
					}
				}
				onGridSelectedRows(newSelected);
			} else if (rowSelectionMode === 1) {
				onGridSelectedRows(selectedRecord);
			}
		} else if (this.props.onClick) {
			this.props.onClick(this.props.record);
		}
	}

	renderCard(layout, widgets, styles) {
		const schema = this.props.schema ? this.props.schema : {};
		const linkUISchema = {
			name: `dynamic_card_ui_control`,
			properties: {
				...schema,
				"ui:widget": "itsy:ui:dynamiccard",
				widgets: widgets,
				styles: styles,
				layout: layout,
				record: this.props.schema && this.props.schema.fieldSchema && this.props.schema.fieldSchema.record ? this.props.schema.fieldSchema.record : this.props.record,
				className: this.props.className,
				style: this.props.style,
				onRowSelect: this.onRowSelect.bind(this),
				onRenderCardAttributes: this.renderCardAttributes.bind(this),
				onRenderCardActions: this.renderCardActions.bind(this)
			},
		};
		return (<SchemaContainer schema={linkUISchema} />);
	}

	getWidgets(propDefs, record) {
		const components = propDefs;
		const widgets = {};
		for (const key in components) {
			const schema = components[key];
			const updatedSchema = !Array.isArray(schema) && getSchema(schema, key, record);
			const schemaContainer = <SchemaContainer key={key} schema={updatedSchema} />;
			widgets[key] = schemaContainer;
		}
		return widgets;
	}

	render() {
		if (Object.keys(this.props.cardJson).length > 0) {
			const { layout, propertyDefinitions, styles } = this.props.cardJson;
			const record = this.props.schema && this.props.schema.fieldSchema && this.props.schema.fieldSchema.record ? this.props.schema.fieldSchema.record : this.props.record
			const widgets = this.getWidgets(propertyDefinitions, record);
			return <>
				{this.renderCard(layout, widgets, styles)}
			</>
		}
		return null
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		onUpdateSchema: (event) => dispatch(doUpdateSchema(event))
	};
};

const DynamicCardWidgetComponent = withReducer('DynamicCardWidget', reducer, mapDispatchToProps, stateJson)(DynamicCardWidget);
DynamicCardWidgetComponent.displayName = 'DynamicCardWidget';

WidgetsFactory.instance.registerFactory(DynamicCardWidgetComponent);
WidgetsFactory.instance.registerControls({
	single_card_control: 'DynamicCardWidget',
	"itsy:dynamiccard": "DynamicCardWidget"
});

export default DynamicCardWidgetComponent;
