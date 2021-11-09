import { IEventArgs } from "@itsy-ui/core";

/* LoadingOverlay */
export interface ILoadingIndicatorEventArgs extends IEventArgs {
	loadingMessage: string;
}

export interface ILoadingOverlayStateProps {
	isLoading: boolean;
	loadingMessage: string;
}

export interface ILoadingOverlayStateTransitionProps {
	onShowLoadingIndicator: (event: ILoadingIndicatorEventArgs) => void;
	onUpdateLoadingIndicator: (event: ILoadingIndicatorEventArgs) => void;
	onHideLoadingIndicator: () => void;
}