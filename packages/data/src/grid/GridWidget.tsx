import { getDefaultRegistry, getLocaleString, IWidgetControlProps, retrieveSchema, SchemaContainer, WidgetsFactory, withReducer } from "@itsy-ui/core";
import { DataLoaderFactory, IDataSourceLake } from "@itsy-ui/core";
import * as React from "react";
import {
	doGridAfterEndEdit, doGridBeforeEdit,
	doGridBeforeSelectedRows, doGridEdit, doGridEndEdit, doGridFilter, doGridGetState, doGridInit,
	doGridLoad, doGridLoadDone, doGridRefresh, doGridSelectedRows, doGridSelectedRowsDone,

	doGridUpdateContext, doInitRowSummary, GridActions, onCurrentPageChange, onCustomButtonExecuteCommand, onFetchDataServer
} from "./actions";
import { IGridDataRecord, IGridWidgetDispatchProps, IGridWidgetStateProps, IGridWidgetStateTransitionProps } from "./grid";
import { getlocaleText } from "@itsy-ui/utils";
import reducer from "./reducer";
import "./GridSchemaLoader";
import "./gridWidgetBinding";
import "./locale";

import stateJSON from "./state.json";

type GridWidgetProps = IGridWidgetStateProps & IGridWidgetDispatchProps & IGridWidgetStateTransitionProps & IWidgetControlProps & React.HTMLAttributes<HTMLDivElement>;

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;

class GridWidget extends React.Component<GridWidgetProps, {}> {
	componentWillMount() {
		this.initializeGrid();
	}

	componentWillReceiveProps(nextProps: any) {
		if (nextProps.schema.designerMetadata && nextProps.schema.designerMetadata.needRefresh) {
			this.initializeGrid(nextProps.schema);
		}

	}
	getActions = (record) => {
		const { viewAttributes, pageContext } = this.props;
		const commandManager: any = dataLoader.getLoader("commandManager");
		const { contextPath } = (this.props as any);
		if (viewAttributes.customAction && Array.isArray(viewAttributes.customAction.actions)) {
			const refreshedItems = viewAttributes.customAction.actions.map(t => {
				let cmd = commandManager.getCommand(t.name, contextPath ? contextPath : {});
				if (!cmd) {
					cmd = commandManager.getCommand(t.name, {});
				}
				const data = { "data": record, "config": t, pageContext };
				if (cmd) {
					t.enabled = cmd.canExecute(data, this.props.transition);
				} else {
					t.enabled = false;
				}
				return JSON.parse(JSON.stringify(t));
			});
			return refreshedItems;
		}
		return [];
	}

	initializeGrid(schema = null) {
		const { typeId, gridSchemaId, gridSchema, filterText, idField, selectedRecords,
			rowSelectionMode, canTriggerGridSelectedRows, context, queryParams, dataSource, gridViewAttributes, pageContext } = this.getControlSchemaProperties();
		let { customDataSource, designerMetadata } = this.getControlSchemaProperties();
		customDataSource = customDataSource ? customDataSource : dataSource && typeof dataSource === "string" && dataSource !== "datasource" ?
			dataLoader.getLoader<IDataSourceLake>(dataSource) : dataSource && typeof dataSource === "object" ? dataSource : null;
		designerMetadata = schema && schema.designerMetadata ? schema.designerMetadata : designerMetadata;
		if (this.props.transition) {
			this.props.transition({
				type: GridActions.State.GRID_INIT,
				typeId: schema && schema.typeId ? schema.typeId : typeId,
				gridSchemaId: schema && schema.gridSchemaId ? schema.gridSchemaId : gridSchemaId,
				gridSchema: gridSchema,
				filterText: schema && schema.filterText ? schema.filterText : filterText,
				idField: idField,
				customDatasource: designerMetadata && designerMetadata.datasource ? designerMetadata.datasource : customDataSource,
				selectedRecords: selectedRecords,
				rowSelectionMode: rowSelectionMode,
				canTriggerGridSelectedRows: canTriggerGridSelectedRows,
				context: context,
				queryParams: queryParams,
				maxItems: gridViewAttributes && gridViewAttributes.attributes && gridViewAttributes.attributes.maxItems ? gridViewAttributes.attributes.maxItems : null,
				pageContext: pageContext
			});
		}
	}

	getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	_paginationChange(page: number, incrementalAdd?: boolean) {
		this.props.currentPageChange(page);
		const { typeId, gridSchemaId } = this.getControlSchemaProperties();
		const { customDataSource, viewAttributes, renderCustomCell, sortingInfo } = this.props;
		const preAppliedFilter = viewAttributes.filter !== undefined ? viewAttributes.filter : {};
		const selectedRecords = incrementalAdd ? this.props.selectedRows : null;
		this.props.fetchDataServer(typeId, gridSchemaId, customDataSource, renderCustomCell, preAppliedFilter, selectedRecords, incrementalAdd, sortingInfo);
	}

	_sortingChange(sortingInfo: any) {
		const { typeId, gridSchemaId } = this.getControlSchemaProperties();
		const { customDataSource, viewAttributes, renderCustomCell, incrementalAdd } = (this.props as any);
		const preAppliedFilter = viewAttributes.filter !== undefined ? viewAttributes.filter : {};
		const selectedRecords = incrementalAdd ? this.props.selectedRows : null;
		this.props.fetchDataServer(typeId, gridSchemaId, customDataSource, renderCustomCell, preAppliedFilter, selectedRecords, incrementalAdd, sortingInfo);
	}

	onGridSelectedRows(event: any) {
		this.props.transition({
			type: "GRID_BEFORE_SELECTED_ROWS",
			selectedRows: event,
		});
	}

	onRowSelect(event: any) {
		const { onRowSelect, transition } = (this.props as any);
		const selectedRows = onRowSelect(event);

		if (typeof (selectedRows) === "object") {
			transition({
				type: "GRID_BEFORE_SELECTED_ROWS",
				selectedRows: event,
			});
		}
	}

	handleCellEdit(currentValue: IGridDataRecord, record: any) {
		const { editingRecords, uniquePropertyId } = this.props;
		const findRecord = editingRecords.find(t => t[uniquePropertyId] === record[uniquePropertyId]);
		const editingRecord = { ...record, ...findRecord, ...currentValue };
		this.props.transition({
			type: GridActions.State.GRID_BEFORE_EDIT,
			editingRecord: editingRecord,
		});
	}

	getCurrentFieldValueAndReadOnly(record: any, currentFields: any) {
		let value, isReadonly;
		const { editingRecords, uniquePropertyId } = this.props;
		const findObj = editingRecords.find(t => t[uniquePropertyId] === record[uniquePropertyId]);
		if (findObj && findObj[currentFields.id] !== null && findObj[currentFields.id] !== undefined) {
			value = typeof findObj[currentFields.id] === "object" ? findObj[currentFields.id].value : findObj[currentFields.id];
			isReadonly = typeof findObj[currentFields.id] === "object" ? findObj[currentFields.id].isReadonly : false;
		} else {
			value = typeof record[currentFields.id] === "object" ? record[currentFields.id].value : record[currentFields.id] ? record[currentFields.id] : "";
			isReadonly = typeof record[currentFields.id] === "object" ? record[currentFields.id].isReadonly : false;
		}

		return { value, isReadonly };
	}

	_renderCustomCellFields(currentFields: any, _text: any, record: any, gridStyle: string) {
		const { cellSchema } = currentFields;
		if (cellSchema.hasOwnProperty("ui:widget")) {
			const formikHandlers = {
				handleBlur: (_e, changedValue) => {
					const value: IGridDataRecord = { [cellSchema.id]: { value: changedValue, isReadonly: false } };
					this.handleCellEdit(value, record);
				},
				handleChange: (_e, changedValue) => {
					const value: IGridDataRecord = { [cellSchema.id]: { value: changedValue, isReadonly: false } };
					this.handleCellEdit(value, record);
				},
			};
			cellSchema["displayName"] = getLocaleString(cellSchema, "displayName");
			cellSchema["placeholderText"] = getLocaleString(cellSchema, "placeholderText");
			const currentValue = this.getCurrentFieldValueAndReadOnly(record, cellSchema);
			const controlSchema = {
				"name": cellSchema.id,
				"properties": {
					gridStyle,
					"ui:widget": cellSchema["ui:widget"],
					"fieldSchema": cellSchema,
					"value": currentValue.value,
					"isReadonly": currentValue.isReadonly ? currentValue.isReadonly : false,
					// formValues: props.values,
					...formikHandlers,
				},
			};
			return <SchemaContainer key={currentFields.id} schema={controlSchema} />;
		}

		return null;
	}

	onCustomButtonClick(action: any, record: any) {
		const { controlID } = this.getControlSchemaProperties();
		this.props.customButtonClick(action, record, controlID, this.props.schema.queryParams);
	}

