import { IEventArgs, IWidgetControlProps } from "@itsy-ui/core";

export interface IToolbarInitEventArgs extends IEventArgs {
	items: any[];
	typeId: string;
}

export interface IToolbarRefreshParams {
	contextPath: any;
	context: any;
}

export interface IToolbarRefreshEventArgs extends IEventArgs {
	items: any[];
	params: IToolbarRefreshParams;
}

export interface IToolbarWidgetStateProps {
	items: any[];
	typeId: string;
	contextParams: any;
}

export interface IToolbarWidgetDispatchProps extends IWidgetControlProps {
	initToolbar: (typeId: string, contextParams: any) => void;
}

export interface IToolbarStateTransitionProps {
	onToolbarInit: (evt: IToolbarInitEventArgs) => void;
	onToolbarRefresh: (evt: IEventArgs) => void;
	onToolbarCommandExecute: (evt: IEventArgs) => void;
}
