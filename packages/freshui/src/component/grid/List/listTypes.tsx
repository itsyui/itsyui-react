export enum IListTypes {
	simpleVertical = "simpleVertical",
	simpleHorizontal = "simpleHorizontal",
	complexInteraction = "complexInteraction",
}

export interface IListValue {
	column: any;
	value: any;
}

interface IListWidgetBaseProps {
	listId: string;
	listViewProps: {};
	gridStyle: string;
	primaryValue: IListValue;
	secondaryValue?: IListValue;
	actions?: any[];
	row: any;
	index: any;
	onListSelect: (event: any, id: string, listViewProps: any) => void;
	renderCell: (column: any, row: any, listAttr: string, classes: any, props: any, primaryValue?: any) => any;
	executeCommand: (action: any, id: string, props: any, event: any) => any;
}

interface IListWidgetAvatarBaseProps {
	avatarValue?: IListValue;
}

export interface IAdditionalColumnValue {
	propertyDefinitions: string[];
}
export type ISimpleVerticalListWidgetProps = IListWidgetBaseProps & IListWidgetAvatarBaseProps;

export interface ISimpleHorizontalListWidgetProps extends IListWidgetBaseProps, IListWidgetAvatarBaseProps {
	tertiaryValue?: IListValue;
}

export interface IComplexInteractionListWidgetProps extends IListWidgetBaseProps, IListWidgetAvatarBaseProps {
	additionalColumns?: IAdditionalColumnValue[];
	getColumnData: (row: any, columns: any, columnName: string) => any;
}
