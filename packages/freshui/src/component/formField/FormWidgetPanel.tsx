import { getDefaultRegistry, getLocaleString, retrieveSchema, SchemaContainer, WidgetsFactory, withReducer } from "@itsy-ui/core";
import * as React from "react";
import { getlocaleText } from "../../utils/helper";


const _getControlSchemaProperties = (props) => {
	const registry = getDefaultRegistry();
	const { definitions } = registry;
	const schema = retrieveSchema(props.schema, definitions);
	return schema;
};

const getColumn = (field: any, columnSchema: any = null) => {
	columnSchema = !columnSchema ? {
		name: `column-control`,
		properties: {
			"ui:widget": "col_control",
			span: 12,
		},
	} : columnSchema;

	return (<SchemaContainer schema={columnSchema}> <SchemaContainer key={field.name} schema={field} /></SchemaContainer>);
};

const getRowItem = (field: any, columnSchema: any = null) => {
	const rowControlSchema = {
		name: "rowControl",
		properties: {
			"ui:widget": "row_control",
		},
	};

	return (<SchemaContainer key={field.name} schema={rowControlSchema}>
		{getColumn(field, columnSchema)}
	</SchemaContainer>);
};

const getGroupRows = (group: any, formItemMap: any) => {
	const rowControlSchema = {
		name: "rowControl",
		properties: {
			"ui:widget": "row_control",
		},
	};
	let rows = [];
	if (group.rowGroup) {
		rows = group.rowGroup.map((g, i) => {
			const availableColumns = g.propertyDefinitions.filter((t: any) => formItemMap[t] !== undefined);
			const columns = availableColumns.map((t: any, index: any) => {
				const columnSchema = {
					name: `column-control`,
					properties: {
						"ui:widget": "col_control",
						span: 12 / g.propertyDefinitions.length,
						className: "form-multi-column",
					},
				};
				return getColumn(formItemMap[t], columnSchema, index);
			});
			return (<SchemaContainer key={i} schema={rowControlSchema}>
				{columns}
			</SchemaContainer>);
		});
	} else if (group.propertyDefinitions) {
		rows = group.propertyDefinitions.filter(t => formItemMap[t] !== undefined).map(t => {
			return getRowItem(formItemMap[t]);
		});
	}
	return rows;
};

const createGroup = (group: any, formItemMap: any) => {
	const rows = getGroupRows(group, formItemMap);
	if (group["headerText"]) {
		group["headerText"] = getLocaleString(group, "headerText");
		return (<section className="box" tabIndex={0}>
			<section className="box-meta markdown">
				<div className="box-title" tabIndex={0} aria-label={group.headerText}>
					<label>{group.headerText}</label>
				</div>
				{rows}
			</section>
		</section>);
	}
	return rows;
};

const getCell = (cell, formItems, cellIdx, processedFormInputs) => {
	if (cell.hasOwnProperty("widget")) {
		const currentFormItem = formItems[cell["widget"]]
		processedFormInputs.push(cell["widget"]);
		return currentFormItem && <SchemaContainer key={cellIdx} schema={currentFormItem} />;
	} else if (cell.hasOwnProperty("columns")) {
		return getRows([cell], formItems, processedFormInputs);
	}
}

const getCells = (columns, formItems, processedFormInputs) => {
	return columns.map((column, index) => {
		const colSchema = {
			name: "column_control",
			properties: {
				"ui:widget": "col_control",
				"span": 12 / columns.length,
				className: "form-multi-column",
				...getNegatedProps(["widget"], column),
			}
		};
		let cells = [];
		if (Array.isArray(column.cell) && column.cell.length > 0) {
			cells = column.cell.map((x, i) => {
				return getCell(x, formItems, `col-widget-${i}`, processedFormInputs);
			});
		}
		return <SchemaContainer schema={colSchema}>
			{cells}
		</SchemaContainer>;
	});
}

const getNegatedProps = (props, obj) => {
	const val = {};
	for (const key in obj) {
		if (props.indexOf(key) < 0) {
			val[key] = obj[key];
		}
	}

	return val;
}

