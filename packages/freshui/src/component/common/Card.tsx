import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, SchemaContainer, WidgetsFactory, withReducer } from "@itsy-ui/core";
import * as React from "react";
import { Card } from 'react-bootstrap';
const Actions = {
	Type: {
		Simple: "simple",
		WithAvatar: "withAvatar",
		FlowletCard: "FlowletCard",
	},
};

const avatarTitle = (title) => {
	let name = "";
	if (title) {
		const letterCount = 2;
		const splitedTitle = title.split(" ");
		splitedTitle && splitedTitle.length > 0 && splitedTitle.forEach((element, index) => {
			if (letterCount > index) {
				name += element[0];
			}
		});
		return name.toUpperCase();
	}
	return name;
};

class CardComponent extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		const { title, secondaryTitle, cardType, items } = this.props.data;
		const { className, style } = this.props.schema;
		const AvatarIconControlSchema = {
			"name": "AvatarIcon",
			"properties": {
				"ui:widget": "avatar_icon_control",
				value: title,
				isLocal: true,
			},
		};
		switch (cardType) {
			case Actions.Type.Simple:
				return (<div className={className ? className : ""} style={style ? style : {}}>
					<Card className="cards-simple-type">
						<Card.Header as="h6" >{title}</Card.Header>
						<Card.Body>
							<Card.Text>
								{secondaryTitle}
							</Card.Text>
						</Card.Body>
					</Card>
				</div>
				);
			case Actions.Type.WithAvatar:
				return (<div className={className ? className : ""} style={style ? style : {}}>
					<Card className="cards-avatar">
						<Card.Header as="h6" style={{ display: "flex" }} >
							<div>
								{<SchemaContainer schema={AvatarIconControlSchema} />}
							</div>
							<div className="Av-title-card">
								{title}
							</div>
						</Card.Header>
						<Card.Body>
							<Card.Text>
								{secondaryTitle}
							</Card.Text>
						</Card.Body>
					</Card>
				</div>
				);
		}
	}
}

const initialState = {
	expanded: false,
	headerExpanded: false,
};
class CardUIControl extends React.Component<IWidgetControlProps, {}> {

	_getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	handleCardClick(item) {
		const { handleNavigateTo } = this._getControlSchemaProperties();
		handleNavigateTo(item);
	}

	render() {
		const { data, className, style } = this._getControlSchemaProperties();
		return <>
			<CardComponent
				data={data}
				className={className}
				style={style}
				{...this.props}
			/>
		</>;
	}
}

function doDescriptionClick() {
	return (_, dispatch, transition: any) => {
		dispatch({
			type: "CARD_EXPANDED",
		});
	}
}
function doHeaderClick() {
	return (_, dispatch, transition: any) => {
		dispatch({
			type: "HEADER_EXPANDED",
		});
	}
}
function reducer(state: any, action: any) {
	switch (action.type) {
		case "CARD_EXPANDED":
			return {
				...state,
				expanded: !state.expanded
			};
		case "HEADER_EXPANDED":
			return {
				...state,
				headerExpanded: !state.headerExpanded
			};
		default:
			return state === undefined ? initialState :
				Object.keys(state).length === 0 ? initialState : state;
	}
}
const mapDispatchToProps = (dispatch) => {
	return {
		onDescriptionClick: () => dispatch(doDescriptionClick()),
		onHeaderClick: () => dispatch(doHeaderClick())
	};
};
const cardControl = withReducer('CardUIControl', reducer, mapDispatchToProps)(CardUIControl);
cardControl.displayName = 'CardUIControl';

WidgetsFactory.instance.registerFactory(cardControl);
WidgetsFactory.instance.registerControls({
	card_control: "CardUIControl",
	'itsy:ui:card': "CardUIControl"
});