	_getGridUIControlSchema() {
		const { typeId, gridViewType, gridViewAttributes, customGridViewId, emptyRecordsMessage, primaryColumn, className, pageContext } = this.getControlSchemaProperties();
		const gridUIControlSchema = {
			name: `grid-ui-control-${typeId}`,
			properties: {
				"ui:widget": "grid_control",
				data: this.props.data,
				getActions: this.getActions.bind(this),
				renderCustomCellFields: this._renderCustomCellFields.bind(this),
				viewAttributes: { ...this.props.viewAttributes, ...gridViewAttributes, ...gridViewType && { viewType: gridViewType }, ...customGridViewId && { customGridViewId }, ...emptyRecordsMessage && { emptyRecordsMessage }, ...primaryColumn && { primaryColumn } },
				selectedRows: this.props.selectedRows,
				currentPage: this.props.currentPage,
				pageInfo: this.props.pageInfo,
				customDataSource: this.props.customDataSource,
				filterText: this.props.filterText,
				renderCustomCell: this.props.renderCustomCell,
				summaryData: this.props.summaryData,
				onGridSelectedRows: this.props.rowSelectionMode === 0 ? null : this.props.onRowSelect ? this.onRowSelect.bind(this) : this.onGridSelectedRows.bind(this),
				customButtonClick: this.onCustomButtonClick.bind(this),
				paginationChange: this._paginationChange.bind(this),
				rowSelectionMode: this.props.rowSelectionMode,
				sortingChange: this._sortingChange.bind(this),
				sortingInfo: this.props.sortingInfo,
				className: this.props.className ? this.props.className : className,
				style: this.props.style,
				pageContext: pageContext
			},
		};

		return <SchemaContainer schema={gridUIControlSchema} />;
	}

	render() {
		if (!this.props.loaded) {
			return <span className="grid-loading">{getlocaleText("{{grid.init}}")}</span>;
		}
		if (this.props && !this.props.typeId) {
			return <span className="widgetError">{getlocaleText("{{widget.error}}")}</span>;
		}
		return (
			this._getGridUIControlSchema()
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		onGridInit: (event) => dispatch(doGridInit(event)),
		onGridLoad: (event) => dispatch(doGridLoad(event)),
		fetchDataServer: (typeId, gridSchemaId, customDataSource, renderCustomCell, preAppliedFilter, selectedRecords, incrementalAdd, sortingInfo) =>
			dispatch(onFetchDataServer(typeId, gridSchemaId, customDataSource, renderCustomCell, null, null, selectedRecords, incrementalAdd, preAppliedFilter, false, sortingInfo)),
		onGridRefresh: () => dispatch(doGridRefresh()),
		onGridBeforeSelectedRows: (event) => dispatch(doGridBeforeSelectedRows(event)),
		onGridSelectedRows: (event) => dispatch(doGridSelectedRows(event)),
		onGridSelectedRowsDone: (event) => dispatch(doGridSelectedRowsDone(event.selectedRows)),
		currentPageChange: (page) => dispatch(onCurrentPageChange(page)),
		customButtonClick: (action, record, controlID, queryParams) => dispatch(onCustomButtonExecuteCommand(action, record, controlID, queryParams)),
		onGridInitRowSummary: (event) => dispatch(doInitRowSummary(event.typeId, event.viewAttributes, event.datasource)),
		onGridFilter: (event) => dispatch(doGridFilter(event)),
		onGridGetState: (event) => dispatch(doGridGetState(event.onData)),
		onGridLoadDone: (event) => dispatch(doGridLoadDone(event)),
		onGridBeforeEdit: (event) => dispatch(doGridBeforeEdit(event)),
		onGridEdit: (event) => dispatch(doGridEdit(event)),
		onGridEndEdit: (event) => dispatch(doGridEndEdit(event)),
		onGridAfterEndEdit: (event) => dispatch(doGridAfterEndEdit(event)),
		onGridUpdateContext: (event) => dispatch(doGridUpdateContext(event.context)),
	};
};

const GridWidgetC = withReducer("GridWidget", reducer, mapDispatchToProps, stateJSON)(GridWidget);
GridWidgetC.displayName = "GridWidget";

WidgetsFactory.instance.registerFactory(GridWidgetC);
WidgetsFactory.instance.registerControls({
	grid: "GridWidget",
	'itsy:grid': "GridWidget"
});

export default GridWidgetC;