const getRows = (layoutRows, formItems, processedFormInputs) => {
	return layoutRows.map((item, index) => {
		let cells = [];
		const rowControlSchema = {
			name: `row-control-${index}`,
			properties: {
				"ui:widget": "row_control",
			},
		};
		if (item && Array.isArray(item["columns"]) && item["columns"].length > 0) {
			const columns = item["columns"];
			cells = getCells(columns, formItems, processedFormInputs)
		} else if (item && item["widget"]) {
			const colSchema = {
				name: "column_control",
				properties: {
					"ui:widget": "col_control",
					"span": 12,
				}
			};
			const col = <SchemaContainer schema={colSchema}>
				{getCell(item, formItems, `widget-${index}`, processedFormInputs)}
			</SchemaContainer>;
			cells.push(col);
		}
		if (item["headerText"]) {
			item["headerText"] = getLocaleString(item, "headerText");
			return (
				<section className="box" tabIndex={0}>
					<section className="box-meta markdown">
						<div className="box-title" tabIndex={0} aria-label={item.headerText}>
							<label>{item.headerText}</label>
						</div>
						<SchemaContainer schema={rowControlSchema} tabIndex={0}>
							{cells}
						</SchemaContainer>
					</section>
				</section>);
		}
		return <SchemaContainer schema={rowControlSchema}>
			{cells}
		</SchemaContainer>;
	});
}

const formWidgetPanel = function formPanel(props) {
	const { formItems, sections, isModal, controlID, isReadonly, showSubmitButton, submitButtonText } = _getControlSchemaProperties(props);
	let processedFormInputs = [], groups = [], merged = [];
	if (Array.isArray(sections) && sections.length > 0) {
		if (sections[0].hasOwnProperty("groups") && Array.isArray(sections[0]["groups"])) {
			groups = sections.map(section => section.groups.map(group => createGroup(group, formItems)));
			sections.forEach(section => section.groups.forEach(group => processedFormInputs = group.rowGroup ? processedFormInputs.concat(group.propertyDefinitions, ...group.rowGroup.map(x => x.propertyDefinitions)) :
				processedFormInputs.concat(group.propertyDefinitions)));
			processedFormInputs = [].concat.apply([], processedFormInputs);
		} else if (Array.isArray(sections) && sections.length > 0) {
			groups = getRows(sections, formItems, processedFormInputs)
		}

	}
	merged = [].concat.apply([], groups);
	const formItemsNotProcessed = [];
	for (const prop in formItems) {
		if (processedFormInputs.indexOf(prop) === -1) {
			const row = getRowItem(formItems[prop]);
			formItemsNotProcessed.push(row);
		}
	}

	merged = merged.concat(formItemsNotProcessed);

	let buttonSchema = {};
	if (!isModal && showSubmitButton !== false) {
		buttonSchema = {
			name: "button",
			properties: {
				"ui:widget": "button_control",
				"displayName": submitButtonText ? submitButtonText : getlocaleText("{{save}}"),
				controlID,
				onButtonClick: () => {
					props.transition({
						type: "FORM_SUBMIT_CLICK",
						strict: true,
						controlID,
					});
				},
			},
		};
	}

	return (<div key={controlID}>
		<div className="form_align">
			{merged}
			{
				!isModal && !isReadonly && <SchemaContainer key={`${controlID}-modal-button`} schema={buttonSchema} />
			}
		</div>
	</div>
	);
};
const mapDispatchToProps = (dispatch) => {
	return {};
};
const FormWidgetpanelC = withReducer('formWidgetPanel', mapDispatchToProps)(formWidgetPanel);
FormWidgetpanelC.displayName = "formWidgetPanel";

WidgetsFactory.instance.registerFactory(FormWidgetpanelC);
WidgetsFactory.instance.registerControls({
	form_panel: "formWidgetPanel",
	"itsy:form:panel": "formWidgetPanel"
});
