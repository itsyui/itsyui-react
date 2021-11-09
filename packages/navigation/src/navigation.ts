import { IWidgetControlProps, IEventArgs } from "@itsy-ui/core";

/* Drawer */
interface IControlSchema {
	name: string;
	properties: IControlSchemaProperties;
}

interface IControlSchemaProperties {
	"ui:widget": string;
	controlID?: string;
	[key: string]: any;
}

export interface IDrawerData {
	title: string;
	width?: number;
	showOK?: boolean;
	showCancel?: boolean;
	okText?: string | any;
	cancelText?: string | any;
	fillContent?: boolean;
	controlSchema: IControlSchema;
	onOKTransition: { [key: string]: any };
	onCancelTransition: { [key: string]: any };
	customState: { [key: string]: any };
	onOk?: () => void;
	onCancel?: () => void;
	showCloseButton?: boolean;
	isToggleSize?: boolean;
}
export interface IShowDrawerEventArgs extends IEventArgs {
	type: string;
	title: string;
	width: string;
	showOK?: boolean;
	showCancel?: boolean;
	okText?: string | any;
	cancelText?: string | any;
	fillContent?: boolean;
	controlSchema: { [key: string]: any };
	onOKTransition: { [key: string]: any };
	onCancelTransition: { [key: string]: any };
	customState: { [key: string]: any };
}

export interface IDrawerStateProps {
	stackDrawerData: { [key: string]: any };
	stackDrawerLevel: number;
}

export interface IDrawerStateTransitionProps {
	onShowDrawer: (event: any) => void;
	onHideDrawer: () => void;
	onToggleSize: () => void;
}

/* Modal */
export interface IModalData {
	title: string,
	controlSchema: IControlSchema;
	okText?: string;
	cancelText?: string;
	onOKTransition?: { [key: string]: any };
	onCancelTransition?: { [key: string]: any };
	showOKButton?: boolean;
	showCancelButton?: boolean;
	showCloseButton?: boolean;
	customState?: { [key: string]: any };
	width?: number;
	onOk?: () => void;
	onCancel?: () => void;
}

export interface IShowModalEventArgs extends IEventArgs {
	title: string;
	controlSchema: { [key: string]: any };
	onOKTransition: { [key: string]: any };
	onCancelTransition: { [key: string]: any };
	customState: { [key: string]: any };
	width: string;
	fillContent: any;
	showOK: boolean;
	showCancel: boolean;
	okText: string;
	cancelText: string;
	onOk: any;
	onCancel: any;
	showCloseButton: boolean;
	isToggleSize?: boolean;
}

export interface IModalStateProps {
	modalData: { [key: string]: any };
	customState: { [key: string]: any };
	transition: any;
}

export interface IModalStateTransitionProps {
	onShowModal: (event: any) => void;
	onHideModal: () => void;
}

/* Popup */
declare enum PopupType {
	ALERT = 1,
	CONFIRM = 2
}
export interface IPopupData {
	popupMessage: string;
	popupType?: PopupType;
	onOk: () => void | string;
	onCancel: () => void | string;
	showCloseButton: string;
	title: string
}
export interface IShowPopupEventArgs {
	popupMessage: string;
	popupType: number;
	onOk: { [key: string]: any };
	onCancel: { [key: string]: any };
}

export interface IPopupStateProps extends IEventArgs {
	popupDetails: { [key: string]: any };
	customState: { [key: string]: any };
	transition: any;
}

export interface IPopupStateTransitionProps {
	onShowPopup: (event: any) => void;
	onHidePopup: () => void;
}

/* Toolbar Widget */
export interface IToolbarControlSchema {
	name: string;
	properties: IToolbarControlSchemaProperties;
}

interface IToolbarControlSchemaProperties {
	"ui:widget": string;
	controlID?: string;
	typeId?: string;
	contextParams?: {};
	data: IToolbarItems[];
}

interface IToolbarItems {
	name: string;
	displayText: string;
	icon?: string;
	isPrimary?: boolean;
}

export interface IToolbarInitEventArgs extends IEventArgs {
	items: any[];
	typeId: string;
}

interface IToolbarRefreshParams {
	contextPath: any;
	context: any;
}

interface IToolbarRefreshEventArgs extends IEventArgs {
	items: any[];
	params: IToolbarRefreshParams;
}

export interface IToolbarWidgetStateProps {
	items: any[];
	typeId: string;
	contextParams: any;
	loaded: boolean;
}

export interface IToolbarStateTransitionProps {
	onToolbarInit: (evt: IToolbarInitEventArgs) => void;
	onToolbarRefresh: (evt: IEventArgs) => void;
	onToolbarCommandExecute: (evt: IEventArgs) => void;
}

export interface IToolbarInitEventArgs extends IEventArgs {
	items: any[];
	typeId: string;
}

