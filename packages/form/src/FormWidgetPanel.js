import { getDefaultRegistry, getLocaleString, retrieveSchema, SchemaContainer, WidgetsFactory } from '@itsy-ui/core';
import React from 'react';

const _getControlSchemaProperties = (props) => {
	const registry = getDefaultRegistry();
	const { definitions } = registry;
	const schema = retrieveSchema(props.schema, definitions);
	return schema;
};

const createGroup = (group, formItemMap) => {
	const rowControlSchema = {
		name: "rowControl",
		properties: {
			"ui:widget": "row_control",
		}
	};
	group["headerText"] = getLocaleString(group, "headerText");
	return <section className="box" key={group["id"]} id={group["id"]}>
		<section className="box-meta markdown">
			<div className="box-title">
				<label>{group.headerText}</label>
			</div>
			{group.rowGroup &&
				group.rowGroup.map(g => {
					const fields = g.propertyDefinitions.filter(t => formItemMap[t] !== undefined).map(t => {
						const colControlSchema = {
							name: `column-control`,
							properties: {
								"ui:widget": "col_control",
								span: 12 / g.propertyDefinitions.length,
								style: { padding: 4 }
							},
						};
						return <SchemaContainer schema={colControlSchema}> <SchemaContainer schema={formItemMap[t]} /></SchemaContainer>;
					});
					return <SchemaContainer schema={rowControlSchema}>
						{fields}
					</SchemaContainer>;
				})
			}
			<div>
				{group.propertyDefinitions &&
					group.propertyDefinitions.filter(t => formItemMap[t] !== undefined).map(t => {
						return <SchemaContainer schema={formItemMap[t]} />;
					})}
			</div>
		</section>
	</section >;
};

const getCell = (cell, formItems, cellIdx, processedFormInputs) => {
	if (cell.hasOwnProperty("widget")) {
		const currentFormItem = formItems[cell["widget"]]
		processedFormInputs.push(cell["widget"]);
		return (
			<SchemaContainer key={cellIdx} schema={currentFormItem} />
		);
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
				<section className="box">
					<section className="box-meta markdown">
						<div className="box-title">
							<label>{item.headerText}</label>
						</div>
						<SchemaContainer schema={rowControlSchema}>
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
	const { formItems, sections, isModal, controlID } = _getControlSchemaProperties(props);
	let processedFormInputs = [], groups = [], merged = [];
	if (sections && Array.isArray(sections) && sections.length > 0) {
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
	let items = Object.keys(formItems);
	for (let i = 0; i < items.length; i++) {
		if (processedFormInputs.indexOf(items[i]) === -1) {
			formItemsNotProcessed.push(<SchemaContainer key={i} schema={formItems[items[i]]} />);
		}
	}

	merged = merged.concat(formItemsNotProcessed);
	return merged;

};

formWidgetPanel.displayName = 'formWidgetPanel';

WidgetsFactory.instance.registerFactory(formWidgetPanel);
WidgetsFactory.instance.registerControls({
	custom_form_panel: "formWidgetPanel",
	form_panel: 'formWidgetPanel'
});
