export enum ICardTypes {
	avatar = "avatar",
	simple = "simple",
	media = "media",
	horizontal = "horizontal",
	complexInteraction = "complexInteraction",
	dynamic = "dynamic"
}

interface ICardWidgetBaseProps {
	cardId: string;
	cardViewProps: {};
	primaryValue: ICardValue;
	actions: any[];
	onCardSelect: (event: any, id: string, cardViewProps: any) => void;
	renderCell: (col: any, cellValue: any, id: any, cardViewProps: any) => any;
	executeCommand: (action: any, id: string, props: any, event: any) => any;
}

interface ICardWidgetMediaBaseProps {
	mediaSrc?: string;
	secondaryValue: ICardValue;
	tertiaryValue?: ICardValue;
}

interface ICardWidgetAvatarBaseProps {
	avatarSrc?: string;
	secondaryValue: ICardValue;
	tertiaryValue?: ICardValue;
}

export interface ISimpleCardWidgetProps extends ICardWidgetBaseProps {
	secondaryValue: ICardValue;
}

export type IAvatarCardWidgetProps = ICardWidgetBaseProps & ICardWidgetAvatarBaseProps;

export type IMediaCardWidgetProps = ICardWidgetBaseProps & ICardWidgetMediaBaseProps;

export type IHorizontalCardWidgetProps = ICardWidgetBaseProps & ICardWidgetMediaBaseProps;

export interface IComplexInteractionCardWidgetProps extends ICardWidgetBaseProps, ICardWidgetMediaBaseProps {
	avatarSrc?: string;
}

export interface ICardValue {
	column: any;
	value: string;
}