export interface IToolbarWidgetDispatchProps extends IWidgetControlProps {
	initToolbar: (typeId: string, contextParams: any) => void;
	onToolbarBeforeInit: (evt: any) => void;
	onToolbarInit: (evt: any) => void;
	onToolbarRefresh: (evt) => (evt: any) => void;
	onToolbarCommandExecute: (evt) => (evt: any) => void;
}

/* Navbar Widget */
export interface INavbarControlSchema {
	name: string;
	properties: INavbarControlSchemaProperties;
}

interface INavbarControlSchemaProperties {
	"ui:widget": string;
	controlID?: string;
	data?: INavbarSchema;
}

interface INavbarSchema {
	items: INavbarSchemaItems[];
	rightItems: INavbarSchemaItems[];
}

interface INavbarSchemaItems {
	id: string;
	title: string;
	isPrimary?: boolean;
	"ui:widget?": string;
	url?: string;
}

interface INavbarItemClickEventArgs extends IEventArgs {
	data: { [key: string]: any };
}

interface INavbarRefreshEventArgs extends IEventArgs {
	data: { [key: string]: any };
}

interface INavbarCommandExecute extends IEventArgs {
	data: { [key: string]: any };
}

export interface INavbarWidgetStateProps {
	data: { [key: string]: any };
	selectedItems: any[];
}

export interface INavbarWidgetDispatchProps extends IWidgetControlProps {
	navItemClick: (data: any) => void;
}

export interface INavbarWidgetStateTransitionProps {
	onNavbarInit: () => void;
	onNavbarRefresh: (event: INavbarRefreshEventArgs) => void;
	onNavbarCommandExecute: (event: INavbarCommandExecute) => void;
}

/* Sidebar Widget */
export interface ISidebarControlSchema {
	name: string;
	properties: {}
}

interface ISidebarControlSchemaProperties {
	"ui:widget": string;
	controlID?: string;
	data?: ISidebarSchema
}

interface ISidebarSchema {
	default: ISidebarSchemaValue[];
	[SidebarId: string]: ISidebarSchemaValue[];
}

interface ISidebarSchemaValue {
	id: string;
	title: string;
	childUrl?: string[];
	className?: string;
	url?: string;
	order?: number | string;
	roles?: string[];
	children?: ISidebarSchemaValue[];
	appIcon?: string;
	icon?: string;
}

interface ISidebarRefreshEventArgs extends IEventArgs {
	sidebarId?: string
}

interface ISidebarCommandExecuteEventArgs extends IEventArgs {
	sidebarId?: string
}
export interface ISiderbarStateProps {
	data: any[],
	selectedKey: any[],
	isExpand: boolean,
}

export interface ISidebarWidgetDispatchProps extends IWidgetControlProps {
	selectSidebarMenuKey: (data: any) => void;
}

export interface ISidebarWidgetStateTransitionProps {
	onSidebarInit: () => void;
	onSidebarRefresh: (event: ISidebarRefreshEventArgs) => void;
	onSidebarCommandExecute: (event: ISidebarCommandExecuteEventArgs) => void;
}

export interface INavbarAppIconStateUpdate {
	navbarLoad: () => void;
}

/* Tabs Widget */
interface ITabsControlSchema {
	name: string;
	properties: ITabsControlSchemaProperties;
}

interface ITabsControlSchemaProperties {
	"ui:widget": string;
	controlID?: string;
	tabItems: ITabsItems[];
}

interface ITabsItems {
	title: string;
	name: string;
	content: ITabItemContent;
}

interface ITabItemContent {
	"ui:widget": string;
	controlID?: string;
	contextPath?: {}
	[key: string]: any
}

interface ITabsInitEventArgs extends IEventArgs {
	typeId: string;
	schemaId: string;
	objectData: string;
	relationshipViews: any[];
}

interface ITabsLoadsEventArgs extends IEventArgs {
	data: any;
}

interface ITabsBeforeAddNewTabEventArgs extends IEventArgs {
	previousTabs: any[];
}

interface ITabsAddNewTabAndCloseCurrentTabEventArgs extends IEventArgs {
	Tabs: any[];
	activeKey: string;
}

interface ITabsActiveTabChangeEventArgs extends IEventArgs {
	activeKey: string;
}

export interface ITabsWidgetStateProps {
	tabs: any[];
	data: any[];
	activeKey: string;
	transition: any;
}

export interface ITabsStateTransitionProps {
	onTabsInit: (event: ITabsInitEventArgs) => void;
	onTabsLoad: (event: ITabsLoadsEventArgs) => void;
	onTabsBeforeAddNewTab: (event: ITabsBeforeAddNewTabEventArgs) => void;
	onTabsAddNewTab: (event: ITabsAddNewTabAndCloseCurrentTabEventArgs) => void;
	onTabsActiveTabChange: (event: ITabsActiveTabChangeEventArgs) => void;
	onTabsCloseCurrentTab: (event: ITabsAddNewTabAndCloseCurrentTabEventArgs) => void;
}
