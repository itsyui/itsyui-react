import { IEventArgs, IWidgetControlProps } from "@itsy-ui/core";

/**Grid Widget */

declare enum OperationType {
	OR = "||",
	AND = "&",
	EQUAL = "eq",
	NOTEQUAL = "ne",
	LESSERTHAN = "lt",
	LESSERTHANORQUAL = "le",
	GREATERTHAN = "gt",
	GREATERTHANOREQUAL = "ge",
	IN = "in",
	NOT = "not",
}

declare enum GridViewType {
	LIST = "list",
	CARD = "card",
	TABLE = "table"
}

declare enum RowSelectionMode {
	SINGLE = 1,
	MULTI = 2,
	NONE = 0
}

declare enum PropertyType {
	STRING = "string",
	INTEGER = "integer",
	DATETIME = "datetime",
	WIDGET = "widget"
}
export interface IGridControlSchema {
	name: string,
	properties: IGridControlSchemaProperties;
}
interface IGridControlSchemaProperties {
	"ui:widget": string;
	controlID?: string;
	typeId: string;
	gridSchemaId?: string;
	gridSchema?: IGridSchema;
	customDatasource?: string | any;
	selectedRecords?: [];
	rowSelectionMode?: RowSelectionMode
	queryParams?: {};
	emptyRecordsMessage?: string;
	primaryColumn?: string;
	customGridViewId?: string;
	context?: {};
	filterText?: IDefaultFilter;
	gridViewAttributes?: IGridViewAttributes;
	gridViewType?: GridViewType
}

interface IGridSchema {
	id?: string;
	displayName?: string;
	viewAttributes?: IGridViewAttributes;
	propertyDefinitions: IGridPropertyDefinitions;
}
interface IDefaultFilterValue {
	operation: OperationType;
	value: string;
}
interface IDefaultFilter {
	[columnName: string]: IDefaultFilterValue
}
interface ICustomActions {
	name: string;
	displayText: string;
	icon?: string;
	isPrimary?: string;
}
interface IGridCustomAction {
	title?: string;
	actions: ICustomActions[];
}
interface IGridViewAttributes {
	orderBy?: string;
	defaultFilter?: IDefaultFilter;
	viewType?: GridViewType;
	filterColumns?: string[];
	attributes?: {};
	customAction?: IGridCustomAction;
}
interface IGridPropertyDefinitionsValues {
	id: string;
	displayName: string;
	propertyType: PropertyType;
	isHidden?: boolean;
}
interface IGridPropertyDefinitions {
	[fieldId: string]: IGridPropertyDefinitionsValues;
}
export interface IGridInitEventArgs extends IEventArgs {
	typeId: string;
	gridSchemaId?: string;
	filterText?: string;
}

export interface IGridLoadEventArgs {
	typeId: string;
	gridSchemaId?: string;
	pageCount: string;
	skipCount: number;
	customDatasource?: any;
	renderCustomCell?: any;
	filterText?: string;
}

export interface IGridSelectedRowsEventArgs {
	selectedRows: any[];
}

export interface IGridInirRowSummaryEventArgs {
	typeId: string;
	viewAttributes: any;
	datasource: any;
}

export interface IGridFilterEventArgs {
	searchValue: string;
}

export interface IGridWidgetStateProps {
	typeId: string;
	data: any[];
	viewAttributes: { [key: string]: any };
	selectedRows: any[];
	currentPage: number;
	pageInfo: { [key: string]: any };
	customDataSource: {} | any;
	filterText: string;
	renderCustomCell: {} | any;
	summaryData: {} | null;
	rowSelectionMode: number;
	editingRecords: any[];
	uniquePropertyId: string;
	canTriggerGridSelectedRows: boolean;
	sortingInfo: any;
	onRowSelect: any;
	loaded: boolean;
	pageContext: any;
}

export interface IGridWidgetStateTransitionProps {
	onGridInit: (event: IGridInitEventArgs) => void;
	onGridLoad: (event: IGridLoadEventArgs) => void;
	onGridRefresh: () => void;
	onGridSelectedRows: (event: IGridSelectedRowsEventArgs) => void;
	onGridSelectedRowsDone: (event: IGridSelectedRowsEventArgs) => void;
	onGridInitRowSummary: (event: IGridInirRowSummaryEventArgs) => void;
	onGridFilter: (event: IGridFilterEventArgs) => void;
}

export interface IGridWidgetDispatchProps extends IWidgetControlProps {
	fetchDataServer: (typeId: string, gridSchemaId: string, customDataSource: any, renderCustomCell: any, preAppliedFilter: any, selectedRecords: any[], incrementalAdd: boolean, sortingInfo?: any) => void;
	currentPageChange: (page: number) => void;
	customButtonClick: (action: {}, record: {}, ...args) => void;
}

export interface IGridCellValue {
	value: any;
	isReadonly: boolean;
}

export interface IGridDataRecord {
	[propName: string]: any | IGridCellValue;
}